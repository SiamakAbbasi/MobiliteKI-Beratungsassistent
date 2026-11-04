import {
  ArrowDown,
  BadgeCheck,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  CircleDot,
  Database,
  Euro,
  ExternalLink,
  FileSearch,
  Filter,
  Gauge,
  Globe2,
  Layers3,
  Lightbulb,
  MapPinned,
  Newspaper,
  Radar,
  RefreshCw,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  Users,
  Waypoints,
} from "lucide-react";

const sections = [
  ["problem", "Ausgangslage"],
  ["loesung", "Lösung"],
  ["architektur", "Architektur"],
  ["seiten", "Anwendung"],
  ["beratung", "Beratungsassistent"],
  ["beispiel", "Anwendungsfall"],
  ["vertrauen", "Qualität & Vertrauen"],
  ["wirtschaftlichkeit", "Kosteneffizienz"],
  ["vision", "Wert & Vision"],
] as const;

const pages = [
  {
    icon: Gauge,
    title: "Übersicht",
    text: "Das operative Lagebild verbindet vier Kennzahlen mit KI-Erkenntnissen, Deutschlandkarte, Trends, Quellenstatus, Scanstatus und dem monatlichen KI-Budget.",
    bullets: [
      "Erfasste Meldungen zählt alle gespeicherten Rohdatensätze – auch noch nicht analysierte oder später ausgeschlossene Einträge.",
      "Probleme, Politik & Regulierung und Beratungspotenziale zählen aktive KI-Erkenntnisse gemäß Unternehmens- und Kategorie-Filter.",
      "Karte und Kartenliste verwenden denselben gefilterten Erkenntnisbestand; nur geografisch zuordenbare Treffer erhalten Marker.",
      "Der Trend zeigt Beratungspotenziale nach Erstellungszeitraum, nicht die Gesamtzahl aller Nachrichten.",
    ],
  },
  {
    icon: Lightbulb,
    title: "KI-Erkenntnisse",
    text: "Eine kuratierte Sicht auf ausgewählte, KI-klassifizierte Entwicklungen – nicht das vollständige Nachrichtenarchiv.",
    bullets: [
      "Kategorie, Relevanz, Evidenz und mögliche Unternehmenspassung werden getrennt ausgewiesen.",
      "Das Detailfenster erklärt den Artikel faktisch und öffnet bei Bedarf den Beratungsassistenten.",
      "Eine KI-Einschätzung bleibt eine analytische Bewertung und keine verifizierte Garantie.",
    ],
  },
  {
    icon: Newspaper,
    title: "Verkehrsnachrichten",
    text: "Die fachliche Nachrichtenebene bewahrt relevante Verkehrsmeldungen unabhängig von ihrem Beratungspotenzial.",
    bullets: [
      "Suche, Zeitraum, Bundesland, Region, Verkehrsbereich, Herausgeber und Sortierung lassen sich kombinieren.",
      "Filter werden serverseitig vor der Seitennavigation angewendet; Originalquelle und Veröffentlichungsdatum bleiben sichtbar.",
      "Eine Meldung kann fachlich relevant sein, ohne zur KI-Erkenntnis oder Geschäftschance zu werden.",
    ],
  },
  {
    icon: Database,
    title: "Erfasste Meldungen",
    text: "Die Nachvollziehbarkeitsebene zeigt alle eingesammelten Rohdatensätze und ihren Bearbeitungsstand.",
    bullets: [
      "Statuswerte unterscheiden ausstehende, ausgeschlossene, analysierte und als Erkenntnis übernommene Einträge.",
      "Dubletten werden bereits in der Erfassung über kanonische URLs und Inhalts-Hashes abgefangen.",
      "Die Original-URL bleibt erhalten; Rohdaten werden nicht nur wegen fehlenden Beratungspotenzials gelöscht.",
    ],
  },
  {
    icon: Layers3,
    title: "Quellen",
    text: "Hier wird das tatsächlich angebundene Verkehrsquellen-Netzwerk gepflegt und überwacht.",
    bullets: [
      "Quelle, Typ, Aktivierung, letzter erfolgreicher Scan und Fehlerzustand sind sichtbar.",
      "Verbindungstests prüfen die technische Erreichbarkeit, bevor eine Quelle produktiv genutzt wird.",
      "Unterstützt werden die im Scanner implementierten Quelltypen; nicht jede beliebige Website ist automatisch kompatibel.",
    ],
  },
  {
    icon: Users,
    title: "Meine Beratungen",
    text: "Gespeicherte Langdock-Analysen und Folgegespräche werden artikelbezogen wiedergefunden und fortgesetzt.",
    bullets: [
      "Das Öffnen eines vorhandenen Berichts löst keine neue KI-Anfrage aus.",
      "Bericht, Status, Metadaten und Gesprächsverlauf bleiben gemeinsam erhalten.",
      "Nur eine neue Frage oder ausdrücklich angeforderte Analyse kann zusätzliche Nutzung verursachen.",
    ],
  },
  {
    icon: Settings,
    title: "Einstellungen",
    text: "Die vorhandene Konfiguration umfasst Langdock-Verbindungsstatus, monatliches Budget und Scan-Zeitpunkte.",
    bullets: [
      "Das Monatsbudget begrenzt kostenpflichtige KI-Verarbeitung.",
      "Scan-Zeitpunkte steuern die geplante Quellenerfassung.",
      "Token- und Kostennutzung werden für die operative Kontrolle protokolliert.",
    ],
  },
];

