import { db } from "../lib/db";
import { ANALYSIS_VERSION } from "../lib/company-profiles";
import { syncCompanyProfiles } from "../lib/company-profile-store";
import { assessOpportunity } from "../lib/opportunity-classifier";

async function main() {
  await syncCompanyProfiles();
  const items = await db.item.findMany({ include: { discovery: { include: { companyMatches: true } } } });
  let active=0,inactive=0,created=0;
  for (const item of items) {
    const assessment=assessOpportunity({title:item.title,content:item.content,url:item.canonicalUrl});
    const shouldCreate=!item.discovery&&assessment.opportunity&&assessment.confidence>=75;
    const shouldBeActive=assessment.relevant&&(assessment.opportunity||Boolean(item.discovery));
    let discovery=item.discovery;
    if(shouldCreate){
      discovery=await db.discovery.create({data:{itemId:item.id,category:assessment.category,summary:item.content.slice(0,650),aiExplanation:assessment.reason,relevanceScore:assessment.confidence,businessOpportunity:assessment.reason,recommendedAction:"Review the source and validate procurement scope, timing and buyer before outreach.",evidenceSummary:assessment.reason,maturity:assessment.maturity,confidenceScore:assessment.confidence,active:true,analysisVersion:ANALYSIS_VERSION,isAiGenerated:false},include:{companyMatches:true}});created++;
    }else if(discovery){
      discovery=await db.discovery.update({where:{id:discovery.id},data:{category:assessment.category,evidenceSummary:assessment.reason,maturity:assessment.maturity,confidenceScore:assessment.confidence,businessOpportunity:assessment.opportunity?discovery.businessOpportunity:null,recommendedAction:assessment.opportunity?discovery.recommendedAction:null,active:shouldBeActive,analysisVersion:ANALYSIS_VERSION},include:{companyMatches:true}});
    }
    if(discovery){
      await db.companyMatch.deleteMany({where:{discoveryId:discovery.id}});
      if(shouldBeActive)for(const match of assessment.matches)await db.companyMatch.create({data:{discoveryId:discovery.id,companyKey:match.companyKey,fitScore:match.fitScore,evidence:match.evidence,servicesJson:JSON.stringify(match.services),recommendedAction:"Validate the underlying need and identify the responsible contracting authority."}});
      shouldBeActive?active++:inactive++;
    }
    await db.item.update({where:{id:item.id},data:{analysisVersion:ANALYSIS_VERSION}});
  }
  console.log(JSON.stringify({items:items.length,active,inactive,created,analysisVersion:ANALYSIS_VERSION}));
}

main().finally(()=>db.$disconnect());
