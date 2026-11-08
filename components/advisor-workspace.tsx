"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Send,
  Sparkles,
  LayoutDashboard,
  Newspaper,
  Layers3,
  Lightbulb,
  FileText,
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import LogoutButton from "./logout-button";

type Article = {
  id: string;
  title: string;
  publisher: string;
  publishedAt: string;
  region: string;
  category: string;
  sourceUrl: string;
};
type Report = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  report: any;
  opportunityPotential: string;
  riskLevel: string;
  companyFit: string;
  maturity: string;
  decision: string;
  qualityScore: number;
  revisionCount: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
};
const de: Record<string, string> = {
  None: "Kein",
  Low: "Niedrig",
  Medium: "Mittel",
  High: "Hoch",
  Critical: "Kritisch",
  "Early Signal": "Frühes Signal",
  "Planned Project": "Geplantes Projekt",
  "Active Tender": "Aktive Ausschreibung",
  "Awarded / Closed": "Vergeben / geschlossen",
  "Not an Opportunity": "Keine Geschäftschance",
  "Pursue now": "Jetzt verfolgen",
  "Monitor and prepare": "Beobachten und vorbereiten",
  "Research further": "Weiter prüfen",
  "No actionable opportunity": "Keine konkrete Geschäftschance",
};
const val = (x?: string) => (x ? de[x] || x : "—");
const list = (xs: string[] = []) =>
  xs.length ? (
    <ul>
      {xs.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  ) : (
    <p>Keine Angaben.</p>
  );
const nav = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/?view=discoveries", label: "Erkenntnisse", icon: Lightbulb },
  {
    href: "/?view=news",
    label: "Verkehrsnachrichten",
    icon: Newspaper,
    active: true,
  },
  { href: "/?view=collected", label: "Gesammelte Beiträge", icon: FileText },
  { href: "/?view=sources", label: "Quellen", icon: Layers3 },
  { href: "/?view=settings", label: "Einstellungen", icon: Settings },
];

