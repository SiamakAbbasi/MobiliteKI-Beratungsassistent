"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  Newspaper,
  Layers3,
  Settings,
  Search,
  Bell,
  FileText,
  TriangleAlert,
  Scale,
  Target,
  MapPin,
  CalendarDays,
  ExternalLink,
  TrendingUp,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  TestTube2,
  X,
  Menu,
  ChevronRight,
  Clock,
  CheckCircle2,
  Wifi,
  Euro,
  Sparkles,
  BookOpen,
  Info,
} from "lucide-react";
import GermanyMap from "./germany-map";
import ProductGuide from "./product-guide";
import LogoutButton from "./logout-button";
import { consultationAction } from "@/lib/advisor-status";
import {
  categoryContext,
  factualKeyPoints,
  germanAiExplanation,
  germanFactualSummary,
} from "@/lib/discovery-detail";
type Source = {
  id: string;
  name: string;
  url: string;
  type: string;
  enabled: boolean;
  lastSuccessfulScan?: string;
  lastError?: string;
  publisherType?: string;
};
type SourceReference = {
  id: string;
  canonicalUrl: string;
  title: string;
  publishedAt: string;
  source: Source;
};
type CoverageReport = {
  totalActiveSources: number;
  totalVerifiedActiveSources: number;
  coveredStates: number;
  totalStates: number;
  directDistrictCoverage: number;
  citiesWithLocalSources: number;
  states: Array<{
    state: string;
    covered: boolean;
    sources: string[];
    articles: number;
    candidateStatus: string;
  }>;
  sectors: string[];
  candidateSummary: Record<string, number>;
};
type CompanyMatch = {
  companyKey: "MOBILITE" | "BSL";
  fitScore: number;
  evidence: string;
  servicesJson: string;
  recommendedAction?: string;
};
type AdvisorState = { status: string; createdAt: string; updatedAt: string };
type Discovery = {
  id: string;
  category: string;
  categoryTagsJson: string;
  summary: string;
  city?: string;
  federalState?: string;
  latitude?: number;
  longitude?: number;
  aiExplanation?: string;
  relevanceScore: number;
  businessOpportunity?: string;
  recommendedAction?: string;
  evidenceSummary?: string;
  potentialCustomer?: string;
  maturity:
    "EARLY_SIGNAL" | "PLANNED_PROJECT" | "ACTIVE_TENDER" | "AWARDED_CLOSED";
  confidenceScore: number;
  tenderReference?: string;
  tenderDeadline?: string;
  companyMatches: CompanyMatch[];
  createdAt: string;
  item: {
    id: string;
    title: string;
    content: string;
    factualSummary?: string;
    newsCategory?: string;
    federalState?: string;
    district?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    geographicScope?: string;
    canonicalUrl: string;
    publishedAt: string;
    source: Source;
    sourceReferences: SourceReference[];
    advisorReports: AdvisorState[];
  };
};
type Data = {
  discoveries: Discovery[];
  items: number;
  sources: Source[];
  processing: Record<string, number>;
  companyProfiles: Array<{
    key: string;
    name: string;
    website: string;
    capabilitiesJson: string;
    sourceUrlsJson: string;
  }>;
  lastScan?: {
    status: string;
    startedAt: string;
    newItems: number;
    sourcesProcessed: number;
    errors: number;
  };
  settings: Record<string, string>;
  usage: { cost: number; input: number; output: number };
  aiKonfiguriert: boolean;
};
type RawItem = {
  id: string;
  title: string;
  canonicalUrl: string;
  publishedAt: string;
  collectedAt: string;
  analyzedAt?: string | null;
  relevant?: boolean | null;
  analysisStatus: "PENDING" | "EXCLUDED" | "DISCOVERY" | "ANALYZED";
  source: { id: string; name: string; type: string };
  sourceReferences: SourceReference[];
  discovery?: { id: string; category: string; relevanceScore: number } | null;
};
type NewsItem = {
  id: string;
  title: string;
  canonicalUrl: string;
  publishedAt: string;
  factualSummary?: string;
  newsCategory: string;
  federalState?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  source: { id: string; name: string; type: string };
  sourceReferences: SourceReference[];
  discovery?: {
    id: string;
    category: string;
    relevanceScore: number;
    active: boolean;
  } | null;
  advisorReports: AdvisorState[];
};
const nav = [
  {
    id: "overview",
    href: "/?view=overview",
    label: "Übersicht",
    icon: LayoutDashboard,
  },
  {
    id: "discoveries",
    href: "/?view=discoveries",
    label: "KI-Erkenntnisse",
    icon: Lightbulb,
  },
  {
    id: "consultations",
    href: "/beratungen",
    label: "Meine Beratungen",
    icon: MessageSquareText,
  },
  {
    id: "news",
    href: "/?view=news",
    label: "Verkehrsnachrichten",
    icon: Newspaper,
  },
  {
    id: "collected",
    href: "/?view=collected",
    label: "Erfasste Meldungen",
    icon: FileText,
  },
  { id: "sources", href: "/?view=sources", label: "Quellen", icon: Layers3 },
  {
    id: "settings",
    href: "/?view=settings",
    label: "Einstellungen",
    icon: Settings,
  },
  {
    id: "guide",
    href: "/leitfaden",
    label: "Produkt & Leitfaden",
    icon: BookOpen,
  },
];
const info: Record<string, { label: string; color: string; icon: any }> = {
  NEWS: { label: "Nachricht", color: "blue", icon: FileText },
  OPERATIONAL_ISSUE: {
    label: "Betriebliches Problem",
    color: "orange",
    icon: TriangleAlert,
  },
  STRATEGIC_ISSUE: {
    label: "Strategisches Thema",
    color: "orange",
    icon: TriangleAlert,
  },
  POLICY_REGULATION: {
    label: "Politik & Regulierung",
    color: "purple",
    icon: Scale,
  },
  BUSINESS_OPPORTUNITY: {
    label: "Beratungspotenzial",
    color: "green",
    icon: Target,
  },
};
const hasCategory = (d: Discovery, category: string) => {
  try {
    return [d.category, ...JSON.parse(d.categoryTagsJson || "[]")].includes(
      category,
    );
  } catch {
    return d.category === category;
  }
};
const rel = (d: string) => {
  const n = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return n === 0 ? "Heute" : `vor ${n} Tag${n === 1 ? "" : "en"}`;
};
export default function Dashboard({
  initialPage,
}: { initialPage?: string } = {}) {
  const [data, setData] = useState<Data | null>(null),
    [page, setPage] = useState(() => {
      if (initialPage) return initialPage;
      if (typeof window === "undefined") return "overview";
      const view = new URLSearchParams(window.location.search).get("view");
      return [
        "overview",
        "discoveries",
        "news",
        "collected",
        "sources",
        "settings",
        "guide",
      ].includes(view || "")
        ? view!
        : "overview";
    }),
    [filter, setFilter] = useState<string | null>(null),
    [company, setCompany] = useState<"ALL" | "MOBILITE" | "BSL">("ALL"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<Discovery | null>(null),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false);
  const load = () =>
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(
    () =>
      data?.discoveries.filter(
        (d) =>
          (company === "ALL" ||
            d.companyMatches.some((m) => m.companyKey === company)) &&
          (!filter ||
            hasCategory(d, filter) ||
            (filter === "ISSUES" &&
              ["OPERATIONAL_ISSUE", "STRATEGIC_ISSUE"].some((c) =>
                hasCategory(d, c),
              ))) &&
          (!query ||
            `${d.item.title} ${d.summary} ${d.city || ""}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ) || [],
    [data, filter, query, company],
  );
  const scan = async (id?: string) => {
    setBusy(true);
    const r = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: id }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) alert(j.error);
    load();
  };
  if (!data)
    return (
      <div className="splash">
        <div className="brand-mark">〽</div>
        <p>Mobility Pulse wird geladen…</p>
      </div>
    );
  const companyDiscoveries = data.discoveries.filter(
    (d) =>
      company === "ALL" ||
      d.companyMatches.some((m) => m.companyKey === company),
  );
  const counts = {
    NEWS: data.items,
    ISSUES: companyDiscoveries.filter((d) =>
      ["OPERATIONAL_ISSUE", "STRATEGIC_ISSUE"].some((c) => hasCategory(d, c)),
    ).length,
    POLICY_REGULATION: companyDiscoveries.filter((d) =>
      hasCategory(d, "POLICY_REGULATION"),
    ).length,
    BUSINESS_OPPORTUNITY: companyDiscoveries.filter((d) =>
      hasCategory(d, "BUSINESS_OPPORTUNITY"),
    ).length,
  };
  const budget = Number(data.settings.monthlyBudget || 10),
    pct = Math.min(100, (data.usage.cost / budget) * 100);
  const trend = Array.from({ length: 5 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (4 - i) * 7);
    const end = new Date(dt);
    end.setDate(end.getDate() + 7);
    return {
      date: dt.toLocaleDateString("de-DE", { month: "short", day: "numeric" }),
      value: filtered.filter(
        (d) =>
          hasCategory(d, "BUSINESS_OPPORTUNITY") &&
          new Date(d.createdAt) >= dt &&
          new Date(d.createdAt) < end,
      ).length,
    };
  });
  return (
    <div className="app-shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <button className="close-mobile" onClick={() => setMobile(false)}>
          <X />
        </button>
        <div className="logo">
          <div className="logo-wave">〽</div>
          <div>
            <b>Mobility Pulse AI</b>
            <span>Intelligenz für den öffentlichen Verkehr</span>
          </div>
        </div>
        <nav>
          {nav.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={page === n.id ? "active" : ""}
              aria-current={page === n.id ? "page" : undefined}
              onClick={() => {
                setPage(n.id);
                setMobile(false);
              }}
            >
              <n.icon />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="usage">
          <div>
            <span>KI-Nutzung (monatlich)</span>
            <HelpTip
              text="Zeigt die protokollierten Langdock-Kosten des laufenden Monats im Verhältnis zum eingestellten Monatsbudget. Gespeicherte Berichte erneut zu öffnen verursacht keine neue Nutzung."
              href="/leitfaden#wirtschaftlichkeit"
            />
          </div>
          <strong>
            €{data.usage.cost.toFixed(2)} <em>/ €{budget.toFixed(2)}</em>
          </strong>
          <div className="progress">
            <i style={{ width: `${pct}%` }} />
          </div>
          <b>{Math.round(pct)}%</b>
        </div>
      </aside>
      <main>
        <header>
          <button className="menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div>
            <h1>Mobility Pulse AI</h1>
            <p>Entwicklungen und Chancen im deutschen Verkehr</p>
          </div>
          <div className="search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen (z. B. Stadt, ÖPNV, Ticketing)"
            />
          </div>
          <Bell className="bell" />
          <details className="profile-menu">
            <summary className="avatar" aria-label="Profilmenü öffnen">
              MP
            </summary>
            <div className="profile-popover">
              <div className="profile-identity">
                <span className="avatar small">MP</span>
                <span>
                  <b>Demo-Zugang</b>
                  <small>Mobility Pulse AI</small>
                </span>
              </div>
              <LogoutButton variant="menu" />
            </div>
          </details>
        </header>
        {page === "overview" && (
          <div className="content">
            <CompanyFilter value={company} onChange={setCompany} />
            <section className="kpis">
              <Kpi
                title="Erfasste Meldungen"
                value={counts.NEWS}
                tone="blue"
                icon={FileText}
                active={false}
                onClick={() => {
                  setFilter(null);
                  setPage("collected");
                }}
                help="Zählt alle gespeicherten Rohdatensätze – einschließlich noch ausstehender, später ausgeschlossener oder bereits analysierter Meldungen. Es ist nicht die Zahl der KI-Erkenntnisse."
              />
              <Kpi
                title="Erkannte Probleme"
                value={counts.ISSUES}
                tone="red"
                icon={TriangleAlert}
                active={filter === "ISSUES"}
                onClick={() => setFilter(filter === "ISSUES" ? null : "ISSUES")}
                help="Zählt aktive, KI-identifizierte betriebliche oder strategische Verkehrsprobleme, passend zum aktiven Unternehmensfilter."
              />
              <Kpi
                title="Politik & Regulierung"
                value={counts.POLICY_REGULATION}
                tone="purple"
                icon={Scale}
                active={filter === "POLICY_REGULATION"}
                onClick={() =>
                  setFilter(
                    filter === "POLICY_REGULATION" ? null : "POLICY_REGULATION",
                  )
                }
                help="Zählt aktive, ausgewählte politische und regulatorische Entwicklungen, passend zum aktiven Unternehmensfilter."
              />
              <Kpi
                title="Beratungspotenziale"
                value={counts.BUSINESS_OPPORTUNITY}
                tone="green"
                icon={Target}
                active={filter === "BUSINESS_OPPORTUNITY"}
                onClick={() =>
                  setFilter(
                    filter === "BUSINESS_OPPORTUNITY"
                      ? null
                      : "BUSINESS_OPPORTUNITY",
                  )
                }
                help="Zählt aktive, KI-identifizierte Geschäftspotenziale zum aktiven Unternehmensfilter. Ein Potenzial ist kein bestätigter Auftrag."
              />
            </section>
            <section className="dashboard-grid">
              <div className="panel map-panel">
                <div className="panel-title">
                  <div>
                    <h2>
                      Aktivitäten in Deutschland{" "}
                      <HelpTip
                        text="Die Karte zeigt ausschließlich aktive Erkenntnisse der aktuellen Filter, für die belastbare Koordinaten oder eine verifizierte regionale Zuordnung vorliegen."
                        href="/leitfaden#architektur"
                      />
                    </h2>
                    <p>
                      Geografisch zugeordnete Meldungen der aktuellen Filter
                    </p>
                  </div>
                </div>
                <GermanyMap
                  items={filtered.map((d) => ({
                    id: d.id,
                    title: d.item.title,
                    city: d.city,
                    federalState: d.federalState,
                    latitude: d.latitude,
                    longitude: d.longitude,
                    category: d.category,
                    publishedAt: d.item.publishedAt,
                    source: d.item.source.name,
                    item: {
                      city: d.item.city,
                      federalState: d.item.federalState,
                      latitude: d.item.latitude,
                      longitude: d.item.longitude,
                      geographicScope: d.item.geographicScope,
                    },
                  }))}
                  onSelect={(id) =>
                    setSelected(
                      data.discoveries.find((d) => d.id === id) || null,
                    )
                  }
                />
              </div>
              <div className="panel discoveries">
                <div className="panel-title row">
                  <div>
                    <h2>
                      ✣ <span>KI-Erkenntnisse</span>{" "}
                      <HelpTip
                        text="Ausgewählte, KI-klassifizierte Entwicklungen. Diese Ansicht ist kleiner als das vollständige Archiv der Verkehrsnachrichten."
                        href="/leitfaden#seiten"
                      />
                    </h2>
                    <small>
                      Ausstehend {data.processing.PENDING || 0} · Analysiert{" "}
                      {data.processing.ANALYZED || 0} · Übersprungen{" "}
                      {data.processing.SKIPPED || 0} · Fehlgeschlagen{" "}
                      {data.processing.FAILED || 0} · Budgetbedingt
                      zurückgestellt {data.processing.DEFERRED || 0}
                    </small>
                  </div>
                  <div className="tabs">
                    {[
                      [null, "Alle"],
                      ["BUSINESS_OPPORTUNITY", "Potenziale"],
                      ["ISSUES", "Probleme"],
                      ["POLICY_REGULATION", "Politik"],
                    ].map(([v, l]) => (
                      <button
                        key={l!}
                        className={filter === v ? "active" : ""}
                        onClick={() => setFilter(v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <DiscoveryList items={filtered} onSelect={setSelected} />
              </div>
              <div className="right-col">
                <div className="panel trend">
                  <div className="panel-title">
                    <h2>
                      <TrendingUp /> Trends{" "}
                      <HelpTip
                        text="Zeigt die Anzahl der gefilterten Beratungspotenziale nach ihrem Erstellungszeitraum. Der Verlauf ist keine Prognose."
                        href="/leitfaden#architektur"
                      />
                    </h2>
                    <p>Erkannte Chancen im Zeitverlauf</p>
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={trend}>
                      <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0"
                            stopColor="#20b75a"
                            stopOpacity=".35"
                          />
                          <stop
                            offset="1"
                            stopColor="#20b75a"
                            stopOpacity=".03"
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e9edf4" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#20a94f"
                        fill="url(#g)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="panel recent">
                  <div className="panel-title row">
                    <h2>
                      <Database /> Aktuelle Quellen{" "}
                      <HelpTip
                        text="Zeigt zuletzt registrierte Quellen. Der technische Typ sagt nicht automatisch aus, dass der letzte Scan erfolgreich war; dafür sind Status und Scanzeitpunkt maßgeblich."
                        href="/leitfaden#seiten"
                      />
                    </h2>
                    <button onClick={() => setPage("sources")}>
                      Alle anzeigen <ChevronRight />
                    </button>
                  </div>
                  {data.sources.slice(0, 4).map((s) => (
                    <div className="source-row" key={s.id}>
                      <CheckCircle2 />
                      <span>{s.name}</span>
                      <b>{s.type}</b>
                    </div>
                  ))}
                  {!data.sources.length && (
                    <Empty text="Keine Quellen konfiguriert" />
                  )}
                </div>
                <div className="panel next">
                  <div className="panel-title row">
                    <div>
                      <h2>
                        <CalendarDays /> Nächster Scan{" "}
                        <HelpTip
                          text="Geplanter nächster Erfassungszeitpunkt gemäß Scan-Konfiguration. Ein manueller Scan kann zusätzlich ausgelöst werden."
                          href="/leitfaden#seiten"
                        />
                      </h2>
                      <p>Heute, 16:00 Uhr</p>
                    </div>
                  </div>
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => scan()}
                  >
                    <RefreshCw className={busy ? "spin" : ""} />
                    {busy ? "Scan läuft…" : "Jetzt scannen"}
                  </button>
                  {data.lastScan && (
                    <small>
                      Zuletzt:{" "}
                      {new Date(data.lastScan.startedAt).toLocaleString(
                        "de-DE",
                      )}{" "}
                      · {data.lastScan.newItems} neu · {data.lastScan.errors}{" "}
                      Fehler
                    </small>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
        {page === "discoveries" && (
          <div className="page">
            <CompanyFilter value={company} onChange={setCompany} />
            <div className="page-head">
              <h2>Erkenntnisse</h2>
              <p>KI-klassifizierte Geschäftsinformationen zum Verkehr</p>
            </div>
            <div className="panel list-panel">
              <DiscoveryList items={filtered} onSelect={setSelected} />
            </div>
          </div>
        )}
        {page === "consultations" && <ConsultationsPage />}
        {page === "news" && <TransportNewsPage key={query} query={query} />}
        {page === "collected" && (
          <CollectedItemsPage key={query} query={query} />
        )}
        {page === "sources" && (
          <QuellenPage
            sources={data.sources}
            refresh={load}
            scan={scan}
            busy={busy}
          />
        )}{" "}
        {page === "settings" && (
          <EinstellungenPage data={data} refresh={load} />
        )}{" "}
        {page === "guide" && <ProductGuide />}
      </main>
      {selected && <Detail d={selected} close={() => setSelected(null)} />}{" "}
      {mobile && <div className="backdrop" onClick={() => setMobile(false)} />}
    </div>
  );
}
function HelpTip({ text, href }: { text: string; href?: string }) {
  return (
    <span className="help-tip">
      <button
        type="button"
        aria-label="Weitere Erklärung"
        aria-describedby={`help-${text.slice(0, 18).replace(/\W/g, "")}`}
      >
        <Info />
      </button>
      <span
        className="help-tip-popover"
        id={`help-${text.slice(0, 18).replace(/\W/g, "")}`}
        role="tooltip"
      >
        {text}
        {href && <a href={href}>Im Leitfaden nachlesen</a>}
      </span>
    </span>
  );
}
function Kpi({ title, value, tone, icon: Icon, active, onClick, help }: any) {
  return (
    <div className={`kpi-wrap ${tone}`}>
      <button
        className={`kpi ${tone} ${active ? "selected" : ""}`}
        onClick={onClick}
      >
        <span className="icon">
          <Icon />
        </span>
        <span>
          <b>{value}</b>
          <em>{title}</em>
        </span>
        <small>↗</small>
      </button>
      <HelpTip text={help} href="/leitfaden#seiten" />
    </div>
  );
}
function CompanyFilter({
  value,
  onChange,
}: {
  value: "ALL" | "MOBILITE" | "BSL";
  onChange: (v: "ALL" | "MOBILITE" | "BSL") => void;
}) {
  return (
    <div className="company-filter" aria-label="Unternehmensfilter">
      <span>Unternehmenspassung</span>
      {[
        ["ALL", "Alle Unternehmen"],
        ["MOBILITE", "mobilité"],
        ["BSL", "BSL"],
      ].map(([v, l]) => (
        <button
          key={v}
          className={value === v ? "active" : ""}
          onClick={() => onChange(v as "ALL" | "MOBILITE" | "BSL")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
function DiscoveryList({
  items,
  onSelect,
}: {
  items: Discovery[];
  onSelect: (d: Discovery) => void;
}) {
  if (!items.length)
    return (
      <Empty text="Keine Erkenntnisse entsprechen den gewählten Filtern." />
    );
  return (
    <div className="cards">
      {items.map((d) => {
        const x = info[d.category],
          Icon = x.icon,
          advisor = consultationAction(d.item.advisorReports?.[0]?.status);
        return (
          <article
            className={`discovery-card ${x.color}`}
            key={d.id}
            onClick={() => onSelect(d)}
          >
            <div className="card-category">
              <span>
                <Icon />
                {x.label}
              </span>
              <b>{Math.round(d.relevanceScore)}% relevant</b>
            </div>
            {d.companyMatches.length > 0 && (
              <div className="company-tags">
                {d.companyMatches.map((m) => (
                  <span key={m.companyKey}>
                    {m.companyKey === "MOBILITE" ? "mobilité" : "BSL"} ·{" "}
                    {Math.round(m.fitScore)}% Passung
                  </span>
                ))}
              </div>
            )}
            <h3>{d.item.title}</h3>
            <p>{d.summary}</p>
            <footer>
              <span>
                <MapPin />
                {[d.city, d.federalState].filter(Boolean).join(" · ") ||
                  "Ort nicht verifiziert"}
              </span>
              <span>
                <CalendarDays />
                {rel(d.item.publishedAt)}
              </span>
              <a
                href={d.item.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink />
                Quelle anzeigen
              </a>
              <a
                className={`advisor-button ${advisor.tone}`}
                href={`/news/${d.item.id}/advisor`}
                onClick={(e) => e.stopPropagation()}
              >
                <Sparkles />
                {advisor.label}
              </a>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Lightbulb />
      <b>Noch keine Inhalte</b>
      <p>{text}</p>
    </div>
  );
}
function ListPage({ title, subtitle, children }: any) {
  return (
    <div className="page">
      <div className="page-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="panel list-panel">{children}</div>
    </div>
  );
}
const newsLabels: Record<string, string> = {
  PUBLIC_TRANSPORT_BUS: "ÖPNV / Bus",
  REGIONAL_RAIL: "SPNV / Regionalverkehr",
  LONG_DISTANCE_RAIL: "Fernverkehr",
  URBAN_RAIL: "Straßenbahn / U-Bahn / S-Bahn",
  FREIGHT_TRANSPORT: "Güterverkehr",
  INFRASTRUCTURE: "Infrastruktur",
  TARIFFS_TICKETING: "Tarife / Ticketing",
  FINANCING_FUNDING: "Finanzierung / Förderung",
  REGULATION_POLICY: "Regulierung / Politik",
  PROCUREMENT_TENDERS: "Vergaben / Ausschreibungen",
  MOBILITY_INNOVATION: "Mobilitätsinnovation",
  OPERATIONS_SERVICE: "Betrieb / Service",
};
function TransportNewsPage({ query }: { query: string }) {
  const [page, setPage] = useState(1),
    [state, setState] = useState(""),
    [city, setCity] = useState(""),
    [sector, setSector] = useState(""),
    [publisher, setPublisher] = useState(""),
    [dateFrom, setDateFrom] = useState(""),
    [dateTo, setDateTo] = useState(""),
    [sort, setSort] = useState("newest"),
    [result, setResult] = useState<{
      items: NewsItem[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
      facets: { states: string[]; cities: string[]; publishers: string[] };
    } | null>(null);
  useEffect(() => {
    let active = true;
    const p = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      query,
      state,
      city,
      sector,
      publisher,
      dateFrom,
      dateTo,
      sort,
    });
    fetch(`/api/news?${p}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((r) => {
        if (active) setResult(r);
      });
    return () => {
      active = false;
    };
  }, [page, query, state, city, sector, publisher, dateFrom, dateTo, sort]);
  const change =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
      setResult(null);
    };
  return (
    <div className="page">
      <div className="page-head">
        <h2>Verkehrsnachrichten</h2>
        <p>
          Verifizierte Verkehrsmeldungen – unabhängig von der Bewertung als
          Geschäftschance.
        </p>
      </div>
      <div className="news-filters">
        <label>
          Von
          <input type="date" value={dateFrom} onChange={change(setDateFrom)} />
        </label>
        <label>
          Bis
          <input type="date" value={dateTo} onChange={change(setDateTo)} />
        </label>
        <label>
          Bundesland
          <select value={state} onChange={change(setState)}>
            <option value="">Alle Bundesländer</option>
            {result?.facets.states.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Stadt / Landkreis
          <input
            value={city}
            onChange={change(setCity)}
            placeholder="Alle Regionen"
          />
        </label>
        <label>
          Verkehrsbereich
          <select value={sector} onChange={change(setSector)}>
            <option value="">Alle Bereiche</option>
            {Object.entries(newsLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Herausgeber
          <select value={publisher} onChange={change(setPublisher)}>
            <option value="">Alle Herausgeber</option>
            {result?.facets.publishers.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Sortierung
          <select value={sort} onChange={change(setSort)}>
            <option value="newest">Neueste</option>
            <option value="relevance">Relevanz</option>
          </select>
        </label>
      </div>
      <div className="panel news-list">
        {!result ? (
          <div className="empty">
            <RefreshCw className="spin" />
            <b>Verkehrsnachrichten werden geladen…</b>
          </div>
        ) : !result.items.length ? (
          <Empty text="Keine Verkehrsnachrichten entsprechen diesen Filtern." />
        ) : (
          result.items.map((item) => {
            const advisor = consultationAction(
              item.advisorReports?.[0]?.status,
            );
            return (
              <article className="news-item" key={item.id}>
                <div className="news-topline">
                  <span>
                    {newsLabels[item.newsCategory] || item.newsCategory}
                  </span>
                  <span>{item.source.name}</span>
                  {item.sourceReferences.length > 1 && (
                    <span className="multi-source-badge">
                      {item.sourceReferences.length} Quellen · ein Thema
                    </span>
                  )}
                  {item.discovery?.active && (
                    <span className="intelligence-link">
                      KI-Erkenntnis ·{" "}
                      {Math.round(item.discovery.relevanceScore)}%
                    </span>
                  )}
                </div>
                <h3>{item.title}</h3>
                <p>
                  {item.factualSummary ||
                    "Keine sachliche Zusammenfassung verfügbar."}
                </p>
                <footer>
                  <span>
                    <CalendarDays />
                    {new Date(item.publishedAt).toLocaleDateString("de-DE")}
                  </span>
                  <span>
                    <MapPin />
                    {[item.city, item.district, item.federalState]
                      .filter(Boolean)
                      .join(" · ") || "Geografische Zuordnung fehlt"}
                  </span>
                  <a
                    className={`advisor-button ${advisor.tone}`}
                    href={`/news/${item.id}/advisor`}
                  >
                    <Sparkles />
                    {advisor.label}
                  </a>
                  <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Originalquelle
                  </a>
                  {item.sourceReferences.length > 1 && (
                    <details className="news-source-menu">
                      <summary>Alle Quellen</summary>
                      <div>
                        {item.sourceReferences.map((reference) => (
                          <a
                            key={reference.id}
                            href={reference.canonicalUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink /> {reference.source.name}
                          </a>
                        ))}
                      </div>
                    </details>
                  )}
                </footer>
              </article>
            );
          })
        )}
        {result && (
          <div className="pagination">
            <span>
              {result.pagination.total
                ? `Anzeige ${(page - 1) * 20 + 1}–${Math.min(page * 20, result.pagination.total)} von ${result.pagination.total}`
                : "Anzeige 0 von 0"}
            </span>
            <div>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Zurück
              </button>
              <b>
                Seite {page} von {result.pagination.totalPages}
              </b>
              <button
                disabled={page >= result.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Weiter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
type ConsultationListItem = {
  id: string;
  itemId: string;
  title: string;
  publisher: string;
  articlePublishedAt: string;
  createdAt: string;
  lastActivityAt: string;
  status: string;
  messageCount: number;
  opportunityPotential?: string | null;
};
function ConsultationsPage() {
  const [page, setPage] = useState(1),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [result, setResult] = useState<{
      items: ConsultationListItem[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
      statusCounts: Record<string, number>;
    } | null>(null);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "10",
      query,
      status,
    });
    fetch(`/api/consultations?${params}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((value) => {
        if (active) setResult(value);
      });
    return () => {
      active = false;
    };
  }, [page, query, status]);
  const statusLabel: Record<string, string> = {
      PENDING: "Analyse läuft",
      RUNNING: "Analyse läuft",
      COMPLETED: "Abgeschlossen",
      FAILED: "Fehlgeschlagen",
      DEFERRED: "Budgetbedingt zurückgestellt",
    },
    potentialLabel: Record<string, string> = {
      None: "Kein Potenzial",
      Low: "Gering",
      Medium: "Mittel",
      High: "Hoch",
    };
  return (
    <div className="page consultations-page">
      <div className="page-head">
        <h2>
          Meine Beratungen{" "}
          <HelpTip
            text="Zeigt ausschließlich tatsächlich gespeicherte Beratungsanalysen. Das Öffnen eines vorhandenen Verlaufs erzeugt keine neue Langdock-Anfrage."
            href="/leitfaden#beratung"
          />
        </h2>
        <p>
          Gespeicherte Beratungsanalysen öffnen und bestehende Gespräche
          fortsetzen.
        </p>
      </div>
      <div className="consultation-filters">
        <label>
          <Search />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Titel oder Herausgeber durchsuchen"
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="Beratungsstatus"
        >
          <option value="">Alle Status</option>
          <option value="COMPLETED">Abgeschlossen</option>
          <option value="RUNNING">Analyse läuft</option>
          <option value="PENDING">Analyse wartet</option>
          <option value="FAILED">Fehlgeschlagen</option>
          <option value="DEFERRED">Budgetbedingt zurückgestellt</option>
        </select>
      </div>
      <div className="panel consultation-list">
        {!result ? (
          <div className="empty">
            <RefreshCw className="spin" />
            <b>Beratungen werden geladen…</b>
          </div>
        ) : !result.items.length ? (
          <Empty text="Für diese Auswahl sind keine gespeicherten Beratungen vorhanden." />
        ) : (
          result.items.map((item) => {
            const action =
              item.status === "COMPLETED"
                ? "Beratung fortsetzen"
                : item.status === "FAILED" || item.status === "DEFERRED"
                  ? "Details anzeigen"
                  : "Analyse ansehen";
            return (
              <article className="consultation-item" key={item.id}>
                <div className="consultation-main">
                  <div className="consultation-topline">
                    <span
                      className={`consultation-status ${item.status.toLowerCase()}`}
                    >
                      {statusLabel[item.status] || item.status}
                    </span>
                    {item.opportunityPotential && (
                      <span>
                        Beratungspotenzial:{" "}
                        {potentialLabel[item.opportunityPotential] ||
                          item.opportunityPotential}
                      </span>
                    )}
                  </div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.publisher} · Artikel vom{" "}
                    {new Date(item.articlePublishedAt).toLocaleDateString(
                      "de-DE",
                    )}
                  </p>
                  <div className="consultation-meta">
                    <span>
                      <CalendarDays />
                      Erstellt{" "}
                      {new Date(item.createdAt).toLocaleString("de-DE")}
                    </span>
                    <span>
                      <Clock />
                      Letzte Aktivität{" "}
                      {new Date(item.lastActivityAt).toLocaleString("de-DE")}
                    </span>
                    <span>
                      <MessageSquareText />
                      {item.messageCount} Gesprächsnachrichten
                    </span>
                  </div>
                </div>
                <a
                  className="primary consultation-open"
                  href={`/news/${item.itemId}/advisor`}
                >
                  {action}
                  <ChevronRight />
                </a>
              </article>
            );
          })
        )}
        {result && (
          <div className="pagination">
            <span>
              {result.pagination.total
                ? `Anzeige ${(page - 1) * result.pagination.pageSize + 1}–${Math.min(page * result.pagination.pageSize, result.pagination.total)} von ${result.pagination.total}`
                : "Anzeige 0 von 0"}
            </span>
            <div>
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Zurück
              </button>
              <b>
                Seite {page} von {result.pagination.totalPages}
              </b>
              <button
                disabled={page >= result.pagination.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Weiter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function CollectedItemsPage({ query }: { query: string }) {
  const [page, setPage] = useState(1),
    [result, setResult] = useState<{
      items: RawItem[];
      pagination: {
        page: number;
        pageSize: number;
        filteredTotal: number;
        totalPages: number;
      };
      stats: {
        total: number;
        analyzed: number;
        pending: number;
        excluded: number;
      };
    } | null>(null);
  useEffect(() => {
    let active = true;
    fetch(
      `/api/items?page=${page}&pageSize=20&query=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    )
      .then((r) => r.json())
      .then((r) => {
        if (active) setResult(r);
      });
    return () => {
      active = false;
    };
  }, [page, query]);
  const statusLabel: Record<RawItem["analysisStatus"], string> = {
    PENDING: "Analyse ausstehend",
    EXCLUDED: "Ausgeschlossen",
    DISCOVERY: "Aktive Erkenntnis",
    ANALYZED: "Analysiert",
  };
  return (
    <div className="page">
      <div className="page-head">
        <h2>Erfasste Meldungen</h2>
        <p>
          Alle Rohbeiträge einschließlich aktiver Erkenntnisse, ausgeschlossener
          Beiträge und ausstehender Analysen.
        </p>
      </div>
      {result && (
        <div className="collection-stats">
          <span>
            <b>{result.stats.total}</b>Rohbeiträge gesamt
          </span>
          <span>
            <b>{result.stats.analyzed}</b>Analysiert
          </span>
          <span>
            <b>{result.stats.excluded}</b>Ausgeschlossen
          </span>
          <span>
            <b>{result.stats.pending}</b>Ausstehend
          </span>
        </div>
      )}
      <div className="panel raw-list">
        {!result ? (
          <div className="empty">
            <RefreshCw className="spin" />
            <b>Gesammelte Beiträge werden geladen…</b>
          </div>
        ) : !result.items.length ? (
          <Empty text="Keine gesammelten Beiträge entsprechen dieser Suche." />
        ) : (
          result.items.map((item) => (
            <article className="raw-item" key={item.id}>
              <div className="raw-main">
                <div className="raw-meta">
                  <span
                    className={`analysis-badge ${item.analysisStatus.toLowerCase()}`}
                  >
                    {statusLabel[item.analysisStatus]}
                  </span>
                  {item.discovery && (
                    <span className="category-badge">
                      {info[item.discovery.category]?.label ||
                        item.discovery.category}{" "}
                      · {Math.round(item.discovery.relevanceScore)}%
                    </span>
                  )}
                  <span>
                    {item.source.name} · {item.source.type}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <div className="raw-dates">
                  <span>
                    <CalendarDays />
                    Veröffentlicht{" "}
                    {new Date(item.publishedAt).toLocaleDateString("de-DE")}
                  </span>
                  <span>
                    <Clock />
                    Gesammelt{" "}
                    {new Date(item.collectedAt).toLocaleString("de-DE")}
                  </span>
                  {item.analyzedAt && (
                    <span>
                      <CheckCircle2 />
                      Analysiert{" "}
                      {new Date(item.analyzedAt).toLocaleString("de-DE")}
                    </span>
                  )}
                </div>
              </div>
              <a
                className="raw-source"
                href={item.canonicalUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                Originalquelle
              </a>
            </article>
          ))
        )}
        {result && (
          <div className="pagination">
            <span>
              {result.pagination.filteredTotal
                ? `Anzeige ${(result.pagination.page - 1) * result.pagination.pageSize + 1}–${Math.min(result.pagination.page * result.pagination.pageSize, result.pagination.filteredTotal)} von ${result.pagination.filteredTotal}`
                : "Anzeige 0 von 0"}
            </span>
            <div>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Zurück
              </button>
              <b>
                Seite {page} von {result.pagination.totalPages}
              </b>
              <button
                disabled={page >= result.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Weiter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function QuellenPage({
  sources,
  refresh,
  scan,
  busy,
}: {
  sources: Source[];
  refresh: () => void;
  scan: (id?: string) => void;
  busy: boolean;
}) {
  const [show, setShow] = useState(false),
    [form, setForm] = useState({ name: "", url: "", type: "", publisherType: "OTHER" }),
    [message, setMessage] = useState(""),
    [coverage, setCoverage] = useState<CoverageReport | null>(null);
  useEffect(() => {
    fetch("/api/coverage", { cache: "no-store" })
      .then((response) => response.json())
      .then(setCoverage);
  }, [sources]);
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: form.type || undefined }),
    });
    const j = await r.json();
    if (!r.ok) return setMessage(j.error);
    setShow(false);
    setForm({ name: "", url: "", type: "", publisherType: "OTHER" });
    refresh();
  };
  const toggle = async (s: Source) => {
    await fetch("/api/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, enabled: !s.enabled }),
    });
    refresh();
  };
  const test = async (s: Source) => {
    setMessage("Verbindung wird getestet…");
    const r = await fetch("/api/sources/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const j = await r.json();
    setMessage(`${s.name}: ${j.message}`);
  };
  const del = async (s: Source) => {
    if (confirm(`Löschen ${s.name}?`)) {
      await fetch(`/api/sources?id=${s.id}`, { method: "DELETE" });
      refresh();
    }
  };
  return (
    <div className="page">
      <div className="page-head row">
        <div>
          <h2>Quellen</h2>
          <p>
            Datenquellen und Schnittstellen für Verkehrsinformationen verwalten
          </p>
        </div>
        <button className="primary compact" onClick={() => setShow(true)}>
          <Plus />
          Quelle hinzufügen
        </button>
      </div>
      {message && (
        <div className="notice">
          {message}
          <button onClick={() => setMessage("")}>
            <X />
          </button>
        </div>
      )}
      {coverage && (
        <section className="coverage-report">
          <div className="coverage-kpis">
            <span>
              <b>{coverage.totalVerifiedActiveSources}</b>Verifizierte aktive
              Quellen
            </span>
            <span>
              <b>
                {coverage.coveredStates} / {coverage.totalStates}
              </b>
              Bundesländer direkt abgedeckt
            </span>
            <span>
              <b>{coverage.directDistrictCoverage}</b>Landkreise direkt
              abgedeckt
            </span>
            <span>
              <b>{coverage.citiesWithLocalSources}</b>Städte mit lokaler Quelle
            </span>
          </div>
          <div className="panel coverage-panel">
            <div>
              <h3>Abdeckung nach Bundesland</h3>
              <p>
                Bundesweite Feeds zählen nicht als direkte Landes- oder
                Kreisabdeckung.
              </p>
            </div>
            <div className="state-coverage">
              {coverage.states.map((state) => (
                <div
                  className={state.covered ? "covered" : "gap"}
                  key={state.state}
                >
                  <span>
                    {state.covered ? <CheckCircle2 /> : <TriangleAlert />}
                    <b>{state.state}</b>
                  </span>
                  <small>
                    {state.covered
                      ? `${state.sources.length} Quelle${state.sources.length === 1 ? "" : "n"} · ${state.articles} Meldungen`
                      : `Lücke · ${state.candidateStatus}`}
                  </small>
                </div>
              ))}
            </div>
            <div className="coverage-sectors">
              <b>Abgedeckte Verkehrsbereiche</b>
              <p>
                {coverage.sectors.join(" · ") ||
                  "Noch keine Sektoren verifiziert"}
              </p>
              <small>
                Kandidaten:{" "}
                {Object.entries(coverage.candidateSummary)
                  .map(([key, value]) => `${key} ${value}`)
                  .join(" · ") || "keine"}
              </small>
            </div>
          </div>
        </section>
      )}
      <div className="source-class-summary">
        <span><b>{sources.filter((s) => s.publisherType === "SPECIALIST_MEDIA").length}</b>Fachmedien</span>
        <span><b>{sources.filter((s) => s.publisherType === "GENERAL_NEWS_MEDIA").length}</b>Allgemeine Nachrichtenmedien</span>
        <small>Allgemeine Medien werden vor der Speicherung auf Verkehrsrelevanz geprüft.</small>
      </div>
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Quelle</th>
              <th>Typ</th>
              <th>Medienklasse</th>
              <th>Status</th>
              <th>Letzter erfolgreicher Scan</th>
              <th>Fehler</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td>
                  <b>{s.name}</b>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.url}
                  </a>
                </td>
                <td>
                  <span className="pill">{s.type}</span>
                </td>
                <td>
                  <span className="pill media-class">
                    {s.publisherType === "GENERAL_NEWS_MEDIA"
                      ? "Allgemeines Nachrichtenmedium"
                      : s.publisherType === "SPECIALIST_MEDIA"
                        ? "Fachmedium"
                        : "Institutionelle Quelle"}
                  </span>
                </td>
                <td>
                  <button
                    className={`toggle ${s.enabled ? "on" : ""}`}
                    onClick={() => toggle(s)}
                  >
                    <i />
                  </button>
                </td>
                <td>
                  {s.lastSuccessfulScan
                    ? new Date(s.lastSuccessfulScan).toLocaleString("de-DE")
                    : "Nie"}
                </td>
                <td className={s.lastError ? "error" : ""}>
                  {s.lastError || "—"}
                </td>
                <td>
                  <div className="actions">
                    <button title="Verbindung testen" onClick={() => test(s)}>
                      <TestTube2 />
                    </button>
                    <button
                      title="Quelle scannen"
                      disabled={busy}
                      onClick={() => scan(s.id)}
                    >
                      <RefreshCw />
                    </button>
                    <button title="Löschen" onClick={() => del(s)}>
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!sources.length && (
          <Empty text="Fügen Sie die erste Quelle hinzu, um öffentliche Informationen zu sammeln." />
        )}
      </div>
      {show && (
        <div className="modal-bg">
          <form className="modal" onSubmit={add}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShow(false)}
            >
              <X />
            </button>
            <h2>Informationsquelle hinzufügen</h2>
            <p>Der Quellentyp kann anhand der URL erkannt werden.</p>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Öffentliche URL
              <input
                required
                type="url"
                placeholder="https://…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </label>
            <label>
              Typ
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Automatisch erkennen</option>
                <option>RSS</option>
                <option>WEBSITE</option>
                <option>API</option>
                <option>OPARL</option>
                <option>TED</option>
              </select>
            </label>
            <label>
              Medienklasse
              <select value={form.publisherType} onChange={(e) => setForm({ ...form, publisherType: e.target.value })}>
                <option value="OTHER">Institutionelle Quelle</option>
                <option value="SPECIALIST_MEDIA">Fachmedium</option>
                <option value="GENERAL_NEWS_MEDIA">Allgemeines Nachrichtenmedium</option>
              </select>
            </label>
            {message && <p className="error">{message}</p>}
            <button className="primary" type="submit">
              <Plus />
              Quelle hinzufügen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
function EinstellungenPage({
  data,
  refresh,
}: {
  data: Data;
  refresh: () => void;
}) {
  const [budget, setBudget] = useState(data.settings.monthlyBudget || "10"),
    [times, setTimes] = useState(data.settings.scanTimes || "08:00,16:00"),
    [saved, setGespeichert] = useState(false);
  const save = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyBudget: budget, scanTimes: times }),
    });
    setGespeichert(true);
    refresh();
    setTimeout(() => setGespeichert(false), 2000);
  };
  return (
    <div className="page">
      <div className="page-head">
        <h2>Einstellungen</h2>
        <p>KI-Anbieter, Ausgabenlimits und Scan-Einstellungen</p>
      </div>
      <div className="settings-grid">
        <section className="panel setting-card">
          <h3>
            <Wifi />
            Langdock-Verbindung
          </h3>
          <div className={`status ${data.aiKonfiguriert ? "ok" : "warn"}`}>
            <i />
            {data.aiKonfiguriert ? "Konfiguriert" : "Nicht konfiguriert"}
          </div>
          <p>
            {data.aiKonfiguriert
              ? "API-Schlüssel und Modell sind serverseitig konfiguriert."
              : "Die Quellensammlung bleibt verfügbar. Hinterlegen Sie LANGDOCK_API_KEY und LANGDOCK_MODEL in .env, um Analysen zu aktivieren."}
          </p>
          <small>
            Zugangsdaten bleiben serverseitig und werden hier niemals angezeigt.
          </small>
        </section>
        <section className="panel setting-card">
          <h3>
            <Euro />
            Monatliches KI-Budget
          </h3>
          <label>
            Budget in EUR
            <input
              type="number"
              min="0"
              step="0.5"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </label>
          <p>Aktuell geschätzte Nutzung: €{data.usage.cost.toFixed(4)}</p>
        </section>
        <section className="panel setting-card">
          <h3>
            <Clock />
            Scan-Zeitplan
          </h3>
          <label>
            Zeiten (Europa/Berlin)
            <input value={times} onChange={(e) => setTimes(e.target.value)} />
          </label>
          <p>Standard: zweimal täglich um 08:00 und 16:00 Uhr.</p>
        </section>
      </div>
      <button className="primary save" onClick={save}>
        {saved ? <CheckCircle2 /> : <Settings />}
        {saved ? "Gespeichert" : "Einstellungen speichern"}
      </button>
    </div>
  );
}
function Detail({ d, close }: { d: Discovery; close: () => void }) {
  const x = info[d.category],
    Icon = x.icon,
    summary = germanFactualSummary(
      d.item.factualSummary,
      d.summary,
      d.item.content,
    ),
    keyPoints = factualKeyPoints(d.item.content, d.item.title, summary),
    advisorComplete = d.item.advisorReports?.[0]?.status === "COMPLETED",
    storedArticleText = d.item.content.trim(),
    articleSources = d.item.sourceReferences?.length
      ? d.item.sourceReferences
      : [
          {
            id: d.item.canonicalUrl,
            canonicalUrl: d.item.canonicalUrl,
            title: d.item.title,
            publishedAt: d.item.publishedAt,
            source: d.item.source,
          },
        ],
    storedTextIsExcerpt =
      storedArticleText.length < 600 ||
      /(?:…|\.\.\.)\s*$/.test(storedArticleText);
  const maturity = {
    EARLY_SIGNAL: "Frühes Signal",
    PLANNED_PROJECT: "Geplantes Projekt",
    ACTIVE_TENDER: "Aktive Ausschreibung",
    AWARDED_CLOSED: "Vergeben / geschlossen",
  }[d.maturity];
  const region =
    [
      d.city || d.item.city,
      d.item.district,
      d.federalState || d.item.federalState,
    ]
      .filter(Boolean)
      .join(" · ") || "Keine verifizierte regionale Zuordnung";
  const sector = d.item.newsCategory
    ? newsLabels[d.item.newsCategory] || d.item.newsCategory
    : "Verkehr";
  return (
    <div className="drawer-bg" onClick={close}>
      <aside
        className="drawer discovery-detail"
        onClick={(e) => e.stopPropagation()}
        aria-label="Details zur KI-Erkenntnis"
      >
        <button
          className="drawer-close"
          onClick={close}
          aria-label="Detailansicht schließen"
        >
          <X />
        </button>
        <div className={`detail-tag ${x.color}`}>
          <Icon />
          {x.label}
        </div>
        <h2>{d.item.title}</h2>
        <div className="article-byline">
          <b>{d.item.source.name}</b>
          <span>
            {new Date(d.item.publishedAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="detail-meta">
          <span>
            <MapPin />
            {region}{" "}
            <HelpTip
              text="Die Region wird nur angezeigt, wenn sie aus Artikel- oder Erkenntnisdaten belegt ist. Fehlende Zuordnungen werden ausdrücklich als nicht verifiziert gekennzeichnet."
              href="/leitfaden#vertrauen"
            />
          </span>
          <span>
            <Layers3 />
            {sector}
          </span>
        </div>
        <section>
          <h3>Zusammenfassung</h3>
          <p>{summary}</p>
        </section>
        <section>
          <h3>Die wichtigsten Punkte</h3>
          {keyPoints.length >= 3 ? (
            <ul className="key-points">
              {keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : (
            <p>{summary}</p>
          )}
        </section>
        <section className="stored-article-section">
          <details className="stored-article">
            <summary>
              <span>
                <Newspaper />
                Meldungstext ausklappen
              </span>
              <small>
                {storedTextIsExcerpt
                  ? "Gespeicherter Auszug"
                  : "Gespeicherter Meldungstext"}
              </small>
            </summary>
            <div>
              {storedTextIsExcerpt && (
                <p className="excerpt-notice">
                  Diese Quelle hat im Feed nur einen gekürzten Auszug
                  bereitgestellt. Der vollständige Beitrag ist über die
                  Originalquelle erreichbar.
                </p>
              )}
              <div className="stored-article-copy">
                {storedArticleText ||
                  "Für diese Meldung wurde kein Artikeltext gespeichert."}
              </div>
              <a
                className="article-inline-source"
                href={d.item.canonicalUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                Vollständigen Beitrag in der Originalquelle lesen
              </a>
            </div>
          </details>
        </section>
        <section>
          <h3>Einordnung</h3>
          <p>{categoryContext(d.category)}</p>
        </section>
        <details className="ai-assessment">
          <summary>KI-Bewertung</summary>
          <div className="opportunity-facts">
            <span>
              <b>Reifegrad</b>
              {maturity}
            </span>
            <span>
              <b>
                Relevanz{" "}
                <HelpTip
                  text="Analytischer Wert dafür, wie stark die Meldung den fachlichen Auswahlkriterien entspricht. Er ist keine Tatsachen- oder Erfolgswahrscheinlichkeit."
                  href="/leitfaden#vertrauen"
                />
              </b>
              {Math.round(d.relevanceScore)}%
            </span>
            <span>
              <b>
                Evidenzsicherheit{" "}
                <HelpTip
                  text="Bewertet, wie gut die KI-Einordnung durch die gespeicherten Artikelinformationen gestützt wird. Sie ersetzt keine Prüfung der Originalquelle."
                  href="/leitfaden#vertrauen"
                />
              </b>
              {Math.round(d.confidenceScore)}%
            </span>
            {d.potentialCustomer && (
              <span>
                <b>Möglicher Auftraggeber</b>
                {d.potentialCustomer}
              </span>
            )}
            {d.tenderReference && (
              <span>
                <b>Vergabereferenz</b>
                {d.tenderReference}
              </span>
            )}
          </div>
          <p>{germanAiExplanation(d.evidenceSummary || d.aiExplanation)}</p>
          {d.companyMatches.map((m) => (
            <div className="company-match" key={m.companyKey}>
              <b>
                {m.companyKey === "MOBILITE" ? "mobilité" : "BSL"} ·{" "}
                {Math.round(m.fitScore)}% Unternehmenspassung{" "}
                <HelpTip
                  text="Getrennte Einschätzung der Passung zu den dokumentierten Leistungsprofilen von mobilité oder BSL. Sie ist weder Evidenzsicherheit noch Auftragswahrscheinlichkeit."
                  href="/leitfaden#beratung"
                />
              </b>
            </div>
          ))}
        </details>
        <section className="detail-actions">
          <div>
            <h3>{articleSources.length > 1 ? "Quellen zum Thema" : "Originalquelle"}</h3>
            <p>
              {articleSources.length > 1
                ? `${articleSources.length} Veröffentlichungen wurden als ein gemeinsames Nachrichtenthema erkannt.`
                : d.item.source.name}
            </p>
          </div>
          <div className="detail-source-links">
            {articleSources.map((reference, index) => (
              <a
                className={index === 0 ? "primary source-link" : "secondary-source-link"}
                href={reference.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                key={reference.id}
              >
                <ExternalLink />
                {reference.source.name}
              </a>
            ))}
            <a
              className={`advisor-button ${advisorComplete ? "saved" : "new"}`}
              href={`/news/${d.item.id}/advisor`}
            >
              <Sparkles />
              {advisorComplete
                ? "Beratungsverlauf öffnen"
                : "Beratungsassistent"}
            </a>
          </div>
        </section>
      </aside>
    </div>
  );
}
