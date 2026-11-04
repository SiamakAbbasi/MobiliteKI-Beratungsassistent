import {describe,expect,it} from "vitest";
import {bundeslaender} from "./coverage-registry";
describe("Quellenabdeckung",()=>{it("enthält alle 16 Bundesländer genau einmal",()=>{expect(bundeslaender).toHaveLength(16);expect(new Set(bundeslaender).size).toBe(16)})});
