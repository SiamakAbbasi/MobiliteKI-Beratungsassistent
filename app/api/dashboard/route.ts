import { NextResponse } from "next/server"; import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){
 const [discoveries,items,sources,lastScan,settings,usage,companyProfiles,processing]=await Promise.all([
  db.discovery.findMany({where:{active:true,OR:[{category:{not:"NEWS"}},{categoryTagsJson:{not:"[]"}}]},include:{companyMatches:true,item:{include:{source:true,sourceReferences:{include:{source:true},orderBy:{publishedAt:"asc"}},advisorReports:{select:{status:true,createdAt:true,updatedAt:true},orderBy:[{updatedAt:"desc"},{createdAt:"desc"}],take:1}}}},orderBy:{createdAt:"desc"}}),db.item.count(),db.source.findMany({orderBy:{createdAt:"desc"}}),db.scanRun.findFirst({orderBy:{startedAt:"desc"}}),db.setting.findMany(),db.aiUsage.findMany({where:{createdAt:{gte:new Date(new Date().getFullYear(),new Date().getMonth(),1)}}}),db.companyProfile.findMany({where:{active:true},orderBy:{name:"asc"}}),db.item.groupBy({by:["discoveryStatus"],_count:true})
 ]);
 return NextResponse.json({discoveries,items,sources,lastScan,companyProfiles,processing:Object.fromEntries(processing.map(x=>[x.discoveryStatus,x._count])),settings:Object.fromEntries(settings.map(s=>[s.key,s.value])),usage:{cost:usage.reduce((n,u)=>n+u.estimatedCost,0),input:usage.reduce((n,u)=>n+u.inputTokens,0),output:usage.reduce((n,u)=>n+u.outputTokens,0)},aiKonfiguriert:Boolean(process.env.LANGDOCK_API_KEY&&process.env.LANGDOCK_MODEL)});
}
