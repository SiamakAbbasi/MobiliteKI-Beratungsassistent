import { db } from "../lib/db";
import { validateRssSource } from "../lib/source-validation";
type Candidate = {
  name: string;
  url: string;
  state: string | null;
  type: "RSS" | "WEBSITE";
  publisherType: string;
  sectors: string[];
};
const candidates: Candidate[] = [
  {
    name: "Verkehrsministerium Baden-Württemberg",
    url: "https://vm.baden-wuerttemberg.de/de/service/rss/xml/rss-vm",
    state: "Baden-Württemberg",
    type: "RSS",
    publisherType: "STATE_MINISTRY",
    sectors: [
      "PUBLIC_TRANSPORT_BUS",
      "REGIONAL_RAIL",
      "INFRASTRUCTURE",
      "REGULATION_POLICY",
    ],
  },
  {
    name: "Bayerisches Verkehrsministerium – Presse",
    url: "https://verkehrsministerium.bayern.de/rss/pm/atom.xml",
    state: "Bayern",
    type: "RSS",
    publisherType: "STATE_MINISTRY",
    sectors: [
      "PUBLIC_TRANSPORT_BUS",
      "REGIONAL_RAIL",
      "INFRASTRUCTURE",
      "REGULATION_POLICY",
    ],
  },
  {
    name: "Berlin SenMVKU – Presse",
    url: "https://www.berlin.de/sen/uvk/presse/index.php/rss",
    state: "Berlin",
    type: "RSS",
    publisherType: "STATE_MINISTRY",
    sectors: [
      "PUBLIC_TRANSPORT_BUS",
      "URBAN_RAIL",
      "INFRASTRUCTURE",
      "REGULATION_POLICY",
    ],
  },
  {
    name: "Brandenburg MIL – Mobilität & Verkehr",
    url: "https://mil.brandenburg.de/mil/de/rss/detail/~mil-pressemitteilungen-rubrik-verkehr-und-mobilitaetrss.xml",
    state: "Brandenburg",
    type: "RSS",
    publisherType: "STATE_MINISTRY",
    sectors: [
      "PUBLIC_TRANSPORT_BUS",
      "REGIONAL_RAIL",
      "INFRASTRUCTURE",
      "REGULATION_POLICY",
    ],
  },
  {
    name: "Bremen – Mobilität",
    url: "https://www.bauumwelt.bremen.de/mobilitaet-1459",
    state: "Bremen",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "URBAN_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Hamburg – Verkehr",
    url: "https://www.hamburg.de/verkehr/",
    state: "Hamburg",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "URBAN_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Hessen – Wirtschaft und Verkehr",
    url: "https://wirtschaft.hessen.de/verkehr",
    state: "Hessen",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Mecklenburg-Vorpommern – Verkehr",
    url: "https://www.regierung-mv.de/Landesregierung/wm/Infrastruktur/Verkehr/",
    state: "Mecklenburg-Vorpommern",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Niedersachsen – Verkehr",
    url: "https://www.mw.niedersachsen.de/startseite/themen/verkehr/",
    state: "Niedersachsen",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Nordrhein-Westfalen – Verkehr",
    url: "https://www.munv.nrw/verkehr",
    state: "Nordrhein-Westfalen",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Rheinland-Pfalz – Verkehr",
    url: "https://mwtek.rlp.de/themen/verkehr",
    state: "Rheinland-Pfalz",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Saarland – Pressemitteilungen",
    url: "https://www.saarland.de/DE/presse-informationen/informationen/rss-feed/_feeds/pressemitteilungen_feed.xml",
    state: "Saarland",
    type: "RSS",
    publisherType: "STATE_GOVERNMENT",
    sectors: [
      "PUBLIC_TRANSPORT_BUS",
      "REGIONAL_RAIL",
      "INFRASTRUCTURE",
      "REGULATION_POLICY",
    ],
  },
  {
    name: "Sachsen – Mobilität",
    url: "https://www.mobilitaet.sachsen.de/",
    state: "Sachsen",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Sachsen-Anhalt – Infrastruktur und Digitales",
    url: "https://mid.sachsen-anhalt.de/",
    state: "Sachsen-Anhalt",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
  {
    name: "Schleswig-Holstein – Verkehr",
    url: "https://www.schleswig-holstein.de/DE/landesportal/service/RSS/RSS_PI_VII/RSSNewsfeed_PI_VII.xml",
    state: "Schleswig-Holstein",
    type: "RSS",
    publisherType: "STATE_MINISTRY",
    sectors: [
      "PUBLIC_TRANSPORT_BUS",
      "REGIONAL_RAIL",
      "INFRASTRUCTURE",
      "FREIGHT_TRANSPORT",
    ],
  },
  {
    name: "Thüringen – Infrastruktur und Verkehr",
    url: "https://infrastruktur-landwirtschaft.thueringen.de/unsere-themen/verkehr-und-strassenbau",
    state: "Thüringen",
    type: "WEBSITE",
    publisherType: "STATE_MINISTRY",
    sectors: ["PUBLIC_TRANSPORT_BUS", "REGIONAL_RAIL", "INFRASTRUCTURE"],
  },
];
async function main() {
  let validated = 0,
    rejected = 0,
    active = 0;
  for (const candidate of candidates) {
    const now = new Date();
    try {
      if (candidate.type !== "RSS")
        throw new Error(
          "Kein öffentliches RSS/Atom/API-Endpunkt bestätigt; HTML-Übersichtsseite wird nicht als inkrementelle Quelle aktiviert",
        );
      const result = await validateRssSource(candidate.url);
      await db.source.upsert({
        where: { url: candidate.url },
        update: {
          name: candidate.name,
          enabled: true,
          federalState: candidate.state,
          coverageScope: "STATE",
          publisherType: candidate.publisherType,
          transportSectorsJson: JSON.stringify(candidate.sectors),
          healthStatus: "HEALTHY",
          verifiedAt: now,
          lastError: null,
        },
        create: {
          name: candidate.name,
          url: candidate.url,
          type: "RSS",
          enabled: true,
          federalState: candidate.state,
          coverageScope: "STATE",
          publisherType: candidate.publisherType,
          transportSectorsJson: JSON.stringify(candidate.sectors),
          healthStatus: "HEALTHY",
          verifiedAt: now,
        },
      });
      await db.sourceCandidate.upsert({
        where: { url: candidate.url },
        update: {
          name: candidate.name,
          federalState: candidate.state,
          publisherType: candidate.publisherType,
          verificationStatus: "VERIFIED",
          lastCheckedAt: now,
          lastError: null,
        },
        create: {
          name: candidate.name,
          url: candidate.url,
          federalState: candidate.state,
          publisherType: candidate.publisherType,
          reason: `Batch 1: ${result.entries} Artikel, ${result.relevantEntries} verkehrsrelevant`,
          verificationStatus: "VERIFIED",
          lastCheckedAt: now,
        },
      });
      validated++;
      active++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await db.sourceCandidate.upsert({
        where: { url: candidate.url },
        update: {
          name: candidate.name,
          federalState: candidate.state,
          publisherType: candidate.publisherType,
          verificationStatus: "REJECTED",
          lastCheckedAt: now,
          lastError: message,
        },
        create: {
          name: candidate.name,
          url: candidate.url,
          federalState: candidate.state,
          publisherType: candidate.publisherType,
          reason: "Batch 1: offizielle Landesquelle",
          verificationStatus: "REJECTED",
          lastCheckedAt: now,
          lastError: message,
        },
      });
      rejected++;
    }
  }
  console.log(
    JSON.stringify(
      { batch: 1, discovered: candidates.length, validated, active, rejected },
      null,
      2,
    ),
  );
}
main().finally(() => db.$disconnect());
