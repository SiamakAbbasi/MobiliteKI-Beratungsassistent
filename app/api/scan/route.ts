import { NextRequest,NextResponse } from "next/server"; import { scan } from "@/lib/scanner";
export async function POST(req:NextRequest){try{const b=await req.json().catch(()=>({}));return NextResponse.json(await scan(b.sourceId));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Scan failed"},{status:409});}}
