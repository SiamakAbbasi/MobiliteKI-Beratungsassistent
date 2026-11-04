import { NextRequest,NextResponse } from "next/server"; import { db } from "@/lib/db";
export async function PUT(r:NextRequest){const b=await r.json();for(const [key,value] of Object.entries(b))await db.setting.upsert({where:{key},update:{value:String(value)},create:{key,value:String(value)}});return NextResponse.json({ok:true});}