const architecture = [
  {
    n: "01",
    icon: Globe2,
    title: "Deutsches Verkehrsquellen-Netzwerk",
    meta: "Bund · Länder · Regionen · Fachmedien · Vergabe",
    text: "Verifizierte RSS-Feeds, unterstützte APIs und kompatible öffentliche Quellen werden zentral registriert, verwaltet und auf Verfügbarkeit überwacht.",
    tone: "blue",
  },
  {
    n: "02",
    icon: Filter,
    title: "Erfassung & Qualitätsprüfung",
    meta: "Scans · Normalisierung · Dubletten · Relevanz",
    text: "Geplante Scans erfassen Inhalte. Kanonische URLs und Inhalts-Hashes verhindern Mehrfachablagen; fachfremde Inhalte werden regelbasiert ausgesondert.",
    tone: "cyan",
  },
  {
    n: "03",
    icon: Newspaper,
    title: "Verkehrsnachrichten",
    meta: "Suchen · Filtern · Einordnen · Originalquelle",
    text: "Relevante Verkehrsmeldungen bleiben als eigenständige Nachrichtenebene erhalten – auch ohne KI-Erkenntnis oder Geschäftspotenzial.",
    tone: "navy",
  },
  {
    n: "04",
    icon: Bot,
    title: "KI-Bewertung mit Langdock",
    meta: "Selektiv · budgetiert · evidenzorientiert",
    text: "Nur ausgewählte Meldungen werden hinsichtlich Relevanz, Kategorie, Evidenz, Geschäftskontext und möglicher Unternehmenspassung analysiert.",
    tone: "violet",
  },
  {
    n: "05",
    icon: Sparkles,
    title: "Drei Erkenntniskategorien",
    meta: "Probleme · Politik · Geschäftspotenziale",
    text: "Operative oder strategische Probleme, politische Entwicklungen und potenzielle Geschäftssignale werden getrennt dargestellt.",
    tone: "multi",
  },
  {
    n: "06",
    icon: MapPinned,
    title: "Vom Signal zur Übersicht",
    meta: "KPIs · Karte · Trends · Transparenz",
    text: "Filterbare Kennzahlen, geografisch verifizierte Marker und Zeitverläufe verdichten Erkenntnisse, ohne unbekannte Orte als bestätigt auszugeben.",
    tone: "green",
  },
];

