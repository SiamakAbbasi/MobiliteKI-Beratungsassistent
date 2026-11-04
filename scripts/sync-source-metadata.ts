import { db } from "../lib/db";
const metadata=[
  {url:"https://www.bundestag.de/static/appdata/includes/rss/verkehr.rss",coverageScope:"NATIONWIDE",publisherType:"FEDERAL_PARLIAMENT",sectors:["REGULATION_POLICY","FINANCING_FUNDING","INFRASTRUCTURE"]},
  {url:"https://vm.baden-wuerttemberg.de/de/service/rss/xml/rss-vm",federalState:"Baden-Württemberg",coverageScope:"STATE",publisherType:"STATE_MINISTRY",sectors:["PUBLIC_TRANSPORT_BUS","REGIONAL_RAIL","INFRASTRUCTURE","REGULATION_POLICY"]},
  {url:"https://www.schleswig-holstein.de/DE/landesportal/service/RSS/RSS_PI_VII/RSSNewsfeed_PI_VII.xml",federalState:"Schleswig-Holstein",coverageScope:"STATE",publisherType:"STATE_MINISTRY",sectors:["PUBLIC_TRANSPORT_BUS","REGIONAL_RAIL","INFRASTRUCTURE","FREIGHT_TRANSPORT"]},
  {url:"https://www.bundesregierung.de/service/rss/breg-de/1151242/feed.xml",coverageScope:"NATIONWIDE",publisherType:"FEDERAL_GOVERNMENT",sectors:["REGULATION_POLICY","FINANCING_FUNDING"]},
  {url:"https://api.ted.europa.eu/v3/notices/search",coverageScope:"NATIONWIDE",publisherType:"PROCUREMENT_PORTAL",sectors:["PROCUREMENT_TENDERS"]}
];
async function main(){for(const s of metadata)await db.source.updateMany({where:{url:s.url},data:{federalState:s.federalState,coverageScope:s.coverageScope,publisherType:s.publisherType,transportSectorsJson:JSON.stringify(s.sectors),healthStatus:"HEALTHY",verifiedAt:new Date()}});console.log(JSON.stringify({updated:metadata.length}));}
main().finally(()=>db.$disconnect());
