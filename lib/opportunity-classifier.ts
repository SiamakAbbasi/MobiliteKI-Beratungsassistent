import type { CompanyKey } from "./company-profiles";

export type Maturity = "EARLY_SIGNAL" | "PLANNED_PROJECT" | "ACTIVE_TENDER" | "AWARDED_CLOSED";
export type DeterministicAssessment = {
  relevant: boolean;
  opportunity: boolean;
  category: "NEWS" | "OPERATIONAL_ISSUE" | "STRATEGIC_ISSUE" | "POLICY_REGULATION" | "BUSINESS_OPPORTUNITY";
  maturity: Maturity;
  confidence: number;
  matches: Array<{companyKey:CompanyKey;fitScore:number;services:string[];evidence:string}>;
  reason: string;
};

const has=(text:string,re:RegExp)=>re.test(text);
const consultingNeed=/beratung|consult(?:ing|ancy)|studie|gutachten|konzept|strategie|reorganisation|restruktur|optimier|benchmark|wirtschaftlichkeits|machbarkeits|planungsleistung|management|vertriebsstrategie|organisationsentwicklung|prozess(?:optimierung)?/i;
const passenger=/öpnv|oepnv|public transport|personenverkehr|nahverkehr|verkehrsverbund|verkehrsunternehmen|aufgabenträger|\bbus\b|\bbahn\b|rail|tram|ticket|tarif|fahrgast|mobilität/i;
const logistics=/logisti|freight|güterverkehr|cargo|supply chain|flotte|fleet|fahrzeugmanagement|infrastrukturmanagement|rangier|marshalling|transport network/i;
const procurement=/ausschreibung|vergabe|tender|procurement|ted|auftraggeber|submission|deadline|angebotsfrist|publication-number/i;
const closed=/vergeben|zuschlag|awarded|abgeschlossen|closed|expired|frist abgelaufen/i;
const planned=/geplant|planung|beschlossen|programm|initiative|project|projekt|funding|förderung|investition/i;
const genericGrowth=/fahrgast(?:zahlen)?[^.]{0,40}(?:steig|wach)|passenger growth|rekordfahrgast/i;
const roadOnly=/straßenbau|road construction|fahrbahnsanierung|brückensanierung|asphalt|bundesstraße|autobahn|radweg/i;
const cargoGoodsOnly=/lieferung von (?:fahrzeugen|waren|material)|supply of (?:vehicles|goods|equipment)|beschaffung von fahrzeugen/i;

export function assessOpportunity(input:{title:string;content:string;url?:string}):DeterministicAssessment{
  const text=`${input.title}\n${input.content}`;
  const explicitlyNoNeed=has(text,/ohne (?:angekündigte |konkrete )?(?:studie|beratung|ausschreibung)|keine (?:studie|beratung|ausschreibung) (?:geplant|angekündigt)/i);
  const need=has(text,consultingNeed)&&!explicitlyNoNeed, passengerFit=has(text,passenger), logisticsFit=has(text,logistics);
  const tender=has(text,procurement), isClosed=has(text,closed), isPlanned=has(text,planned);
  if((has(text,roadOnly)&&!need)||(has(text,cargoGoodsOnly)&&!need))return {relevant:false,opportunity:false,category:"NEWS",maturity:"EARLY_SIGNAL",confidence:92,matches:[],reason:"Transport terminology without a credible consulting need"};
  if(has(text,genericGrowth)&&!need)return {relevant:true,opportunity:false,category:"NEWS",maturity:"EARLY_SIGNAL",confidence:88,matches:[],reason:"Industry news without a documented consulting need"};
  const matches:DeterministicAssessment["matches"]=[];
  if(passengerFit)matches.push({companyKey:"MOBILITE",fitScore:need?(has(text,/tarif|einnahmenaufteilung|finanzier|vertrieb/i)?94:82):65,services:has(text,/tarif|vertrieb/i)?["Tariff design and sales"]:has(text,/einnahmenaufteilung/i)?["Revenue-sharing systems"]:has(text,/finanzier/i)?["Public transport financing"]:["Passenger transport strategy and organisation"],evidence:need?"The source documents a passenger-transport need matching mobilité’s published consulting capabilities.":"The subject fits mobilité’s passenger-transport expertise, but the source does not yet document a commercial consulting need."});
  if(logisticsFit||passengerFit)matches.push({companyKey:"BSL",fitScore:need?(logisticsFit?92:78):(logisticsFit?72:60),services:logisticsFit?["Logistics and operational optimisation"]:["Transport strategy and operational improvement"],evidence:need?"The source documents a transport/logistics need matching BSL’s published strategic and operational capabilities.":"The subject fits BSL’s transport/logistics expertise, but the source does not yet document a commercial consulting need."});
  const opportunity=matches.length>0&&need;
  const maturity:Maturity=isClosed?"AWARDED_CLOSED":tender?"ACTIVE_TENDER":isPlanned?"PLANNED_PROJECT":"EARLY_SIGNAL";
  const category=opportunity&&!isClosed?(tender?"BUSINESS_OPPORTUNITY":isPlanned?"BUSINESS_OPPORTUNITY":"STRATEGIC_ISSUE"):(need?"STRATEGIC_ISSUE":"NEWS");
  return {relevant:passengerFit||logisticsFit,opportunity,category,maturity,confidence:opportunity?(tender?93:78):(need?68:55),matches,reason:opportunity?"A documented need maps to at least one verified company capability.":"Relevant development, but evidence is insufficient for a commercial opportunity."};
}
