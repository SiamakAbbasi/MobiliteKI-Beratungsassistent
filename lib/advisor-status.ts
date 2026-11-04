export type ConsultationStatus="NOT_STARTED"|"PENDING"|"RUNNING"|"COMPLETED"|"FAILED"|"DEFERRED";

export function consultationAction(status?:string|null){
  switch(status){
    case "PENDING":case "RUNNING":return {status:status as ConsultationStatus,label:"Analyse läuft · Öffnen",tone:"running"};
    case "COMPLETED":return {status:"COMPLETED" as const,label:"Beratungsverlauf öffnen",tone:"saved"};
    case "FAILED":case "DEFERRED":return {status:status as ConsultationStatus,label:"Analyse erneut versuchen",tone:"failed"};
    default:return {status:"NOT_STARTED" as const,label:"Beratungsassistent",tone:"new"};
  }
}

