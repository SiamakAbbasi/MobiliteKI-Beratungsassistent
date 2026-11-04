export type MapLocationInput={city?:string|null;federalState?:string|null;latitude?:number|null;longitude?:number|null;item?:{city?:string|null;federalState?:string|null;latitude?:number|null;longitude?:number|null;geographicScope?:string|null}};

const places:Array<{pattern:RegExp;label:string;latitude:number;longitude:number}>=[
  {pattern:/\bberlin\b/i,label:"Berlin",latitude:52.52,longitude:13.405},
  {pattern:/\belmshorn\b|\bpinneberg\b/i,label:"Korridor Elmshorn–Pinneberg",latitude:53.7037,longitude:9.7117},
  {pattern:/\bhamburg\b/i,label:"Hamburg",latitude:53.5511,longitude:9.9937},
  {pattern:/\bhohenschwangau\b/i,label:"Hohenschwangau",latitude:47.5762,longitude:10.7363},
  {pattern:/\brotenburg an der fulda\b/i,label:"Rotenburg an der Fulda",latitude:50.9956,longitude:9.7284},
  {pattern:/\blandkreis roth\b/i,label:"Landkreis Roth",latitude:49.2455,longitude:11.0911},
  {pattern:/\bschneizlreuth\b|\bberchtesgadener land\b/i,label:"Schneizlreuth (Berchtesgadener Land)",latitude:47.6833,longitude:12.8},
];

export function resolveKnownMapLocation(input:MapLocationInput){
  const named=places.find(place=>place.pattern.test(input.city||""));
  if(named)return {...named,scope:"Ort" as const};
  const sameNamedPlace=input.city&&input.item?.city&&input.city.toLocaleLowerCase("de-DE").includes(input.item.city.toLocaleLowerCase("de-DE"));
  if(sameNamedPlace&&input.item?.latitude!=null&&input.item.longitude!=null)return {label:input.city!,latitude:input.item.latitude,longitude:input.item.longitude,scope:"Ort" as const};
  if(input.latitude!=null&&input.longitude!=null)return {label:input.city||input.federalState||"Verifizierter Ort",latitude:input.latitude,longitude:input.longitude,scope:"Ort" as const};
  return null;
}

export function stateNames(value?:string|null){return (value||"").split(/[,;/]/).map(x=>x.trim()).filter(Boolean)}
