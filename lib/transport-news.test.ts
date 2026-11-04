import {describe,expect,it} from "vitest";
import {classifyTransportNews} from "./transport-news";
const classify=(title:string,content:string)=>classifyTransportNews({title,content});
describe("transport news classification",()=>{
  it("keeps legitimate public transport news",()=>{expect(classify("Neuer Fahrplan","Der ÖPNV erweitert zwei Buslinien.").relevant).toBe(true)});
  it("keeps road freight network news",()=>{expect(classify("Güterverkehrsnetz wird optimiert","Neue Korridore für den Straßengüterverkehr.").category).toBe("FREIGHT_TRANSPORT")});
  it("excludes warehouse construction",()=>{expect(classify("Neue Lagerhalle","Ein Logistikunternehmen baut ein Warehouse.").relevant).toBe(false)});
  it("excludes warehouse automation",()=>{expect(classify("Roboter im Fulfillment Center","Neue Lagerautomation und inventory software.").relevant).toBe(false)});
  it("allows an intermodal terminal despite warehouse terminology",()=>{expect(classify("Intermodales Güterterminal","Warehouse-Flächen ergänzen einen neuen Schienengüterverkehr-Knoten.").relevant).toBe(true)});
  it("does not include generic supply-chain content",()=>{expect(classify("Supply Chain Trends","Neue Prozesse im inventory management.").relevant).toBe(false)});
  it("excludes incidental goods transport tenders",()=>{expect(classify("Speisentransporte","Ausschreibung für Straßentransport zur Essensverteilung.").relevant).toBe(false)});
  it("excludes unrelated utility engineering",()=>{expect(classify("Aufdimensionierung Hauptsammler","Ingenieurleistungen in der Eisenbahnstraße für den Abwasserkanal.").relevant).toBe(false)});
});