export default function AdvisorWorkspace({ article }: { article: Article }) {
  const [report, setReport] = useState<Report | null>(null),
    [status, setStatus] = useState("NOT_STARTED"),
    [error, setError] = useState(""),
    [elapsed, setElapsed] = useState(0),
    [question, setQuestion] = useState(""),
    [messages, setMessages] = useState<
      Array<{ role: string; content: string; createdAt?: string }>
    >([]),
    [sending, setSending] = useState(false),
    [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    let active = true,
      timer: ReturnType<typeof setInterval>;
    const poll = async () => {
      const r = await fetch(`/api/advisor/${article.id}`, {
          cache: "no-store",
        }),
        j = await r.json();
      if (!active) return;
      if (!r.ok) {
        setError(j.error);
        return;
      }
      setStatus(j.status);
      setUpdateAvailable(Boolean(j.updateAvailable));
      if (j.report) {
        setReport(j.report);
        setMessages(j.report.messages || []);
        return;
      }
      if (j.status === "NOT_STARTED") {
        const start = await fetch(`/api/advisor/${article.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start" }),
          }),
          s = await start.json();
        if (!start.ok) setError(s.error);
        else setStatus(s.status);
      }
      if (["FAILED", "DEFERRED"].includes(j.status))
        setError(j.error || "Die Analyse konnte nicht abgeschlossen werden.");
    };
    poll();
    timer = setInterval(poll, 2500);
    const clock = setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(clock);
    };
  }, [article.id]);
  const retry = async () => {
    setError("");
    setElapsed(0);
    const r = await fetch(`/api/advisor/${article.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      }),
      j = await r.json();
    if (!r.ok) setError(j.error);
    else setStatus(j.status);
  };
  const send = async (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || sending) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setSending(true);
    const r = await fetch(`/api/advisor/${article.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", question: q }),
      }),
      j = await r.json();
    setSending(false);
    setMessages((m) => [
      ...m,
      { role: "assistant", content: r.ok ? j.answer : `Fehler: ${j.error}` },
    ]);
  };
  const a = report?.report;
  return (
    <div className="advisor-shell">
      <aside className="advisor-sidebar">
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
              key={n.label}
              href={n.href}
              className={n.active ? "active" : ""}
            >
              <n.icon />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main className="advisor-main">
        <header className="advisor-topbar">
          <div>
            <b>Mobility Pulse AI</b>
            <span>KI-gestützte Verkehrsinformationen</span>
          </div>
        </header>
        <div className="advisor-content">
          <div className="advisor-breadcrumb">
            <Link href="/?view=news">Verkehrsnachrichten</Link>
            <span>/</span>
            <b>Beratungsassistent</b>
          </div>
          <section className="advisor-compact-header">
            <div className="advisor-kicker">
              <Sparkles />
              KI-Beratungsassistent
            </div>
            <h1>{article.title}</h1>
            <div className="advisor-article-meta">
              <span>{article.publisher}</span>
              <span>
                {new Date(article.publishedAt).toLocaleDateString("de-DE")}
              </span>
              <span>{article.region}</span>
              <span>{article.category.replaceAll("_", " ")}</span>
              <a href={article.sourceUrl} target="_blank" rel="noreferrer">
                Originalquelle <ExternalLink />
              </a>
            </div>
            {report && (
              <div className="consultation-saved">
                <CheckCircle2 />
                Gespeichert · Analyse vom{" "}
                {new Date(
                  report.completedAt || report.createdAt,
                ).toLocaleString("de-DE")}
              </div>
            )}
          </section>
          {updateAvailable && (
            <div className="advisor-update-notice">
              Für diesen Artikel sind neuere Inhalte oder Analyseeinstellungen
              verfügbar. Der gespeicherte Beratungsverlauf bleibt unverändert.
            </div>
          )}
          {error ? (
            <section className="advisor-state error">
              <AlertTriangle />
              <h2>
                {status === "DEFERRED"
                  ? "Analyse wegen Budgetgrenze zurückgestellt"
                  : "Analyse fehlgeschlagen"}
              </h2>
              <p>{error}</p>
              <button onClick={retry}>Erneut versuchen</button>
              <Link href="/?view=news">
                <ArrowLeft />
                Zurück zu Nachrichten
              </Link>
            </section>
          ) : !a ? (
            <Loading elapsed={elapsed} status={status} />
          ) : (
            <>
              <section className="advisor-decision">
                <div>
                  <span>Beratungspotenzial</span>
                  <b>{val(report?.opportunityPotential)}</b>
                </div>
                <div>
                  <span>Risikobewertung</span>
                  <b>{val(report?.riskLevel)}</b>
                </div>
                <div>
                  <span>Projektstatus</span>
                  <b>{val(report?.maturity)}</b>
                </div>
                <div>
                  <span>Passung zum Unternehmen</span>
                  <b>{report?.companyFit || "—"}</b>
                </div>
                <div className="recommendation">
                  <span>Handlungsempfehlung</span>
                  <b>{val(report?.decision)}</b>
                </div>
              </section>
              <article className="advisor-report">
                <section className="executive">
                  <h2>Was bedeutet diese Nachricht für uns?</h2>
                  <p>{a.executiveAssessment}</p>
                  <h3>Empfohlener nächster Schritt</h3>
                  <strong>{a.finalRecommendation}</strong>
                </section>
                <Details title="1. Ausgangslage und Bedeutung" open>
                  <p>{a.situationDiagnosis}</p>
                  <p>{a.customerProblem}</p>
                </Details>
                <Details title="2. Strategische und wirtschaftliche Auswirkungen">
                  <p>{a.marketContext}</p>
                </Details>
                <Details title="3. Mögliche Beratungsansätze">
                  {a.consultingApproaches?.length ? (
                    a.consultingApproaches.map((x: any, i: number) => (
                      <div className="approach" key={i}>
                        <h3>{x.engagement}</h3>
                        <p>{x.customerProblem}</p>
                        <b>Wirtschaftliche Attraktivität</b>
                        <p>{x.commercialAttractiveness}</p>
                        <b>Kompetenzpassung</b>
                        <p>{x.companyCapabilityFit}</p>
                        {list(x.deliverables)}
                      </div>
                    ))
                  ) : (
                    <p>
                      Keine belastbaren Beratungsansätze aus der Quelle
                      ableitbar.
                    </p>
                  )}
                </Details>
                <Details title="4. Chancen und Risiken">
                  <div className="two-col">
                    <div>
                      <h3>Vorteile</h3>
                      {list(a.advantages)}
                    </div>
                    <div>
                      <h3>Risiken</h3>
                      {a.risks?.map((r: any, i: number) => (
                        <p key={i}>
                          <b>{r.type}:</b> {r.assessment}
                        </p>
                      ))}
                    </div>
                  </div>
                </Details>
                <Details title="5. SWOT-Analyse">
                  <div className="swot">
                    <div>
                      <h3>Stärken</h3>
                      {list(a.swot.strengths)}
                    </div>
                    <div>
                      <h3>Schwächen</h3>
                      {list(a.swot.weaknesses)}
                    </div>
                    <div>
                      <h3>Chancen</h3>
                      {list(a.swot.opportunities)}
                    </div>
                    <div>
                      <h3>Risiken</h3>
                      {list(a.swot.threats)}
                    </div>
                  </div>
                </Details>
                <Details title="6. Markteintritt und Vergabe">
                  <p>{a.marketEntry}</p>
                </Details>
                <Details title="7. Konkreter Maßnahmenplan">
                  <h3>Sofort</h3>
                  {list(a.actionPlan.immediate)}
                  <h3>Kurzfristig</h3>
                  {list(a.actionPlan.shortTerm)}
                  <h3>Mittelfristig</h3>
                  {list(a.actionPlan.longerTerm)}
                </Details>
                <Details title="8. Fakten, Annahmen und offene Fragen">
                  <h3>Verifizierte Fakten</h3>
                  {list(a.verifiedFacts)}
                  <h3>Annahmen</h3>
                  {list(a.hypotheses)}
                  <h3>Offene Fragen</h3>
                  {list(a.missingInformation)}
                </Details>
                <small className="advisor-usage">
                  <CheckCircle2 /> Analyse gespeichert · Qualitätsprüfung{" "}
                  {report?.qualityScore}/50 · {report?.inputTokens} Eingabe- /{" "}
                  {report?.outputTokens} Ausgabe-Token · geschätzt €
                  {report?.estimatedCost.toFixed(4)}
                </small>
              </article>
              <section className="advisor-chat">
                <h2>Fragen an den Beratungsassistenten</h2>
                <p>
                  Der vollständige Beratungsverlauf ist gespeichert. Sie können
                  das frühere Gespräch jederzeit fortsetzen.
                </p>
                <div className="chat-history">
                  {messages.map((m, i) => (
                    <div
                      className={`chat-message ${m.role}`}
                      key={m.createdAt || i}
                    >
                      <div className="chat-author">
                        <b>
                          {m.role === "user" ? "Sie" : "Beratungsassistent"}
                        </b>
                        {m.createdAt && (
                          <time>
                            {new Date(m.createdAt).toLocaleString("de-DE")}
                          </time>
                        )}
                      </div>
                      <p>{m.content}</p>
                    </div>
                  ))}
                  {sending && (
                    <div className="chat-message assistant">
                      <b>Beratungsassistent</b>
                      <p>Ihre Frage wird analysiert…</p>
                    </div>
                  )}
                </div>
                <form onSubmit={send}>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Stellen Sie eine weitere Frage zur Beratungsanalyse ..."
                  />
                  <button disabled={sending || !question.trim()}>
                    <Send />
                    Senden
                  </button>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Loading({ elapsed, status }: { elapsed: number; status: string }) {
  return (
    <section className="advisor-state loading">
      <div className="analysis-pulse">
        <Sparkles />
      </div>
      <span className="status-pill">
        <Clock />
        {status === "PENDING"
          ? "Analyse wartet auf Verarbeitung"
          : "Analyse läuft"}{" "}
        · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
      </span>
      <h2>Ihre Beratungsanalyse wird erstellt.</h2>
      <p>
        Der KI-Beratungsassistent prüft die Nachricht auf strategische Relevanz,
        mögliche Beratungsansätze, Risiken und wirtschaftliche Chancen.
      </p>
      <ol>
        <li>Nachricht und Quellen werden geprüft</li>
        <li>Wirtschaftliche und strategische Auswirkungen werden bewertet</li>
        <li>Beratungsansätze und Risiken werden untersucht</li>
        <li>Ergebnisse werden geprüft und aufbereitet</li>
      </ol>
      {elapsed >= 15 && (
        <div className="leave-note">
          Die Analyse kann etwas Zeit benötigen. Sie können die Seite verlassen
          und später zurückkehren.
        </div>
      )}
      {elapsed >= 30 && status === "RUNNING" && (
        <div className="running-note">
          Die Analyse läuft weiterhin auf dem Server. Ein Schließen oder
          Aktualisieren dieser Seite unterbricht sie nicht.
        </div>
      )}
    </section>
  );
}
function Details({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="advisor-detail" open={open}>
      <summary>
        {title}
        <span>Details anzeigen</span>
      </summary>
      <div>{children}</div>
    </details>
  );
}
