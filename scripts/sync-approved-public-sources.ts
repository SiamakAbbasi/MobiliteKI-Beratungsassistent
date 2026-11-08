import Parser from "rss-parser";
import { db } from "../lib/db";

const parser = new Parser();
const sources = [{
  name: "Statistisches Bundesamt – Aktuelles",
  url: "https://www.destatis.de/SiteGlobals/Functions/RSSFeed/DE/RSSNewsfeed/Aktuell.xml",
  termsUrl: "https://www.destatis.de/DE/Service/Impressum/_inhalt.html",
  licenseName: "Vervielfältigung und Verbreitung mit Quellennachweis gestattet",
  legalNotes: "Destatis gestattet für Inhalte von destatis.de grundsätzlich Vervielfältigung und Verbreitung, auch auszugsweise, mit Quellennachweis; abweichende Kennzeichnungen und Bildrechte bleiben ausgeschlossen.",
},{
  name: "Europäische Kommission – Press Corner (DE)",
  url: "https://ec.europa.eu/commission/presscorner/api/rss?language=de",
  termsUrl: "https://commission.europa.eu/legal-notice_en",
  licenseName: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
  legalNotes: "EU-eigene Inhalte dürfen unter CC BY 4.0 mit angemessener Namensnennung und Kennzeichnung von Änderungen weiterverwendet werden; Inhalte Dritter, Logos und weitere ausgeschlossene Rechte werden nicht übernommen.",
}] as const;

async function run(){
  for(const source of sources){
    const feed=await parser.parseURL(source.url);
    if(!feed.items.length)throw new Error(`${source.name}: Feed enthält keine Einträge`);
    await db.source.upsert({where:{url:source.url},update:{name:source.name,type:"RSS",enabled:true,publisherType:"OTHER",coverageScope:"NATIONWIDE",healthStatus:"HEALTHY",verifiedAt:new Date(),legalStatus:"APPROVED",licenseName:source.licenseName,termsUrl:source.termsUrl,legalReviewedAt:new Date(),legalNotes:source.legalNotes,lastError:null},create:{name:source.name,url:source.url,type:"RSS",enabled:true,publisherType:"OTHER",coverageScope:"NATIONWIDE",healthStatus:"HEALTHY",verifiedAt:new Date(),legalStatus:"APPROVED",licenseName:source.licenseName,termsUrl:source.termsUrl,legalReviewedAt:new Date(),legalNotes:source.legalNotes}});
    console.log(`${source.name}: ${feed.items.length} Einträge, APPROVED`);
  }
}
run().finally(()=>db.$disconnect());
