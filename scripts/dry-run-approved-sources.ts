import Parser from "rss-parser";
import { db } from "../lib/db";
import { isSameNewsTopic } from "../lib/scanner";
import { canonicalize } from "../lib/utils";
import { shouldCollectBeforeStorage } from "../lib/transport-news";

const parser=new Parser();
async function run(){
  const sources=await db.source.findMany({where:{enabled:true,legalStatus:"APPROVED",type:"RSS"}});
  let fetched=0,relevant=0,duplicates=0;
  const accepted:Array<{title:string;url:string;source:string}>=[];
  for(const source of sources){
    const feed=await parser.parseURL(source.url);
    for(const entry of feed.items){
      if(!entry.title||!entry.link)continue;
      fetched++;
      const candidate={title:entry.title,content:entry.contentSnippet||entry.content||entry.summary||""};
      if(!shouldCollectBeforeStorage("GENERAL_NEWS_MEDIA",candidate))continue;
      relevant++;
      const url=canonicalize(entry.link);
      const existing=await db.item.findFirst({where:{OR:[{canonicalUrl:url},{sourceReferences:{some:{canonicalUrl:url}}}]},select:{id:true}});
      const batchDuplicate=accepted.some(item=>isSameNewsTopic(item.title,candidate.title));
      if(existing||batchDuplicate){duplicates++;continue;}
      accepted.push({title:candidate.title,url,source:source.name});
    }
  }
  console.log(JSON.stringify({mode:"DRY_RUN_NO_DATABASE_WRITES_NO_LANGDOCK",sources:sources.map(s=>s.name),fetched,relevant,duplicates,newUnique:accepted.length,items:accepted},null,2));
}
run().finally(()=>db.$disconnect());
