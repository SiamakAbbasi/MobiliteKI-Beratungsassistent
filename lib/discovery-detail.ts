const technicalReasons:Record<string,string>={
  "Transport terminology without a credible consulting need":"Verkehrsbezug erkannt, jedoch ohne belastbaren Beratungsbedarf.",
  "Industry news without a documented consulting need":"Branchennachricht ohne dokumentierten Beratungsbedarf.",
  "A documented need maps to at least one verified company capability.":"Ein dokumentierter Bedarf passt zu mindestens einer verifizierten Unternehmenskompetenz.",
  "Relevant development, but evidence is insufficient for a commercial opportunity.":"Relevante Entwicklung, deren Belege für eine konkrete Geschäftschance nicht ausreichen."
};

function isProbablyEnglish(value:string){return /\b(the|and|with|without|this|that|for|from|has|have|was|were|will|transport minister|government|reports?|according to)\b/i.test(value)}

export function germanFactualSummary(factualSummary?:string|null,discoverySummary?:string|null,content?:string|null){
  const stored=[factualSummary,discoverySummary].map(value=>value?.replace(/\s+/g," ").trim()).find(value=>value&&value.length>=35&&!isProbablyEnglish(value));
  if(stored)return stored;
  const source=(content||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const sentence=source.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/).find(value=>value.length>=45&&value.length<=420&&!isProbablyEnglish(value));
  return sentence||"Für diesen Artikel ist noch keine verlässliche deutschsprachige Zusammenfassung gespeichert.";
}

export function germanAiExplanation(value?:string|null){
  const text=value?.trim();
  if(!text)return "Keine zusätzliche KI-Einordnung gespeichert.";
  return technicalReasons[text]||(/\b(the|without|with|need|signal|opportunity|relevant|documented|evidence|transport|industry)\b/i.test(text)?"Die technische KI-Begründung liegt nicht in deutscher Sprache vor und wird deshalb nicht angezeigt.":text);
}

export function factualKeyPoints(content?:string|null,title?:string|null,summary?:string|null){
  const clean=(content||"").replace(/<[^>]+>/g," ").replace(/https?:\/\/\S+/g," ").replace(/\s+/g," ").trim();
  if(clean.length<180)return [];
  const normalizedTitle=(title||"").toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu," ").trim();
  const normalizedSummary=(summary||"").toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu," ").trim();
  const seen=new Set<string>();
  return clean.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9])/)
    .map(sentence=>sentence.trim())
    .filter(sentence=>sentence.length>=45&&sentence.length<=320&&!isProbablyEnglish(sentence))
    .filter(sentence=>{
      const normalized=sentence.toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu," ").trim();
      if(!normalized||seen.has(normalized)||normalized===normalizedTitle||normalized===normalizedSummary)return false;
      seen.add(normalized);return true;
    }).slice(0,5);
}

export function categoryContext(category:string){
  return ({
    NEWS:"Sachliche Verkehrsnachricht ohne gesonderte strategische Bewertung.",
    OPERATIONAL_ISSUE:"Die Meldung beschreibt eine betriebliche Entwicklung oder Störung im Verkehrssystem.",
    STRATEGIC_ISSUE:"Die Meldung betrifft eine strategische Entwicklung im Verkehrssektor.",
    POLICY_REGULATION:"Die Meldung betrifft politische oder regulatorische Rahmenbedingungen des Verkehrs.",
    BUSINESS_OPPORTUNITY:"Die Meldung enthält Hinweise auf einen möglichen Beratungsbedarf. Die strategische Bewertung erfolgt getrennt im Beratungsassistenten."
  } as Record<string,string>)[category]||"Sachliche Einordnung auf Grundlage der gespeicherten Artikelklassifikation.";
}