export default function ProductGuide() {
  return (
    <div className="guide-page">
      <nav
        className="guide-toc"
        aria-label="Inhaltsverzeichnis Produktleitfaden"
      >
        <span>
          <BookOpen /> Produktleitfaden
        </span>
        <div>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section className="guide-hero" aria-labelledby="guide-title">
        <div className="guide-hero-copy">
          <span className="guide-eyebrow">
            <Radar /> Produkt, Architektur & Anwendung
          </span>
          <h1 id="guide-title">
            Deutschlands Verkehr entwickelt sich täglich.{" "}
            <em>Wer erkennt die entscheidenden Signale?</em>
          </h1>
          <p>
            Mobility Pulse AI bündelt verteilte Verkehrsinformationen, ordnet
            sie nachvollziehbar ein und schafft eine belastbare Grundlage für
            Beobachtung, Bewertung und strategische Beratung.
          </p>
          <div className="guide-hero-actions">
            <a href="#architektur">
              Architektur verstehen <ArrowDown />
            </a>
            <a href="#seiten" className="secondary">
              Anwendung kennenlernen
            </a>
          </div>
          <small>
            <ShieldCheck /> Bereits verfügbar: Erfassung, Nachrichtensicht,
            KI-Erkenntnisse, Karte, Beratungsassistent und Verlauf.
          </small>
        </div>
        <div
          className="guide-hero-visual"
          aria-label="Vom verteilten Signal zur Entscheidung"
        >
          <div className="signal-orbit orbit-one">
            <Building2 />
            <span>Behörden</span>
          </div>
          <div className="signal-orbit orbit-two">
            <Newspaper />
            <span>Fachmedien</span>
          </div>
          <div className="signal-orbit orbit-three">
            <Waypoints />
            <span>Verkehrsakteure</span>
          </div>
          <div className="pulse-core">
            <span>〽</span>
            <b>
              Mobility
              <br />
              Pulse AI
            </b>
            <small>Erfassen · Einordnen · Handeln</small>
          </div>
          <div className="decision-card">
            <Sparkles />
            <span>
              <b>Nachvollziehbare Erkenntnis</b>mit Quelle, Kontext und Evidenz
            </span>
          </div>
        </div>
      </section>

      <section id="problem" className="guide-section problem-section">
        <div className="section-kicker">01 · Die Ausgangslage</div>
        <div className="editorial-grid">
          <div>
            <h2>Viele Quellen. Wenig gemeinsame Orientierung.</h2>
            <p className="lead">
              Verkehrsinformationen entstehen täglich bei Bundesbehörden, 16
              Ländern, Städten, Landkreisen, Verkehrsverbünden, Betreibern,
              Fachmedien, Vergabestellen und Ministerien.
            </p>
          </div>
          <div className="editorial-copy">
            <p>
              Diese Informationen liegen auf voneinander unabhängigen Websites,
              in Feeds und Veröffentlichungen. Wer Entwicklungen zuverlässig
              verfolgen will, muss zahlreiche Kanäle manuell prüfen. Relevante
              Signale können dadurch spät erkannt oder übersehen werden.
            </p>
            <p>
              Eine Nachricht allein beantwortet noch nicht, warum sie wichtig
              ist, wer betroffen sein könnte, welches operative Problem sichtbar
              wird, ob eine regulatorische Änderung Handlungsbedarf erzeugt oder
              ob daraus ein belastbares Beratungssignal entsteht.
            </p>
            <p>
              Mobility Pulse reduziert diese Fragmentierung. Die aktuelle
              Abdeckung richtet sich dabei nach tatsächlich geprüften und
              aktiven Quellen – sie ist kein Anspruch auf vollständige Abdeckung
              jeder deutschen Kommune.
            </p>
          </div>
        </div>
        <div className="fragment-strip">
          {[
            "Bund",
            "16 Bundesländer",
            "Städte & Kreise",
            "Verbünde & Betreiber",
            "Fachmedien",
            "Vergabeportale",
          ].map((x, i) => (
            <span key={x}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              {x}
            </span>
          ))}
        </div>
      </section>

      <section id="loesung" className="guide-section solution-section">
        <div className="section-kicker light">02 · Die Lösung</div>
        <h2>
          Aus verteilten Verkehrsinformationen werden nachvollziehbare
          Erkenntnisse.
        </h2>
        <p className="lead">
          Mobility Pulse ist mehr als ein Newsreader: Die Plattform verbindet
          Informationsgewinnung mit strukturierter Bewertung und einer möglichen
          geschäftlichen Entscheidung.
        </p>
        <div className="solution-steps">
          {[
            [
              RefreshCw,
              "Automatisch beobachten",
              "Registrierte Quellen regelmäßig erfassen und ihren Zustand sichtbar machen.",
            ],
            [
              FileSearch,
              "Qualität sichern",
              "URLs normalisieren, Dubletten erkennen und fachfremde Inhalte ausschließen.",
            ],
            [
              Newspaper,
              "Nachrichten bewahren",
              "Relevante Verkehrsmeldungen auch ohne Geschäftspotenzial verfügbar halten.",
            ],
            [
              Bot,
              "Gezielt analysieren",
              "Ausgewählte Inhalte budgetiert und evidenzorientiert durch KI bewerten.",
            ],
            [
              MapPinned,
              "Räumlich verstehen",
              "Nur verifizierbare geografische Erkenntnisse auf der Deutschlandkarte zeigen.",
            ],
            [
              Target,
              "Entscheidungen vorbereiten",
              "Vertiefte Beratung artikelbezogen anfordern, speichern und fortführen.",
            ],
          ].map(([Icon, title, text], i) => (
            <article key={String(title)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <Icon />
              <h3>{title as string}</h3>
              <p>{text as string}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="architektur" className="guide-section architecture-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">03 · Produktarchitektur</div>
            <h2>
              Eine durchgängige Kette – von der Quelle bis zur Entscheidung.
            </h2>
          </div>
          <p>
            Jede Stufe hat eine eigene Aufgabe. Gerade die Trennung von
            Rohdaten, Verkehrsnachrichten und KI-Erkenntnissen schützt vor
            vorschnellen Schlussfolgerungen.
          </p>
        </div>
        <div className="architecture-flow">
          {architecture.map((stage, i) => (
            <div className="architecture-unit" key={stage.n}>
              <article className={`architecture-card ${stage.tone}`}>
                <div className="architecture-number">{stage.n}</div>
                <div className="architecture-icon">
                  <stage.icon />
                </div>
                <div>
                  <small>{stage.meta}</small>
                  <h3>{stage.title}</h3>
                  <p>{stage.text}</p>
                </div>
              </article>
              {i < architecture.length - 1 && (
                <div className="flow-arrow" aria-hidden>
                  <span>↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="intelligence-triad">
          <article className="issue">
            <TriangleAlert />
            <h3>Erkannte Probleme</h3>
            <p>
              Betriebsprobleme, Zuverlässigkeitsdefizite,
              Infrastrukturherausforderungen, Störungen und systemische
              Schwächen.
            </p>
          </article>
          <article className="policy">
            <Scale />
            <h3>Politik & Regulierung</h3>
            <p>
              Politische Entscheidungen, Finanzierung, Regulierung,
              Gesetzesänderungen und verkehrsbezogene Pflichten.
            </p>
          </article>
          <article className="opportunity">
            <Target />
            <h3>Geschäftspotenziale</h3>
            <p>
              Relevante Vergaben, Projekte, möglicher Beratungsbedarf und
              strategische Initiativen – nicht automatisch bestätigte Aufträge.
            </p>
          </article>
        </div>
        <div className="architecture-note">
          <TriangleAlert />
          <p>
            <b>Wichtige Grenze:</b> Nicht jeder Artikel wird zur KI-Erkenntnis.
            Nicht jede KI-Erkenntnis ist eine verifizierte Tatsache. Und ein
            Geschäftspotenzial ist noch kein bestätigter, offener Auftrag.
          </p>
        </div>
      </section>

      <section id="seiten" className="guide-section pages-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">04 · Anwendung im Detail</div>
            <h2>Sieben Sichten, ein gemeinsamer Informationsfluss.</h2>
          </div>
          <p>
            Jede Seite beantwortet eine andere fachliche Frage – vom
            Rohdatensatz bis zur strategischen Beratung.
          </p>
        </div>
        <div className="page-guide-grid">
          {pages.map((page, i) => (
            <article key={page.title}>
              <div className="page-card-top">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <page.icon />
              </div>
              <h3>{page.title}</h3>
              <p>{page.text}</p>
              <ul>
                {page.bullets.map((x) => (
                  <li key={x}>
                    <CheckCircle2 />
                    {x}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="source-howto">
          <div>
            <span className="guide-eyebrow">
              <Layers3 /> Praxisanleitung
            </span>
            <h3>So fügen Sie eine neue Nachrichtenquelle hinzu.</h3>
            <p>
              Eine neue Quelle wird erst dann Teil des regulären Scanprozesses,
              wenn sie gespeichert, aktiv und technisch kompatibel ist.
            </p>
          </div>
          <ol>
            <li>
              <b>Quellen öffnen</b>
              <span>
                „Quelle hinzufügen“ wählen und einen verständlichen Namen
                vergeben.
              </span>
            </li>
            <li>
              <b>Typ und URL angeben</b>
              <span>
                Den tatsächlich unterstützten Quelltyp sowie die öffentliche
                Endpoint-URL eintragen.
              </span>
            </li>
            <li>
              <b>Verbindung prüfen</b>
              <span>
                Mit dem Verbindungstest Erreichbarkeit und verwertbare Inhalte
                kontrollieren.
              </span>
            </li>
            <li>
              <b>Speichern und aktivieren</b>
              <span>
                Die Quelle wird in der Datenbank registriert und kann ohne
                Codeänderung gescannt werden.
              </span>
            </li>
            <li>
              <b>Scan ausführen</b>
              <span>
                Neu erfasste Meldungen erscheinen nach Dubletten- und
                Relevanzprüfung in den passenden Sichten.
              </span>
            </li>
            <li>
              <b>Status beobachten</b>
              <span>
                Letzten erfolgreichen Scan und Fehlermeldungen prüfen;
                unpassende Quellen deaktivieren.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section id="beratung" className="guide-section advisor-guide-section">
        <div className="advisor-guide-copy">
          <div className="section-kicker light">
            05 · Senior Consulting Advisor
          </div>
          <h2>Vom Nachrichtenartikel zur strategischen Beratung.</h2>
          <p className="lead">
            Der Langdock-gestützte Beratungsassistent vertieft einen bewusst
            ausgewählten Artikel. Er bewertet – soweit die Quellenlage es trägt
            – strategische Relevanz, Marktumfeld, Beratungsansätze, Risiken,
            Vor- und Nachteile, kommerzielle Reife und mögliche nächste
            Schritte.
          </p>
          <div className="advisor-distinction">
            <p>
              <b>KI-Erkenntnisse</b>
              <span>Automatische Identifikation wichtiger Entwicklungen.</span>
            </p>
            <p>
              <b>Beratungsassistent</b>
              <span>
                Vertiefte strategische Bewertung eines ausgewählten Artikels.
              </span>
            </p>
          </div>
        </div>
        <div className="advisor-report-mock">
          <div className="mock-head">
            <Sparkles />
            <span>
              <b>Strategische Einordnung</b>Gespeicherte, artikelbezogene
              Analyse
            </span>
            <i>Abgeschlossen</i>
          </div>
          {[
            "Management Summary",
            "Markt- und Kundenkontext",
            "Beratungsansätze",
            "Risiken & Go/No-Go",
          ].map((x, i) => (
            <div className="mock-row" key={x}>
              <span>{i + 1}</span>
              <b>{x}</b>
              <small>{i === 0 ? "Geöffnet" : "Details"}</small>
            </div>
          ))}
          <div className="mock-chat">
            <CircleDot />
            <span>
              <b>Folgefrage stellen</b>Vorherige Gespräche bleiben erhalten.
            </span>
          </div>
        </div>
        <div className="advisor-guardrails">
          <ShieldCheck />
          <div>
            <h3>Beratung mit klaren Grenzen</h3>
            <p>
              Der Assistent berücksichtigt dokumentierte Leistungsprofile von
              mobilité und BSL Transportation. Er darf keine Fähigkeiten,
              Kundenbeziehungen, Budgets oder Auftragslagen erfinden. Nicht jede
              Meldung bietet ein Geschäftspotenzial.
            </p>
            <p>
              Vorhandene Berichte werden wiederverwendet. Das erneute Öffnen
              kostet €0,00; nur neue Folgefragen oder ausdrücklich neue Analysen
              können Langdock-Nutzung auslösen.
            </p>
          </div>
        </div>
      </section>

      <section id="beispiel" className="guide-section example-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              06 · Beispielhafter Anwendungsfall
            </div>
            <h2>
              Eine Modernisierungsinitiative wird zum strukturierten Prüffall.
            </h2>
          </div>
          <p>
            <b>Fiktives Szenario:</b> Ein regionaler Aufgabenträger kündigt eine
            Modernisierungsinitiative an. Dieses Beispiel ist kein real
            erkanntes Projekt.
          </p>
        </div>
        <div className="example-timeline">
          {[
            [
              "01",
              "Veröffentlichung",
              "Der Aufgabenträger publiziert eine offizielle Meldung.",
            ],
            [
              "02",
              "Erfassung",
              "Mobility Pulse liest die registrierte Quelle im Scan ein.",
            ],
            [
              "03",
              "Dublettenprüfung",
              "URL und Inhalt werden gegen vorhandene Datensätze geprüft.",
            ],
            [
              "04",
              "Nachrichtensicht",
              "Die relevante Meldung erscheint in Verkehrsnachrichten.",
            ],
            [
              "05",
              "KI-Bewertung",
              "Nur bei Auswahl und Budgetfreigabe wird die Relevanz analysiert.",
            ],
            [
              "06",
              "Geschäftsbezug",
              "Eine Verbindung wird nur bei ausreichender Evidenz ausgewiesen.",
            ],
            [
              "07",
              "Dashboard",
              "Kategorie, KPI, Karte und Trend werden konsistent aktualisiert.",
            ],
            [
              "08",
              "Artikeldetail",
              "Der Nutzer prüft Fakten, Quelle und Einordnung.",
            ],
            [
              "09",
              "Strategische Beratung",
              "Der Assistent untersucht mögliche Beratungsansätze.",
            ],
            [
              "10",
              "Gespeicherter Verlauf",
              "Bericht und Folgegespräch können später fortgeführt werden.",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="vertrauen" className="guide-section trust-section">
        <div className="section-kicker light">
          07 · Datenqualität, Transparenz & Vertrauen
        </div>
        <h2>Nachvollziehbare Informationen statt unbelegter Behauptungen.</h2>
        <div className="trust-grid">
          {[
            [
              ExternalLink,
              "Originalquelle",
              "Jede Meldung bleibt mit ihrer kanonischen öffentlichen Quelle verknüpft.",
            ],
            [
              BadgeCheck,
              "Dublettenprüfung",
              "Kanonische URLs und Inhalts-Hashes reduzieren Mehrfacherfassungen.",
            ],
            [
              MapPinned,
              "Geografische Verifikation",
              "Unbekannte Orte werden nicht ersatzweise einer Stadt zugeordnet.",
            ],
            [
              Gauge,
              "Getrennte Bewertungen",
              "Relevanz, Evidenz, Reife und Unternehmenspassung bleiben unterscheidbar.",
            ],
            [
              RefreshCw,
              "Aktualität",
              "Scanstatus und letzter erfolgreicher Abruf machen Quellenzustände sichtbar.",
            ],
            [
              TriangleAlert,
              "Ehrliche Unsicherheit",
              "Leere Zustände und fehlende Evidenz werden angezeigt, nicht künstlich gefüllt.",
            ],
          ].map(([Icon, title, text]) => (
            <article key={String(title)}>
              <Icon />
              <h3>{title as string}</h3>
              <p>{text as string}</p>
            </article>
          ))}
        </div>
        <p className="trust-statement">
          KI-Klassifikationen sind analytische Einschätzungen. Sie ersetzen
          weder die Prüfung der Originalquelle noch eine fachliche oder
          rechtliche Verifikation.
        </p>
      </section>

      <section
        id="wirtschaftlichkeit"
        className="guide-section efficiency-section"
      >
        <div className="section-heading">
          <div>
            <div className="section-kicker">08 · Kosteneffizienz</div>
            <h2>Intelligenz gezielt einsetzen.</h2>
          </div>
          <p>
            Ein größeres Quellennetz muss nicht proportional mehr KI-Aufrufe
            verursachen. Erfassung und Auswahl werden bewusst von
            kostenpflichtiger Analyse getrennt.
          </p>
        </div>
        <div className="cost-funnel">
          <div>
            <Database />
            <b>Quellen sammeln</b>
            <span>kostengünstige technische Erfassung</span>
          </div>
          <i>›</i>
          <div>
            <Filter />
            <b>Deterministisch filtern</b>
            <span>Relevanz, Dubletten, Ausschlüsse</span>
          </div>
          <i>›</i>
          <div>
            <Bot />
            <b>Selektiv analysieren</b>
            <span>nur geeignete Meldungen</span>
          </div>
          <i>›</i>
          <div>
            <Sparkles />
            <b>Auf Abruf beraten</b>
            <span>bewusste Nutzerentscheidung</span>
          </div>
          <i>›</i>
          <div>
            <Euro />
            <b>Speichern & überwachen</b>
            <span>Cache, Verlauf, Monatsbudget</span>
          </div>
        </div>
      </section>

      <section id="vision" className="guide-section vision-section">
        <div className="vision-copy">
          <div className="section-kicker light">09 · Produktwert & Vision</div>
          <h2>Ein gemeinsames Lagebild für den deutschen Verkehrsmarkt.</h2>
          <p>
            Mobility Pulse kann manuellen Beobachtungsaufwand reduzieren, die
            Sichtbarkeit relevanter Entwicklungen verbreitern, frühe Signale
            leichter auffindbar machen und die Vorbereitung von
            Beratungsgesprächen strukturieren. Diese Punkte sind potenzielle
            Nutzenbeiträge – keine unabhängig nachgewiesenen finanziellen
            Resultate.
          </p>
          <p>
            Langfristig entsteht eine skalierbare deutsche
            Transport-Intelligence-Plattform, deren Quellenbestand und
            analytische Fähigkeiten kontrolliert erweitert werden können.
          </p>
        </div>
        <div className="roadmap">
          <h3>Produktstatus</h3>
          <p>
            <span className="available">Bereits verfügbar</span>
            Quellenverwaltung, Erfassung, Nachrichten, KI-Erkenntnisse, Karte,
            Beratungsberichte und Verlauf.
          </p>
          <p>
            <span className="progressing">In Entwicklung</span>Breitere
            verifizierte Quellenabdeckung und vollständigere geografische
            Metadaten.
          </p>
          <p>
            <span className="planned">Geplant</span>Weitere belastbare
            Quellenarten und analytische Ausbaustufen nach technischer
            Validierung.
          </p>
        </div>
        <blockquote>
          „Mobility Pulse AI verwandelt fragmentierte Verkehrsinformationen in
          strukturierte, nachvollziehbare und strategisch nutzbare
          Erkenntnisse.“
        </blockquote>
      </section>
    </div>
  );
}
