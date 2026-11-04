import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdvisorWorkspace from "@/components/advisor-workspace";

export default async function AdvisorPage({params}:PageProps<"/news/[articleId]/advisor">){const {articleId}=await params;const item=await db.item.findUnique({where:{id:articleId},include:{source:true}});if(!item)notFound();return <AdvisorWorkspace article={{id:item.id,title:item.title,publisher:item.source.name,publishedAt:item.publishedAt.toISOString(),region:[item.city,item.district,item.federalState].filter(Boolean).join(" · ")||"Keine geografische Zuordnung",category:item.newsCategory||"Nicht klassifiziert",sourceUrl:item.canonicalUrl}}/>;}
