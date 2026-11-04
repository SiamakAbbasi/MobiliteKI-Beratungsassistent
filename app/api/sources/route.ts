import { NextRequest,NextResponse } from "next/server"; import { db } from "@/lib/db"; import { z } from "zod";
const schema=z.object({name:z.string().min(2),url:z.url(),type:z.enum(["RSS","API","WEBSITE","OPARL","TED"]).optional()});
const detect=(u:string)=>u.includes("oparl")?"OPARL":u.includes("ted.europa")?"TED":/rss|feed|atom|xml/i.test(u)?"RSS":"WEBSITE";
export async function POST(r:NextRequest){try{const b=schema.parse(await r.json());return NextResponse.json(await db.source.create({data:{...b,type:b.type||detect(b.url)}}));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid source"},{status:400});}}
export async function PUT(r:NextRequest){const b=await r.json();return NextResponse.json(await db.source.update({where:{id:b.id},data:{name:b.name,url:b.url,type:b.type,enabled:b.enabled}}));}
export async function DELETE(r:NextRequest){const id=new URL(r.url).searchParams.get("id");if(!id)return NextResponse.json({error:"Missing id"},{status:400});await db.source.delete({where:{id}});return NextResponse.json({ok:true});}
