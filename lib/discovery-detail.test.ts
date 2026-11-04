import {describe,expect,it} from "vitest";
import {categoryContext,factualKeyPoints,germanAiExplanation,germanFactualSummary} from "./discovery-detail";

describe("Discovery-Detailansicht",()=>{
  it("übersetzt bekannte technische Klassifizierungsgründe",()=>expect(germanAiExplanation("Transport terminology without a credible consulting need")).toBe("Verkehrsbezug erkannt, jedoch ohne belastbaren Beratungsbedarf."));
  it("zeigt unbekannte englische KI-Texte nicht an",()=>expect(germanAiExplanation("Early signal with insufficient evidence")).not.toContain("Early signal"));
  it("extrahiert nur vorhandene längere Tatsachensätze",()=>{
    const content="Der Verkehrsverbund erweitert ab Dezember das Busangebot auf drei Linien im Landkreis. Dafür werden werktags zusätzliche Fahrten am Morgen und am Abend angeboten. Die Finanzierung wurde vom Kreistag in seiner Sitzung am Montag beschlossen. Fahrpläne sollen vor dem Fahrplanwechsel veröffentlicht werden.";
    const points=factualKeyPoints(content,"Neues Busangebot","");
    expect(points).toHaveLength(4); expect(points.every(point=>content.includes(point))).toBe(true);
  });
  it("erfindet bei kurzen Inhalten keine Stichpunkte",()=>expect(factualKeyPoints("Kurze Meldung.","Titel","Zusammenfassung")).toEqual([]));
  it("zeigt keine gespeicherte englische Zusammenfassung",()=>expect(germanFactualSummary("The government reports a new transport policy for regional rail.",null,"Kurzer Inhalt.")).toBe("Für diesen Artikel ist noch keine verlässliche deutschsprachige Zusammenfassung gespeichert."));
  it("bevorzugt eine vorhandene deutsche Zusammenfassung",()=>expect(germanFactualSummary("Die Bundesregierung hat eine neue Regelung für den Regionalverkehr beschlossen.","The government changed policy.",null)).toContain("Bundesregierung"));
  it("trennt Nachricht und Beratung",()=>expect(categoryContext("BUSINESS_OPPORTUNITY")).toContain("getrennt im Beratungsassistenten"));
});
