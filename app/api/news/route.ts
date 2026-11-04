import { NextRequest } from "next/server";
import { NewsCategory, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
  const p=request.nextUrl.searchParams,page=Math.max(1,Number(p.get("page"))||1),pageSize=Math.min(50,Math.max(10,Number(p.get("pageSize"))||20));
  const query=p.get("query")?.trim(),state=p.get("state")?.trim(),city=p.get("city")?.trim(),publisher=p.get("publisher")?.trim(),sector=p.get("sector") as NewsCategory|null,dateFrom=p.get("dateFrom"),dateTo=p.get("dateTo"),sort=p.get("sort")==="relevance"?"relevance":"newest";
  const where:Prisma.ItemWhereInput={transportRelevant:true,...(query?{OR:[{title:{contains:query}},{content:{contains:query}},{factualSummary:{contains:query}}]}:{}),...(state?{federalState:state}:{}),...(city?{OR:[{city:{contains:city}},{district:{contains:city}}]}:{}),...(publisher?{source:{name:publisher}}:{}),...(sector?{newsCategory:sector}:{}),...((dateFrom||dateTo)?{publishedAt:{...(dateFrom?{gte:new Date(dateFrom)}:{}),...(dateTo?{lte:new Date(`${dateTo}T23:59:59.999Z`)}:{})}}:{})};
  const orderBy:Prisma.ItemOrderByWithRelationInput[]=sort==="relevance"?[{discovery:{relevanceScore:"desc"}},{publishedAt:"desc"}]:[{publishedAt:"desc"},{collectedAt:"desc"}];
  const [items,total,states,cities,publishers]=await Promise.all([
    db.item.findMany({where,include:{source:{select:{id:true,name:true,type:true}},discovery:{select:{id:true,category:true,relevanceScore:true,active:true}},advisorReports:{select:{status:true,createdAt:true,updatedAt:true},orderBy:[{updatedAt:"desc"},{createdAt:"desc"}],take:1}},orderBy,skip:(page-1)*pageSize,take:pageSize}),
    db.item.count({where}),
    db.item.findMany({where:{transportRelevant:true,federalState:{not:null}},select:{federalState:true},distinct:["federalState"]}),
    db.item.findMany({where:{transportRelevant:true,city:{not:null}},select:{city:true},distinct:["city"]}),
    db.source.findMany({where:{items:{some:{transportRelevant:true}}},select:{name:true},orderBy:{name:"asc"}})
  ]);
  return Response.json({items,pagination:{page,pageSize,total,totalPages:Math.max(1,Math.ceil(total/pageSize))},facets:{states:states.map(x=>x.federalState).filter(Boolean),cities:cities.map(x=>x.city).filter(Boolean),publishers:publishers.map(x=>x.name)}});
}
