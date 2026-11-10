"use client";

import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {Sparkles,X} from "lucide-react";

type Provider="LINA"|"STANDARD";

export default function AdvisorProviderButton({articleId,label="Beratungsassistent",className="advisor-button new"}:{articleId:string;label?:string;className?:string}){
  const router=useRouter(),[open,setOpen]=useState(false),[provider,setProvider]=useState<Provider>("LINA");
  useEffect(()=>{
    if(!open)return;
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    document.addEventListener("keydown",close);
    return()=>document.removeEventListener("keydown",close);
  },[open]);
  const show=(event:React.MouseEvent)=>{event.preventDefault();event.stopPropagation();setProvider("LINA");setOpen(true)};
  const start=()=>{setOpen(false);router.push(`/news/${articleId}/advisor?provider=${provider.toLowerCase()}&start=1`)};
  return <>
    <button type="button" className={className} onClick={show}><Sparkles/>{label}</button>
    {open&&<div className="provider-modal-backdrop" role="presentation" onClick={(event)=>event.stopPropagation()} onMouseDown={(event)=>{event.stopPropagation();if(event.target===event.currentTarget)setOpen(false)}}>
      <section className="provider-modal" role="dialog" aria-modal="true" aria-labelledby={`provider-title-${articleId}`} onClick={(event)=>event.stopPropagation()} onMouseDown={(event)=>event.stopPropagation()}>
        <header><div><span className="provider-modal-icon"><Sparkles/></span><div><h2 id={`provider-title-${articleId}`}>KI-Assistent auswählen</h2><p>Wählen Sie den Assistenten für diese Beratungsanalyse.</p></div></div><button type="button" className="provider-modal-close" onClick={()=>setOpen(false)} aria-label="Dialog schließen"><X/></button></header>
        <div className="provider-options">
          <label className={provider==="LINA"?"selected":""}><input type="radio" name={`provider-${articleId}`} value="LINA" checked={provider==="LINA"} onChange={()=>setProvider("LINA")}/><span><b>Lina – mobilité Recherche-Agent</b><small>Recherche- und Trendagentin für nachhaltige Mobilität und öffentlichen Verkehr</small></span></label>
          <label className={provider==="STANDARD"?"selected":""}><input type="radio" name={`provider-${articleId}`} value="STANDARD" checked={provider==="STANDARD"} onChange={()=>setProvider("STANDARD")}/><span><b>Standard AI – GPT-5 mini</b><small>Bestehende Mobility-Pulse-Beratungsanalyse</small></span></label>
        </div>
        <footer><button type="button" className="secondary" onClick={()=>setOpen(false)}>Abbrechen</button><button type="button" className="primary" onClick={start}><Sparkles/>Analyse starten</button></footer>
      </section>
    </div>}
  </>;
}
