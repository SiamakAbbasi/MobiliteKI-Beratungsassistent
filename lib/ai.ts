import { z } from "zod";
import { db } from "./db";
import { assessOpportunity } from "./opportunity-classifier";
import { companyProfiles } from "./company-profiles";

const analysisSchema = z.object({
  relevant: z.boolean(),
  category: z.enum(["NEWS","OPERATIONAL_ISSUE","STRATEGIC_ISSUE","POLICY_REGULATION","BUSINESS_OPPORTUNITY"]),
  summary: z.string().max(700), city: z.string().nullable(), federalState: z.string().nullable(),
  latitude: z.number().min(47).max(55.2).nullable(), longitude: z.number().min(5.5).max(15.5).nullable(),
  explanation: z.string().max(1200), relevanceScore: z.number().min(0).max(100),
  businessOpportunity: z.string().nullable(), recommendedAction: z.string().nullable()
});

const categoryAliases: Record<string, z.infer<typeof analysisSchema>["category"]> = {
  NEWS:"NEWS", OPERATIONAL_ISSUE:"OPERATIONAL_ISSUE", "OPERATIONAL ISSUE":"OPERATIONAL_ISSUE",
  STRATEGIC_ISSUE:"STRATEGIC_ISSUE", "STRATEGIC ISSUE":"STRATEGIC_ISSUE", POLICY:"POLICY_REGULATION",
  POLICY_REGULATION:"POLICY_REGULATION", "POLICY & REGULATION":"POLICY_REGULATION",
  BUSINESS_OPPORTUNITY:"BUSINESS_OPPORTUNITY", "BUSINESS OPPORTUNITY":"BUSINESS_OPPORTUNITY",
};

const textOrNull = (value: unknown) => value == null ? null : Array.isArray(value) ? value.map(String).join("; ") : String(value);
const issueSignal=/ausfall|störung|verspät|beschwerde|defizit|finanzierungslücke|personalmangel|restruktur|reorganisation|krise|problem|unzuverläss|kapazitätsengpass|kostensteiger/i;
const policySignal=/gesetz|verordnung|regulier|reform|ministerium|bundestag|landtag|förderprogramm|finanzierung|deutschlandticket|tarif|governance|beschluss/i;
const opportunitySignal=/ausschreibung|vergabe|tender|beratung|studie|gutachten|konzept|strategie|optimier|machbarkeits/i;
export function discoveryCandidate(input:{title:string;content:string}){const text=`${input.title}\n${input.content}`;return issueSignal.test(text)||policySignal.test(text)||opportunitySignal.test(text);}
export function discoveryTags(input:{title:string;content:string},category:string){const text=`${input.title}\n${input.content}`,tags=new Set<string>(category==="NEWS"?[]:[category]);if(issueSignal.test(text))tags.add("STRATEGIC_ISSUE");if(policySignal.test(text))tags.add("POLICY_REGULATION");if(category==="BUSINESS_OPPORTUNITY")tags.add("BUSINESS_OPPORTUNITY");return [...tags];}
function normalizeAnalysis(raw: Record<string, unknown>) {
  const categoryKey=String(raw.category||"NEWS").trim().toUpperCase().replaceAll("-","_");
  const category=categoryAliases[categoryKey]||"NEWS";
  const relevanceScore=Math.max(0,Math.min(100,Number(raw.relevanceScore)||0));
  const businessOpportunity=textOrNull(raw.businessOpportunity);
  const relevant=Boolean(raw.relevant)&&relevanceScore>=60&&(category!=="BUSINESS_OPPORTUNITY"||(relevanceScore>=70&&Boolean(businessOpportunity)));
  return analysisSchema.parse({
    relevant, category, summary:String(raw.summary||"").slice(0,700),
    city:textOrNull(raw.city), federalState:textOrNull(raw.federalState),
    latitude:typeof raw.latitude==="number"?raw.latitude:null, longitude:typeof raw.longitude==="number"?raw.longitude:null,
    explanation:String(raw.explanation||"").slice(0,1200), relevanceScore,
    businessOpportunity, recommendedAction:textOrNull(raw.recommendedAction),
  });
}

