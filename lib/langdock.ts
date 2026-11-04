import { db } from "./db";

export type LangdockMessage={role:"system"|"user"|"assistant";content:string};
export function wouldExceedBudget({spent,budget,inputTokens,maxTokens,inputPrice=2.5,outputPrice=10}:{spent:number;budget:number;inputTokens:number;maxTokens:number;inputPrice?:number;outputPrice?:number}){return spent+inputTokens/1e6*inputPrice+maxTokens/1e6*outputPrice>budget;}
export async function callLangdock({messages,maxTokens=4000,responseFormat}:{messages:LangdockMessage[];maxTokens?:number;responseFormat?:Record<string,unknown>}){
  if(!process.env.LANGDOCK_API_KEY||!process.env.LANGDOCK_MODEL)throw new Error("Langdock is not configured");
  const budget=Number((await db.setting.findUnique({where:{key:"monthlyBudget"}}))?.value??10),start=new Date();start.setDate(1);start.setHours(0,0,0,0);
  const spent=(await db.aiUsage.aggregate({where:{createdAt:{gte:start}},_sum:{estimatedCost:true}}))._sum.estimatedCost??0;
  const estimatedInput=Math.ceil(messages.reduce((n,m)=>n+m.content.length,0)/4),inputPrice=Number(process.env.AI_INPUT_PRICE_PER_MILLION||2.5),outputPrice=Number(process.env.AI_OUTPUT_PRICE_PER_MILLION||10);
  if(wouldExceedBudget({spent,budget,inputTokens:estimatedInput,maxTokens,inputPrice,outputPrice}))throw new Error("Monthly AI budget would be exceeded by this request");
  const base=(process.env.LANGDOCK_BASE_URL||"https://api.langdock.com/openai/eu/v1").replace(/\/$/,"");
  const response=await fetch(`${base}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${process.env.LANGDOCK_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.LANGDOCK_MODEL,temperature:0.15,max_completion_tokens:maxTokens,...(responseFormat?{response_format:responseFormat}:{}),messages})});
  if(!response.ok)throw new Error(`Langdock ${response.status}: ${(await response.text()).slice(0,500)}`);
  const json=await response.json(),content=json.choices?.[0]?.message?.content;
  const inputTokens=Number(json.usage?.prompt_tokens||0),outputTokens=Number(json.usage?.completion_tokens||0),cost=inputTokens/1e6*inputPrice+outputTokens/1e6*outputPrice;
  await db.aiUsage.create({data:{inputTokens,outputTokens,estimatedCost:cost,model:process.env.LANGDOCK_MODEL}});
  if(!content)throw new Error("Langdock returned no content");
  return {content:String(content),inputTokens,outputTokens,cost,model:process.env.LANGDOCK_MODEL};
}
