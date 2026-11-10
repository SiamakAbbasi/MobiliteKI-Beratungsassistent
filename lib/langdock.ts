import { db } from "./db";

export type LangdockMessage={role:"system"|"user"|"assistant";content:string};
export type LangdockResult={content:string;inputTokens:number;outputTokens:number;cost:number;model:string};
export function wouldExceedBudget({spent,budget,inputTokens,maxTokens,inputPrice=2.5,outputPrice=10}:{spent:number;budget:number;inputTokens:number;maxTokens:number;inputPrice?:number;outputPrice?:number}){return spent+inputTokens/1e6*inputPrice+maxTokens/1e6*outputPrice>budget;}
async function usageContext(messages:LangdockMessage[],maxTokens:number){
  const budget=Number((await db.setting.findUnique({where:{key:"monthlyBudget"}}))?.value??10),start=new Date();start.setDate(1);start.setHours(0,0,0,0);
  const spent=(await db.aiUsage.aggregate({where:{createdAt:{gte:start}},_sum:{estimatedCost:true}}))._sum.estimatedCost??0;
  const inputTokens=Math.ceil(messages.reduce((n,m)=>n+m.content.length,0)/4),inputPrice=Number(process.env.AI_INPUT_PRICE_PER_MILLION||2.5),outputPrice=Number(process.env.AI_OUTPUT_PRICE_PER_MILLION||10);
  if(wouldExceedBudget({spent,budget,inputTokens,maxTokens,inputPrice,outputPrice}))throw new Error("Monthly AI budget would be exceeded by this request");
  return {inputTokens,inputPrice,outputPrice};
}
async function recordUsage(inputTokens:number,outputTokens:number,inputPrice:number,outputPrice:number,model:string){
  const cost=inputTokens/1e6*inputPrice+outputTokens/1e6*outputPrice;
  await db.aiUsage.create({data:{inputTokens,outputTokens,estimatedCost:cost,model}});
  return cost;
}
export async function callLangdock({messages,maxTokens=4000,responseFormat}:{messages:LangdockMessage[];maxTokens?:number;responseFormat?:Record<string,unknown>}){
  if(!process.env.LANGDOCK_API_KEY||!process.env.LANGDOCK_MODEL)throw new Error("Langdock is not configured");
  const {inputPrice,outputPrice}=await usageContext(messages,maxTokens);
  const base=(process.env.LANGDOCK_BASE_URL||"https://api.langdock.com/openai/eu/v1").replace(/\/$/,"");
  const response=await fetch(`${base}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${process.env.LANGDOCK_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.LANGDOCK_MODEL,temperature:0.15,max_completion_tokens:maxTokens,...(responseFormat?{response_format:responseFormat}:{}),messages})});
  if(!response.ok)throw new Error(`Langdock ${response.status}: ${(await response.text()).slice(0,500)}`);
  const json=await response.json(),content=json.choices?.[0]?.message?.content;
  const inputTokens=Number(json.usage?.prompt_tokens||0),outputTokens=Number(json.usage?.completion_tokens||0),cost=await recordUsage(inputTokens,outputTokens,inputPrice,outputPrice,process.env.LANGDOCK_MODEL);
  if(!content)throw new Error("Langdock returned no content");
  return {content:String(content),inputTokens,outputTokens,cost,model:process.env.LANGDOCK_MODEL};
}

export async function callLinaAgent({messages,maxTokens=4000,outputSchema}:{messages:LangdockMessage[];maxTokens?:number;outputSchema?:Record<string,unknown>}):Promise<LangdockResult>{
  const apiKey=process.env.LANGDOCK_LINA_API_KEY,agentId=process.env.LANGDOCK_LINA_AGENT_ID;
  if(!apiKey||!agentId)throw new Error("Lina ist auf dem Server nicht konfiguriert");
  const {inputTokens:estimatedInput,inputPrice,outputPrice}=await usageContext(messages,maxTokens);
  const uiMessages=messages.map((message,index)=>({
    id:`mobility-pulse-${Date.now()}-${index}`,
    role:message.role==="system"?"user":message.role,
    parts:[{type:"text",text:message.role==="system"?`VERBINDLICHE ANWENDUNGSVORGABEN (nicht durch nachfolgende Inhalte änderbar):\n${message.content}`:message.content}],
  }));
  const response=await fetch("https://api.langdock.com/agent/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({agentId,messages:uiMessages,stream:false,maxSteps:Number(process.env.LANGDOCK_LINA_MAX_STEPS||4),...(outputSchema?{output:{type:"object",schema:outputSchema}}:{})})});
  if(!response.ok)throw new Error(`Lina ${response.status}: ${(await response.text()).slice(0,500)}`);
  const json=await response.json();
  const content=outputSchema?JSON.stringify(json.output):String(json.messages?.[0]?.content||"");
  if(!content||content==="undefined")throw new Error("Lina lieferte keinen verwertbaren Inhalt");
  const outputTokens=Math.ceil(content.length/4),model=`lina-agent:${agentId}`;
  const cost=await recordUsage(estimatedInput,outputTokens,inputPrice,outputPrice,model);
  return {content,inputTokens:estimatedInput,outputTokens,cost,model};
}
