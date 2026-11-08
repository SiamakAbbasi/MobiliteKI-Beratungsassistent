import {describe,expect,it} from "vitest";
import {isSameNewsTopic,normalizeTitle,titleSimilarity} from "./scanner";

describe("scanner deduplication",()=>{
 it("normalisiert Titel robust",()=>{expect(normalizeTitle("  Neue Bahn-Verbindung! ")).toBe("neue bahn verbindung")});
 it("erkennt nahezu identische Meldungstitel",()=>{expect(titleSimilarity("Land fördert neuen Radweg in Roge","Land fördert neuen Radweg in Roge mit 203.000 Euro")).toBeGreaterThan(.7)});
 it("verschmilzt unterschiedliche Meldungen nicht",()=>{expect(titleSimilarity("Neue Buslinie in Köln","DB Cargo restrukturiert Güterverkehr")).toBeLessThan(.3)});
 it("erkennt dasselbe Thema bei unterschiedlichen Herausgeber-Titeln",()=>{expect(isSameNewsTopic("Bund beschließt Finanzierung des Deutschlandtickets ab 2027","Deutschlandticket: Bund beschließt Finanzierung ab 2027")).toBe(true)});
 it("trennt ähnlich formulierte, aber verschiedene Themen",()=>{expect(isSameNewsTopic("Bund beschließt Finanzierung des Deutschlandtickets","Bund beschließt Finanzierung der Pflege")).toBe(false)});
});
