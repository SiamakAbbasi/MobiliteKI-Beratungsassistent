import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { db } from "./db";
import { analyzeItem } from "./ai";
import { canonicalize, hash } from "./utils";
import { ANALYSIS_VERSION } from "./company-profiles";
import { syncCompanyProfiles } from "./company-profile-store";
import { classifyTransportNews, shouldCollectBeforeStorage } from "./transport-news";
import { extractGeography } from "./german-geography";

const parser = new Parser();
let scanning = false;
export const normalizeTitle=(title:string)=>title.toLocaleLowerCase("de-DE").normalize("NFKD").replace(/[^a-z0-9äöüß ]/gi," ").replace(/\s+/g," ").trim();
export function titleSimilarity(a:string,b:string){const left=new Set(normalizeTitle(a).split(" ").filter(x=>x.length>2)),right=new Set(normalizeTitle(b).split(" ").filter(x=>x.length>2));if(!left.size||!right.size)return 0;const common=[...left].filter(x=>right.has(x)).length,min=Math.min(left.size,right.size),max=Math.max(left.size,right.size);return min>=5&&common===min?1:common/max;}
export function isSameNewsTopic(a:string,b:string){const left=new Set(normalizeTitle(a).split(" ").filter(x=>x.length>3)),right=new Set(normalizeTitle(b).split(" ").filter(x=>x.length>3));const common=[...left].filter(x=>right.has(x)).length;return titleSimilarity(a,b)>=.72||(common>=4&&common/Math.min(left.size,right.size)>=.6);}
export async function scan(sourceId?: string) {
  if (scanning) throw new Error("A scan is already running");
  scanning = true;
  const run = await db.scanRun.create({ data: { status: "RUNNING" } });
  let processed=0, newItems=0, analyzed=0, errors=0,duplicatesDetected=0;
  try {
    await syncCompanyProfiles();
    const analyzeStoredItem = async (item: { id:string; title:string; content:string; canonicalUrl:string; analyzedAt:Date|null; newsAnalyzedAt:Date|null },sourceState?:string|null) => {
      if(!item.newsAnalyzedAt){const news=classifyTransportNews(item),geo=extractGeography(`${item.title}\n${item.content}`,sourceState);await db.item.update({where:{id:item.id},data:{transportRelevant:news.relevant,exclusionReason:news.reason,newsCategory:news.category,factualSummary:news.summary,federalState:geo.state,district:geo.district,city:geo.city,latitude:geo.latitude,longitude:geo.longitude,geographicScope:geo.scope,geoConfidence:geo.confidence,newsAnalyzedAt:new Date()}});if(!news.relevant){await db.item.update({where:{id:item.id},data:{analyzedAt:item.analyzedAt||new Date(),relevant:false,analysisVersion:ANALYSIS_VERSION,discoveryStatus:"SKIPPED"}});return;}}
      if (item.analyzedAt) return;
      let a;try{a=await analyzeItem({title:item.title,content:item.content,url:item.canonicalUrl});}catch(error){const message=error instanceof Error?error.message:"Unbekannter Analysefehler";await db.item.update({where:{id:item.id},data:{discoveryStatus:/budget/i.test(message)?"DEFERRED":"FAILED",discoveryError:message}});throw error;}
      if (!a){await db.item.update({where:{id:item.id},data:{discoveryStatus:"DEFERRED",discoveryError:"Langdock ist nicht konfiguriert"}});return;}
      if(a.relevant){
        const assessment=a.assessment;
        const category=a.category==="BUSINESS_OPPORTUNITY"&&!assessment.opportunity?"STRATEGIC_ISSUE":a.category==="NEWS"&&a.categoryTags.includes("POLICY_REGULATION")?"POLICY_REGULATION":a.category==="NEWS"&&a.categoryTags.includes("STRATEGIC_ISSUE")?"STRATEGIC_ISSUE":a.category;
        const categoryTags=Array.from(new Set([category,...a.categoryTags]));
        const discovery=await db.discovery.upsert({where:{itemId:item.id},update:{category,categoryTagsJson:JSON.stringify(categoryTags),summary:a.summary,city:a.city,federalState:a.federalState,latitude:a.latitude,longitude:a.longitude,aiExplanation:a.explanation,relevanceScore:a.relevanceScore,businessOpportunity:assessment.opportunity?a.businessOpportunity:null,recommendedAction:a.recommendedAction,evidenceSummary:assessment.reason,maturity:assessment.maturity,confidenceScore:assessment.confidence,active:true,analysisVersion:ANALYSIS_VERSION},create:{itemId:item.id,category,categoryTagsJson:JSON.stringify(categoryTags),summary:a.summary,city:a.city,federalState:a.federalState,latitude:a.latitude,longitude:a.longitude,aiExplanation:a.explanation,relevanceScore:a.relevanceScore,businessOpportunity:assessment.opportunity?a.businessOpportunity:null,recommendedAction:a.recommendedAction,evidenceSummary:assessment.reason,maturity:assessment.maturity,confidenceScore:assessment.confidence,active:true,analysisVersion:ANALYSIS_VERSION,isAiGenerated:true}});
        await db.companyMatch.deleteMany({where:{discoveryId:discovery.id}});
        for(const match of assessment.matches)await db.companyMatch.create({data:{discoveryId:discovery.id,companyKey:match.companyKey,fitScore:match.fitScore,evidence:match.evidence,servicesJson:JSON.stringify(match.services),recommendedAction:a.recommendedAction}});
        analyzed++;
      }
      await db.item.update({where:{id:item.id},data:{analyzedAt:new Date(),relevant:a.relevant,analysisVersion:ANALYSIS_VERSION,discoveryStatus:a.relevant?"ANALYZED":"SKIPPED",discoveryError:null}});
    };
    const sources = await db.source.findMany({ where: { enabled:true, ...(sourceId ? { id:sourceId } : {}) } });
    for (const source of sources) {
      try {
        const entries: { title:string; link:string; content:string; date:Date }[] = [];
        if (source.type === "RSS") {
          const feed = await parser.parseURL(source.url);
          for (const i of feed.items.slice(0,25)) if (i.link && i.title) entries.push({ title:i.title, link:i.link, content:i.contentSnippet || i.content || i.title, date:i.isoDate ? new Date(i.isoDate) : new Date() });
        } else if (source.type === "TED") {
          const today=new Date().toISOString().slice(0,10).replaceAll("-","");
          const res=await fetch(source.url,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({query:`buyer-country=DEU AND publication-date=${today}`,fields:["publication-number","publication-date","notice-title"],page:1,limit:250,paginationMode:"PAGE_NUMBER"})});
          if(!res.ok)throw new Error(`TED HTTP ${res.status}`); const payload=await res.json();
          const keywords=/transport|verkehr|mobilit|rail|bahn|bus|tram|ticket|fahrgast|öpnv/i;
          for(const n of payload.notices||[]){const titles=n["notice-title"]||{};const title=typeof titles==="string"?titles:(titles.deu||titles.eng||Object.values(titles).find(v=>typeof v==="string")) as string|undefined;if(!title||!keywords.test(title))continue;const number=n["publication-number"];const link=`https://ted.europa.eu/en/notice/-/detail/${number}`;const rawDate=Array.isArray(n["publication-date"])?n["publication-date"][0]:n["publication-date"];const parsedDate=rawDate?new Date(rawDate):new Date();entries.push({title,link,content:`TED public procurement notice ${number}: ${title}`,date:Number.isNaN(parsedDate.getTime())?new Date():parsedDate});}
        } else if (source.type === "WEBSITE") {
          const res = await fetch(source.url, { headers:{"User-Agent":"MobilityPulseAI/0.1"} }); if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const $=cheerio.load(await res.text()); const title=$("title").text().trim(); const content=$("main, article").first().text().replace(/\s+/g," ").trim();
          if (!title || content.length < 100) throw new Error("Unsupported page structure: no extractable article content");
          entries.push({ title, link:source.url, content, date:new Date() });
        } else throw new Error(`${source.type} scanning requires endpoint-specific configuration`);
        for (const e of entries) {
          if(!shouldCollectBeforeStorage(source.publisherType,e))continue;
          const url=canonicalize(e.link), contentHash=hash(`${e.title}\n${e.content}`);
          let existing=await db.item.findFirst({ where:{ OR:[{canonicalUrl:url},{contentHash}] } });
          if(!existing){const nearby=await db.item.findMany({where:{publishedAt:{gte:new Date(e.date.getTime()-2*86400000),lte:new Date(e.date.getTime()+2*86400000)}},orderBy:{publishedAt:"desc"},take:150});existing=nearby.find(x=>isSameNewsTopic(x.title,e.title))||null;}
          if(existing){duplicatesDetected++;await db.itemSourceReference.upsert({where:{canonicalUrl:url},update:{itemId:existing.id,sourceId:source.id,title:e.title,publishedAt:e.date},create:{itemId:existing.id,sourceId:source.id,canonicalUrl:url,title:e.title,publishedAt:e.date}});try{await analyzeStoredItem(existing,source.federalState);}catch(err){await db.source.update({where:{id:source.id},data:{lastError:`AI: ${err instanceof Error?err.message:"Unknown"}`}});}continue;}
          const item=await db.item.create({ data:{sourceId:source.id,canonicalUrl:url,contentHash,title:e.title,content:e.content,publishedAt:e.date,sourceReferences:{create:{sourceId:source.id,canonicalUrl:url,title:e.title,publishedAt:e.date}}} }); newItems++;
          try { await analyzeStoredItem(item,source.federalState); } catch(err){ await db.source.update({where:{id:source.id},data:{lastError:`AI: ${err instanceof Error?err.message:"Unknown"}`}}); }
        }
        await db.source.update({where:{id:source.id},data:{lastSuccessfulScan:new Date(),lastError:null}}); processed++;
      } catch(err) { errors++; await db.source.update({where:{id:source.id},data:{lastError:err instanceof Error?err.message:"Unknown error"}}); }
    }
    return await db.scanRun.update({where:{id:run.id},data:{status:"COMPLETED",completedAt:new Date(),sourcesProcessed:processed,newItems,analyzedItems:analyzed,duplicatesDetected,errors}});
  } catch(err) { await db.scanRun.update({where:{id:run.id},data:{status:"FAILED",completedAt:new Date(),message:err instanceof Error?err.message:"Unknown"}}); throw err; }
  finally { scanning=false; }
}

export async function testSource(url:string,type:string){
  if(type==="RSS"){ const feed=await parser.parseURL(url); return {ok:true,message:`Connected — ${feed.items.length} entries found`}; }
  if(type==="TED"){const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`publication-date=${new Date().toISOString().slice(0,10).replaceAll("-","")}`,fields:["publication-number"],page:1,limit:1,paginationMode:"PAGE_NUMBER"})});return {ok:r.ok,message:`TED API HTTP ${r.status}`};}
  const res=await fetch(url,{method:"GET",headers:{"User-Agent":"MobilityPulseAI/0.1"}}); return {ok:res.ok,message:`HTTP ${res.status} ${res.statusText}`};
}
