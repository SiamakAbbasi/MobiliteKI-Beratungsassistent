export async function register(){
  if(process.env.NEXT_RUNTIME==="nodejs"){
    const cron=(await import("node-cron")).default;
    const {scan}=await import("./lib/scanner");
    cron.schedule("0 8,16 * * *",()=>{scan().catch(error=>console.error("Scheduled scan failed",error))},{timezone:"Europe/Berlin"});
  }
}
