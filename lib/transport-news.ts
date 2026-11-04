export type TransportNewsCategory="PUBLIC_TRANSPORT_BUS"|"REGIONAL_RAIL"|"LONG_DISTANCE_RAIL"|"URBAN_RAIL"|"FREIGHT_TRANSPORT"|"INFRASTRUCTURE"|"TARIFFS_TICKETING"|"FINANCING_FUNDING"|"REGULATION_POLICY"|"PROCUREMENT_TENDERS"|"MOBILITY_INNOVATION"|"OPERATIONS_SERVICE";

const warehouse=/lagerhalle|lagerhaus|warehouse|warehousing|fulfillment|fulfilment|intralogistik|inventory|lagersoftware|lagerautomation|gabelstapler|forklift|regalsystem/i;
const directFreightImpact=/intermodal|güterterminal|freight terminal|kombinierter verkehr|güterverkehrsnetz|rail freight|schienengüter|hafenhinterland|transport corridor/i;
const incidentalProcurement=/speisentransport|lebensmitteltransport|feuerwehrfahrzeug|feuerwehrtechnisch|hauptsammler|abwasser|kanalbau|betonshelter|möbeltransport|umzugsdienst|kurierdienst|postdienst/i;
const transport=/öpnv|oepnv|spnv|personenverkehr|nahverkehr|fernverkehr|regionalbahn|eisenbahn|schienenverkehr|bahnstrecke|bahnhof|buslinie|linienbus|straßenbahn|tram|u-bahn|s-bahn|deutschlandticket|fahrgast|verkehrsverbund|verkehrsbetrieb|mobilitätsdienst|güterverkehr|straßengüter|lkw-verkehr|rail freight|transport network|verkehrsinfrastruktur|verkehrspolitik|transport policy|fahrplan|zugverkehr|verkehrsleistung|verkehr|autobahn|bundesstraße|landesstraße|radweg|wasserstraße|schifffahrt|hafen/i;

const categories:Array<[TransportNewsCategory,RegExp]>=[
  ["PROCUREMENT_TENDERS",/ausschreibung|vergabe|tender|procurement|ted|dienstleistungsauftrag/i],
  ["TARIFFS_TICKETING",/tarif|ticket|deutschlandticket|fahrkarte|vertrieb/i],
  ["FINANCING_FUNDING",/finanzier|förder|funding|zuschuss|sondervermögen/i],
  ["REGULATION_POLICY",/gesetz|verordnung|regulier|politik|ministerium|bundestag|landtag/i],
  ["URBAN_RAIL",/straßenbahn|tram|u-bahn|s-bahn|stadtbahn/i],
  ["REGIONAL_RAIL",/spnv|regionalbahn|regionalexpress|nahverkehrszug/i],
  ["LONG_DISTANCE_RAIL",/fernverkehr|ice\b|intercity/i],
  ["PUBLIC_TRANSPORT_BUS",/öpnv|oepnv|buslinie|linienbus|nahverkehr|fahrgast/i],
  ["FREIGHT_TRANSPORT",/güterverkehr|schienengüter|straßengüter|lkw-verkehr|rail freight|intermodal|güterterminal/i],
  ["MOBILITY_INNOVATION",/innovation|digital|autonom|on-demand|mobility as a service|alternative antrieb/i],
  ["OPERATIONS_SERVICE",/fahrplan|ausfall|störung|betrieb|serviceänder|umleitung|takt/i],
  ["INFRASTRUCTURE",/infrastruktur|bahnstrecke|bahnhof|brücke|schiene|streckenausbau/i],
];

export function classifyTransportNews(input:{title:string;content:string}){
  const text=`${input.title}\n${input.content}`.replace(/\s+/g," ").trim();
  if(warehouse.test(text)&&!directFreightImpact.test(text))return {relevant:false,category:null,reason:"Warehousing, fulfillment or intralogistics without a substantial direct transportation impact",summary:null};
  if(incidentalProcurement.test(text)&&!directFreightImpact.test(text))return {relevant:false,category:null,reason:"Incidental goods, construction or equipment procurement without a transport-system impact",summary:null};
  if(!transport.test(text))return {relevant:false,category:null,reason:"No specific passenger, rail, road-freight or transport-policy subject detected",summary:null};
  const category=categories.find(([,pattern])=>pattern.test(text))?.[0]??"INFRASTRUCTURE";
  const firstSentence=(input.content.replace(/\s+/g," ").trim().match(/^.{1,360}?(?:[.!?](?:\s|$)|$)/)?.[0]||input.content.slice(0,360)).trim();
  return {relevant:true,category,reason:null,summary:firstSentence||input.title};
}
