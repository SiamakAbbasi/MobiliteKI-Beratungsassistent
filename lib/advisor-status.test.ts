import {describe,expect,it} from "vitest";
import {consultationAction} from "./advisor-status";

describe("persistent consultation actions",()=>{
  it("shows the initial action without a consultation",()=>expect(consultationAction().label).toBe("Beratungsassistent"));
  it("opens a running analysis without requesting a second one",()=>expect(consultationAction("RUNNING")).toMatchObject({label:"Analyse läuft · Öffnen",tone:"running"}));
  it("opens completed history",()=>expect(consultationAction("COMPLETED")).toMatchObject({label:"Beratungsverlauf öffnen",tone:"saved"}));
  it("offers controlled retry for failures",()=>expect(consultationAction("FAILED")).toMatchObject({label:"Analyse erneut versuchen",tone:"failed"}));
});
