import Parser from "rss-parser";
import { db } from "../lib/db";

const parser = new Parser();

const generalMedia = [
  {
    name: "Tagesschau – Inland",
    url: "https://www.tagesschau.de/inland/index~rss2.xml",
    legalStatus: "REQUIRES_PERMISSION",
    reason: "Offizieller RSS-Feed; kommerzielle Nutzung erfordert Registrierung im ARD Publishing Portal.",
  },
  {
    name: "Tagesschau – Wirtschaft",
    url: "https://www.tagesschau.de/wirtschaft/index~rss2.xml",
    legalStatus: "REQUIRES_PERMISSION",
    reason: "Offizieller RSS-Feed; kommerzielle Nutzung erfordert Registrierung im ARD Publishing Portal.",
  },
  {
    name: "Handelsblatt – Unternehmen",
    url: "https://feeds.cms.handelsblatt.com/unternehmen",
    legalStatus: "REQUIRES_PERMISSION",
    reason: "Offizieller RSS-Feed; kommerzielle Nutzung erfordert vorherige ausdrückliche Genehmigung.",
  },
  {
    name: "Handelsblatt – Politik",
    url: "https://feeds.cms.handelsblatt.com/politik",
    legalStatus: "REQUIRES_PERMISSION",
    reason: "Offizieller RSS-Feed; kommerzielle Nutzung erfordert vorherige ausdrückliche Genehmigung.",
  },
  {
    name: "DER SPIEGEL – Schlagzeilen",
    url: "https://www.spiegel.de/schlagzeilen/index.rss",
    legalStatus: "LEGAL_REVIEW",
    reason: "Technisch verifizierter offizieller Feed; Nutzungsfreigabe für die Plattform noch zu dokumentieren.",
  },
  {
    name: "DIE ZEIT – Nachrichten",
    url: "https://newsfeed.zeit.de/index",
    legalStatus: "LEGAL_REVIEW",
    reason: "Technisch verifizierter offizieller Feed; Nutzungsfreigabe für die Plattform noch zu dokumentieren.",
  },
] as const;

async function run() {
  const results = [];
  for (const candidate of generalMedia) {
    try {
      const feed = await parser.parseURL(candidate.url);
      if (!feed.items.length) throw new Error("Feed enthält keine Einträge");
      await db.source.upsert({
        where: { url: candidate.url },
        update: {
          name: candidate.name,
          type: "RSS",
          enabled: false,
          publisherType: "GENERAL_NEWS_MEDIA",
          coverageScope: "NATIONWIDE",
          healthStatus: candidate.legalStatus,
          legalStatus: candidate.legalStatus,
          termsUrl: candidate.name.startsWith("Tagesschau") ? "https://www.tagesschau.de/infoservices/rssfeeds" : candidate.name.startsWith("Handelsblatt") ? "https://www.handelsblatt.com/rss-feeds/" : undefined,
          legalReviewedAt: new Date(),
          legalNotes: candidate.reason,
          verifiedAt: new Date(),
          lastError: candidate.reason,
        },
        create: {
          name: candidate.name,
          url: candidate.url,
          type: "RSS",
          enabled: false,
          publisherType: "GENERAL_NEWS_MEDIA",
          coverageScope: "NATIONWIDE",
          healthStatus: candidate.legalStatus,
          legalStatus: candidate.legalStatus,
          termsUrl: candidate.name.startsWith("Tagesschau") ? "https://www.tagesschau.de/infoservices/rssfeeds" : candidate.name.startsWith("Handelsblatt") ? "https://www.handelsblatt.com/rss-feeds/" : undefined,
          legalReviewedAt: new Date(),
          legalNotes: candidate.reason,
          verifiedAt: new Date(),
          lastError: candidate.reason,
        },
      });
      results.push({ name: candidate.name, entries: feed.items.length, status: candidate.legalStatus });
    } catch (error) {
      results.push({ name: candidate.name, entries: 0, status: "FAILED", error: error instanceof Error ? error.message : String(error) });
    }
  }
  console.table(results);
}

run().finally(() => db.$disconnect());
