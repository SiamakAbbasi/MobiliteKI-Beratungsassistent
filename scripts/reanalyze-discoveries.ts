import {db} from "../lib/db";
import {analyzeItem,discoveryCandidate} from "../lib/ai";
import {ANALYSIS_VERSION} from "../lib/company-profiles";

async function main(){
 const failedOnly=process.argv.includes("--failed");const items=await db.item.findMany({where:{transportRelevant:true,...(failedOnly?{discoveryStatus:"FAILED"}:{})},include:{discovery:true}});let analyzed=0,skipped=0,failed=0,deferred=0;
 for(const item of items){if(!discoveryCandidate(item)){await db.item.update({where:{id:item.id},data:{discoveryStatus:"SKIPPED",discoveryError:null}});skipped++;continue}
  await db.item.update({where:{id:item.id},data:{discoveryStatus:"PENDING",discoveryError:null}});
  try{const a=await analyzeItem({title:item.title,content:item.content,url:item.canonicalUrl});if(!a){deferred++;continue}const assessment=a.assessment;if(!a.relevant||(a.category==="NEWS"&&!a.categoryTags.length)){if(item.discovery)await db.discovery.update({where:{id:item.discovery.id},data:{active:false}});await db.item.update({where:{id:item.id},data:{analyzedAt:new Date(),relevant:false,analysisVersion:ANALYSIS_VERSION,discoveryStatus:"SKIPPED"}});skipped++;continue}
   const category=a.category==="BUSINESS_OPPORTUNITY"&&!assessment.opportunity?"STRATEGIC_ISSUE":a.category==="NEWS"&&a.categoryTags.includes("POLICY_REGULATION")?"POLICY_REGULATION":a.category==="NEWS"&&a.categoryTags.includes("STRATEGIC_ISSUE")?"STRATEGIC_ISSUE":a.category,categoryTags=Array.from(new Set([category,...a.categoryTags]));
   const discovery=await db.discovery.upsert({where:{itemId:item.id},update:{category,categoryTagsJson:JSON.stringify(categoryTags),summary:a.summary,city:a.city,federalState:a.federalState,latitude:a.latitude,longitude:a.longitude,aiExplanation:a.explanation,relevanceScore:a.relevanceScore,businessOpportunity:assessment.opportunity?a.businessOpportunity:null,recommendedAction:a.recommendedAction,evidenceSummary:assessment.reason,maturity:assessment.maturity,confidenceScore:assessment.confidence,active:true,analysisVersion:ANALYSIS_VERSION,isAiGenerated:true},create:{itemId:item.id,category,categoryTagsJson:JSON.stringify(categoryTags),summary:a.summary,city:a.city,federalState:a.federalState,latitude:a.latitude,longitude:a.longitude,aiExplanation:a.explanation,relevanceScore:a.relevanceScore,businessOpportunity:assessment.opportunity?a.businessOpportunity:null,recommendedAction:a.recommendedAction,evidenceSummary:assessment.reason,maturity:assessment.maturity,confidenceScore:assessment.confidence,active:true,analysisVersion:ANALYSIS_VERSION,isAiGenerated:true}});
   await db.companyMatch.deleteMany({where:{discoveryId:discovery.id}});for(const match of assessment.matches)await db.companyMatch.create({data:{discoveryId:discovery.id,companyKey:match.companyKey,fitScore:match.fitScore,evidence:match.evidence,servicesJson:JSON.stringify(match.services),recommendedAction:a.recommendedAction}});
   await db.item.update({where:{id:item.id},data:{analyzedAt:new Date(),relevant:true,analysisVersion:ANALYSIS_VERSION,discoveryStatus:"ANALYZED",discoveryError:null}});analyzed++;
  }catch(error){const message=error instanceof Error?error.message:String(error),budget=/budget/i.test(message);await db.item.update({where:{id:item.id},data:{discoveryStatus:budget?"DEFERRED":"FAILED",discoveryError:message}});budget?deferred++:failed++;if(budget)break;}
 }
 console.log(JSON.stringify({eligible:items.length,analyzed,skipped,failed,deferred}));
}
main().finally(()=>db.$disconnect());
