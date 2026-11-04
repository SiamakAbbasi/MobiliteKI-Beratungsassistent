import {describe,expect,it} from "vitest";
import {resolveKnownMapLocation,stateNames} from "./map-marker-location";

describe("Kartenpositionen",()=>{
  it("verwendet den ausdrücklich genannten Ort statt eines falsch erkannten Item-Orts",()=>expect(resolveKnownMapLocation({city:"Hohenschwangau",federalState:"Bayern",item:{city:"Köln",latitude:50.9375,longitude:6.9603}})).toMatchObject({label:"Hohenschwangau",latitude:47.5762}));
  it("übernimmt Item-Koordinaten nur bei übereinstimmendem Ortsnamen",()=>expect(resolveKnownMapLocation({city:"Metropolregion Hamburg",item:{city:"Hamburg",latitude:53.5511,longitude:9.9937}})).toMatchObject({label:"Hamburg"}));
  it("lehnt widersprüchliche Item-Koordinaten ab",()=>expect(resolveKnownMapLocation({city:"Unbekannter Ort",item:{city:"Berlin",latitude:52.52,longitude:13.405}})).toBeNull());
  it("erkennt mehrere Bundesländer",()=>expect(stateNames("Schleswig-Holstein, Hamburg")).toEqual(["Schleswig-Holstein","Hamburg"]));
  it("ordnet einen Korridor präziser als einen beiläufig genannten Endpunkt zu",()=>expect(resolveKnownMapLocation({city:"Elmshorn / Pinneberg – Verbindung nach Hamburg"})?.label).toBe("Korridor Elmshorn–Pinneberg"));
});
