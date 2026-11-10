import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  ADVISOR_PROMPT_VERSION,
  askAdvisor,
  enqueueAdvisorReport,
  generateAdvisorReport,
  getCanonicalAdvisorReport,
  normalizeAdvisorProvider,
  advisorProviderModel,
} from "@/lib/advisor";
import { COMPANY_PROFILE_VERSION } from "@/lib/company-profiles";

function serialize(report: any) {
  return {
    ...report,
    report: report.reportJson ? JSON.parse(report.reportJson) : null,
    reportJson: undefined,
  };
}
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/advisor/[articleId]">,
) {
  const { articleId } = await context.params;
  const provider=normalizeAdvisorProvider(request.nextUrl.searchParams.get("provider"));
  const item = await db.item.findUnique({
    where: { id: articleId },
    include: { source: true },
  });
  if (!item)
    return Response.json({ error: "Artikel nicht gefunden" }, { status: 404 });
  const report = await getCanonicalAdvisorReport(articleId,provider),
    updateAvailable = Boolean(
      report &&
      (report.contentHash !== item.contentHash ||
        report.profileVersion !== COMPANY_PROFILE_VERSION ||
        report.promptVersion !== ADVISOR_PROMPT_VERSION ||
        report.model !== advisorProviderModel(provider)),
    );
  return Response.json({
    article: item,
    job: report ? serialize(report) : null,
    report: report?.status === "COMPLETED" ? serialize(report) : null,
    status: report?.status || "NOT_STARTED",
    error: report?.error,
    provider,
    updateAvailable,
  });
}
export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/advisor/[articleId]">,
) {
  const { articleId } = await context.params;
  try {
    const body = await request.json().catch(() => ({}));
    const provider=normalizeAdvisorProvider(body.provider);
    if (body.action === "chat")
      return Response.json(
        await askAdvisor(articleId, String(body.question || ""),provider),
      );
    if (body.action === "retry") {
      const report = await getCanonicalAdvisorReport(articleId,provider);
      if (report && ["FAILED", "DEFERRED"].includes(report.status)) {
        if (report.attemptCount >= report.maxAttempts)
          throw new Error(
            "Die maximale Anzahl von Analyseversuchen ist erreicht",
          );
        await db.advisorReport.update({
          where: { id: report.id },
          data: {
            status: "PENDING",
            error: null,
            completedAt: null,
            leaseExpiresAt: null,
          },
        });
      }
    }
    const job = await enqueueAdvisorReport(articleId,provider);
    if (job.status === "PENDING")
      void generateAdvisorReport(articleId,provider).catch((error) =>
        console.error(
          `[advisor-api] ${articleId}:`,
          error instanceof Error ? error.message : error,
        ),
      );
    return Response.json(
      { job: serialize(job), status: job.status,provider },
      { status: job.status === "COMPLETED" ? 200 : 202 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Anfrage an den Beratungsassistenten fehlgeschlagen";
    return Response.json(
      { error: message },
      {
        status: /nicht gefunden/i.test(message)
          ? 404
          : /budget/i.test(message)
            ? 402
            : 400,
      },
    );
  }
}
