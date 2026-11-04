import { describe, expect, it } from "vitest";
import { assessOpportunity } from "./opportunity-classifier";

const assess=(title:string,content:string)=>assessOpportunity({title,content,url:"https://official.example/source"});
describe("business development opportunity classification",()=>{
  it("matches revenue-sharing reform to mobilité",()=>{const r=assess("Reform der Einnahmenaufteilung","Ein Verkehrsverbund plant ein Gutachten zur neuen Einnahmenaufteilung im ÖPNV.");expect(r.matches.map(x=>x.companyKey)).toContain("MOBILITE");});
  it("matches a public transport financing study to mobilité",()=>{const r=assess("Finanzierungsstudie für den ÖPNV","Der Aufgabenträger beauftragt eine Studie für neue Finanzierungsstrukturen.");expect(r.matches.find(x=>x.companyKey==="MOBILITE")?.fitScore).toBeGreaterThan(90);});
  it("matches logistics network optimization to BSL",()=>{const r=assess("Logistiknetz optimieren","Gesucht wird Beratung zur Strategie und Optimierung eines Güterverkehrsnetzes.");expect(r.matches.map(x=>x.companyKey)).toContain("BSL");});
  it("matches operational restructuring to BSL",()=>{const r=assess("Restrukturierung des Betriebs","Ein Verkehrsunternehmen plant operative Restrukturierung und Prozessoptimierung.");expect(r.matches.map(x=>x.companyKey)).toContain("BSL");});
  it("can match public transport reorganisation to both",()=>{const r=assess("Neuorganisation des ÖPNV","Verkehrsverbund und Verkehrsunternehmen benötigen Beratung für Strategie, Organisation und operative Optimierung.");expect(r.matches.map(x=>x.companyKey).sort()).toEqual(["BSL","MOBILITE"]);});
  it("does not turn generic passenger growth into an opportunity",()=>{const r=assess("Fahrgastzahlen steigen","Der ÖPNV meldet Rekordfahrgastzahlen und passenger growth.");expect(r.opportunity).toBe(false);});
  it("excludes unrelated road construction",()=>{const r=assess("B 35 wird saniert","Die Fahrbahnsanierung und Straßenbauarbeiten beginnen.");expect(r.relevant).toBe(false);});
  it("excludes unrelated cargo procurement",()=>{const r=assess("Beschaffung von Fahrzeugen","Lieferung von Fahrzeugen für den Güterverkehr.");expect(r.opportunity).toBe(false);});
  it("recognizes a verified consulting tender",()=>{const r=assess("TED Ausschreibung Beratung ÖPNV","Auftraggeber veröffentlicht Tender 2026-123 für ein Finanzierungsgutachten. Angebotsfrist 20.12.2026.");expect(r.maturity).toBe("ACTIVE_TENDER");expect(r.opportunity).toBe(true);});
  it("marks an awarded tender closed",()=>{const r=assess("Zuschlag erteilt","Die Ausschreibung für Beratung zur ÖPNV-Strategie wurde vergeben.");expect(r.maturity).toBe("AWARDED_CLOSED");});
  it("keeps a relevant issue without need out of opportunities",()=>{const r=assess("Finanzierung unter Druck","Dem ÖPNV fehlen Mittel, ohne angekündigte Studie oder Beratung.");expect(r.relevant).toBe(true);expect(r.opportunity).toBe(false);});
  it("supports independent matches for both companies",()=>{const r=assess("ÖPNV neu organisieren","Geplantes Projekt für Strategie, Organisationsentwicklung und Prozessoptimierung eines Verkehrsunternehmens.");expect(r.matches).toHaveLength(2);expect(r.matches[0].fitScore).not.toBe(r.confidence);});
});
