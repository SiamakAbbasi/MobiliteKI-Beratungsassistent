import { db } from "../lib/db";
import { generateAdvisorReport } from "../lib/advisor";

const POLL_MS = 2_000;
let stopping = false;
process.on("SIGINT", () => {
  stopping = true;
});
process.on("SIGTERM", () => {
  stopping = true;
});

async function claimNext() {
  return db.advisorReport.findFirst({
    where: { status: "PENDING", attemptCount: { lt: 2 } },
    orderBy: { createdAt: "asc" },
  });
}

async function work() {
  while (!stopping) {
    const job = await claimNext();
    if (!job) {
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      continue;
    }
    try {
      await generateAdvisorReport(job.itemId);
    } catch (error) {
      console.error(
        `[advisor-worker] ${job.id}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  await db.$disconnect();
}

work().catch(async (error) => {
  console.error("[advisor-worker] fatal:", error);
  await db.$disconnect();
  process.exit(1);
});
