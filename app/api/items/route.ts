import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(10, Number(params.get("pageSize")) || 20));
  const query = params.get("query")?.trim() || "";
  const where = query ? {
    OR: [
      { title: { contains: query } },
      { content: { contains: query } },
      { source: { name: { contains: query } } },
    ],
  } : {};

  const [items, filteredTotal, total, analyzed, pending, excluded] = await Promise.all([
    db.item.findMany({
      where,
      include: { source: true, discovery: { select: { id: true, category: true, relevanceScore: true } } },
      orderBy: [{ collectedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.item.count({ where }),
    db.item.count(),
    db.item.count({ where: { analyzedAt: { not: null } } }),
    db.item.count({ where: { analyzedAt: null } }),
    db.item.count({ where: { analyzedAt: { not: null }, relevant: false } }),
  ]);

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      canonicalUrl: item.canonicalUrl,
      publishedAt: item.publishedAt,
      collectedAt: item.collectedAt,
      analyzedAt: item.analyzedAt,
      relevant: item.relevant,
      source: { id: item.source.id, name: item.source.name, type: item.source.type },
      discovery: item.discovery,
      analysisStatus: !item.analyzedAt ? "PENDING" : item.relevant === false ? "EXCLUDED" : item.discovery ? "DISCOVERY" : "ANALYZED",
    })),
    pagination: { page, pageSize, filteredTotal, totalPages: Math.max(1, Math.ceil(filteredTotal / pageSize)) },
    stats: { total, analyzed, pending, excluded },
  });
}
