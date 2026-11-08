import { db } from "../lib/db";

async function run() {
  const items = await db.item.findMany({
    select: {
      id: true,
      sourceId: true,
      canonicalUrl: true,
      title: true,
      publishedAt: true,
    },
  });
  for (const item of items) {
    await db.itemSourceReference.upsert({
      where: { canonicalUrl: item.canonicalUrl },
      update: {
        itemId: item.id,
        sourceId: item.sourceId,
        title: item.title,
        publishedAt: item.publishedAt,
      },
      create: {
        itemId: item.id,
        sourceId: item.sourceId,
        canonicalUrl: item.canonicalUrl,
        title: item.title,
        publishedAt: item.publishedAt,
      },
    });
  }
  console.log(`Backfilled ${items.length} source references.`);
}

run().finally(() => db.$disconnect());
