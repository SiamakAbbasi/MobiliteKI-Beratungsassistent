import { NextRequest,NextResponse } from "next/server"; import { testSource } from "@/lib/scanner";
export async function POST(r:NextRequest){try{const b=await r.json();return NextResponse.json(await testSource(b.url,b.type));}catch(e){return NextResponse.json({ok:false,message:e instanceof Error?e.message:"Connection failed"},{status:400});}}
