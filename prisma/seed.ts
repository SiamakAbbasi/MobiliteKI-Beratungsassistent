import { PrismaClient, SourceType } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const sources = [
    { name: "Deutscher Bundestag – Verkehr", url: "https://www.bundestag.de/static/appdata/includes/rss/verkehr.rss", type: SourceType.RSS },
    { name: "Verkehrsministerium Baden-Württemberg", url: "https://vm.baden-wuerttemberg.de/de/service/rss/xml/rss-vm", type: SourceType.RSS },
    { name: "Schleswig-Holstein – Verkehr", url: "https://www.schleswig-holstein.de/DE/landesportal/service/RSS/RSS_PI_VII/RSSNewsfeed_PI_VII.xml", type: SourceType.RSS },
    { name: "Bundesregierung kompakt", url: "https://www.bundesregierung.de/service/rss/breg-de/1151242/feed.xml", type: SourceType.RSS },
    { name: "TED – EU Tenders", url: "https://api.ted.europa.eu/v3/notices/search", type: SourceType.TED }
  ];
  await prisma.source.deleteMany({ where: { url: { in: ["https://bmdv.bund.de/SharedDocs/DE/Artikel/K/rss.xml","https://www.stadt-koeln.de/rss/feeds/pressemitteilungen.xml","https://ted.europa.eu/api/v3.0/notices/search"] } } });
  for (const source of sources) await prisma.source.upsert({ where: { url: source.url }, update: {}, create: source });
  const settings = { monthlyBudget: "10", scanTimes: "08:00,16:00", locale: "de-DE" };
  for (const [key, value] of Object.entries(settings)) await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
}
main().finally(() => prisma.$disconnect());
