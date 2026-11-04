import { db } from "../lib/db";
import { generateAdvisorReport } from "../lib/advisor";

const POLL_MS=2_000;
let stopping=false;
process.on("SIGINT",()=>{stopping=true});
process.on("SIGTERM",()=>{stopping=true});

async function claimNext(){
  const now=new Date();
  const candidate=await db.advisorReport.findFirst({where:{OR:[{status:"PENDING"},{status:"RUNNING",leaseExpiresAt:{lt:now}}],attemptCount:{lt:2}},orderBy:{createdAt:"asc"}});
  if(!candidate)return null;
  const claimed=await db.advisorReport.updateMany({where:{id:candidate.id,updatedAt:candidate.updatedAt},data:{status:"RUNNING",leaseExpiresAt:new Date(Date.now()+5*60_000)}});
  return claimed.count===1?candidate:null;
}

async function work(){
  while(!stopping){
    const job=await claimNext();
    if(!job){await new Promise(resolve=>setTimeout(resolve,POLL_MS));continue;}
    try{await generateAdvisorReport(job.itemId);}catch(error){console.error(`[advisor-worker] ${job.id}:`,error instanceof Error?error.message:error);}
  }
  await db.$disconnect();
}

work().catch(async error=>{console.error("[advisor-worker] fatal:",error);await db.$disconnect();process.exit(1)});
