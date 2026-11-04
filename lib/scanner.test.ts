import {describe,expect,it} from "vitest";
import {normalizeTitle,titleSimilarity} from "./scanner";

describe("scanner deduplication",()=>{
 it("normalisiert Titel robust",()=>{expect(normalizeTitle("  Neue Bahn-Verbindung! ")).toBe("neue bahn verbindung")});
 it("erkennt nahezu identische Meldungstitel",()=>{expect(titleSimilarity("Land fördert neuen Radweg in Roge","Land fördert neuen Radweg in Roge mit 203.000 Euro")).toBeGreaterThan(.7)});
 it("verschmilzt unterschiedliche Meldungen nicht",()=>{expect(titleSimilarity("Neue Buslinie in Köln","DB Cargo restrukturiert Güterverkehr")).toBeLessThan(.3)});
});
