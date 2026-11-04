import { createHash } from "crypto";
export const cn = (...v: (string | false | null | undefined)[]) => v.filter(Boolean).join(" ");
export const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export const canonicalize = (raw: string) => { try { const u = new URL(raw); u.hash = ""; ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k => u.searchParams.delete(k)); return u.toString(); } catch { return raw; } };
export const categoryLabel: Record<string,string> = { NEWS:"News", OPERATIONAL_ISSUE:"Operational Issue", STRATEGIC_ISSUE:"Strategic Issue", POLICY_REGULATION:"Policy & Regulation", BUSINESS_OPPORTUNITY:"Business Opportunity" };