export const aiConfigured = () => Boolean(process.env.LANGDOCK_API_KEY && process.env.LANGDOCK_MODEL);

export async function analyzeItem(input: { title: string; content: string; url: string }) {
  if (!aiConfigured()) return null;
  const assessment=assessOpportunity(input);
  if(!assessment.relevant&&!discoveryCandidate(input))return {relevant:false,category:"NEWS" as const,categoryTags:[],summary:input.content.slice(0,500),city:null,federalState:null,latitude:null,longitude:null,explanation:assessment.reason,relevanceScore:0,businessOpportunity:null,recommendedAction:null,assessment};
  const budget = Number((await db.setting.findUnique({ where: { key: "monthlyBudget" } }))?.value ?? 10);
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
  const spent = (await db.aiUsage.aggregate({ where: { createdAt: { gte: start } }, _sum: { estimatedCost: true } }))._sum.estimatedCost ?? 0;
  if (spent >= budget) throw new Error("Monthly AI budget reached");
  const base = (process.env.LANGDOCK_BASE_URL || "https://api.langdock.com/openai/eu/v1").replace(/\/$/, "");
  const response = await fetch(`${base}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${process.env.LANGDOCK_API_KEY}`, "Content-Type":"application/json" }, body: JSON.stringify({
    model: process.env.LANGDOCK_MODEL, temperature: 0.1, max_completion_tokens: 2500,
    response_format: { type: "json_schema", json_schema: { name:"mobility_analysis", strict:true, schema:{type:"object",additionalProperties:false,required:["relevant","category","summary","city","federalState","latitude","longitude","explanation","relevanceScore","businessOpportunity","recommendedAction"],properties:{relevant:{type:"boolean"},category:{type:"string",enum:["NEWS","OPERATIONAL_ISSUE","STRATEGIC_ISSUE","POLICY_REGULATION","BUSINESS_OPPORTUNITY"]},summary:{type:"string"},city:{type:["string","null"]},federalState:{type:["string","null"]},latitude:{type:["number","null"]},longitude:{type:["number","null"]},explanation:{type:"string"},relevanceScore:{type:"number",minimum:0,maximum:100},businessOpportunity:{type:["string","null"]},recommendedAction:{type:["string","null"]}}} } },
    messages: [
      { role:"system", content:`Analyze German transport intelligence for business development. A news item is not a business opportunity unless a documented need credibly maps to a verified consulting capability. Confirmed tenders require procurement evidence. Never invent facts, customers, deadlines, budgets, references, URLs or locations. Coordinates only when explicit and confidently known. Verified profiles: ${companyProfiles.map(p=>`${p.name}: ${p.capabilities.join("; ")}`).join(" | ")}. Return only the requested JSON.` },
      { role:"user", content:`Source URL: ${input.url}\nTitle: ${input.title}\nContent: ${input.content.slice(0,12000)}` }
    ]
  }) });
  if (!response.ok) throw new Error(`Langdock ${response.status}: ${await response.text()}`);
  const json = await response.json();
  const content=json.choices?.[0]?.message?.content;
  const usage = json.usage || {};
  const inputTokens = usage.prompt_tokens || 0, outputTokens = usage.completion_tokens || 0;
  const cost = inputTokens / 1e6 * Number(process.env.AI_INPUT_PRICE_PER_MILLION || 2.5) + outputTokens / 1e6 * Number(process.env.AI_OUTPUT_PRICE_PER_MILLION || 10);
  await db.aiUsage.create({ data: { inputTokens, outputTokens, estimatedCost: cost, model: process.env.LANGDOCK_MODEL! } });
  if(!content)throw new Error("Langdock lieferte keinen strukturierten Analyseinhalt");
  const parsed = normalizeAnalysis(JSON.parse(content));
  return {...parsed,categoryTags:discoveryTags(input,parsed.category),assessment};
}
