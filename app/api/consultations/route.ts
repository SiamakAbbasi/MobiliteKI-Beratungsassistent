import {db} from "@/lib/db";
export const dynamic="force-dynamic";

export async function GET(request:Request){
 const params=new URL(request.url).searchParams,page=Math.max(1,Number(params.get("page"))||1),pageSize=Math.min(50,Math.max(1,Number(params.get("pageSize"))||10)),query=(params.get("query")||"").trim().toLocaleLowerCase("de-DE"),status=params.get("status")||"";
 const reports=await db.advisorReport.findMany({include:{item:{select:{id:true,title:true,publishedAt:true,source:{select:{name:true}}}},messages:{select:{createdAt:true},orderBy:{createdAt:"desc"},take:1},_count:{select:{messages:true}}},orderBy:[{updatedAt:"desc"},{createdAt:"desc"}]});
 const seen=new Set<string>(),canonical=reports.filter(report=>{const key=`${report.itemId}:${report.provider}`;if(seen.has(key))return false;seen.add(key);return true}).map(report=>({id:report.id,itemId:report.itemId,provider:report.provider,title:report.item.title,publisher:report.item.source.name,articlePublishedAt:report.item.publishedAt,createdAt:report.createdAt,lastActivityAt:report.messages[0]?.createdAt&&report.messages[0].createdAt>report.updatedAt?report.messages[0].createdAt:report.updatedAt,status:report.status,messageCount:report._count.messages,opportunityPotential:report.opportunityPotential}));
 const filtered=canonical.filter(entry=>(!status||entry.status===status)&&(!query||`${entry.title} ${entry.publisher}`.toLocaleLowerCase("de-DE").includes(query))).sort((a,b)=>b.lastActivityAt.getTime()-a.lastActivityAt.getTime()),total=filtered.length;
 return Response.json({items:filtered.slice((page-1)*pageSize,page*pageSize),pagination:{page,pageSize,total,totalPages:Math.max(1,Math.ceil(total/pageSize))},statusCounts:canonical.reduce<Record<string,number>>((counts,entry)=>{counts[entry.status]=(counts[entry.status]||0)+1;return counts},{})});
}
