import Parser from "rss-parser";
const parser=new Parser({timeout:15_000});
const transportTerms=/\b(verkehr|mobilit|bahn|schiene|bus|tram|straßenbahn|u-bahn|s-bahn|öpnv|spnv|ticket|tarif|radweg|fahrrad|straße|brücke|hafen|güter|logistik|intermodal|infrastruktur)\b/i;

export async function validateRssSource(url:string){
 const feed=await parser.parseURL(url),items=feed.items.filter(item=>item.title&&item.link&&!/^(pressemitteilungen|weitere meldungen|social media|news|aktuelles)$/i.test(item.title.trim()));
 if(!items.length)throw new Error("Feed enthält keine verlinkten Artikel");
 const uniqueLinks=new Set(items.map(item=>item.link)).size;if(uniqueLinks<Math.min(3,items.length))throw new Error("Feed enthält keine ausreichenden eindeutigen Artikel");
 const relevant=items.filter(item=>transportTerms.test(`${item.title} ${item.contentSnippet||item.content||""}`));
 if(!relevant.length)throw new Error(`Feed liefert ${items.length} Artikel, aber im aktuellen Abruf keinen nachweisbaren Verkehrsbeitrag`);
 return {entries:items.length,uniqueLinks,relevantEntries:relevant.length,samples:relevant.slice(0,3).map(item=>({title:item.title!,url:item.link!}))};
}
