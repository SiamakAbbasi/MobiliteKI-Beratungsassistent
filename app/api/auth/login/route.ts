import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  authIsConfigured,
  createSessionToken,
  credentialsMatch,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
type Attempt = { count: number; resetAt: number };
const globalRateLimit = globalThis as typeof globalThis & {
  mobilityLoginAttempts?: Map<string, Attempt>;
};
const attempts =
  globalRateLimit.mobilityLoginAttempts || new Map<string, Attempt>();
globalRateLimit.mobilityLoginAttempts = attempts;

function clientKey(request: NextRequest) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

function rateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return { blocked: false, retryAfter: 0 };
  }
  return {
    blocked: current.count >= MAX_ATTEMPTS,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export async function POST(request: NextRequest) {
  if (!authIsConfigured()) {
    return NextResponse.json(
      { error: "Anmeldung ist serverseitig nicht konfiguriert." },
      { status: 503 },
    );
  }

  const key = clientKey(request);
  const limit = rateLimit(key);
  if (limit.blocked) {
    return NextResponse.json(
      {
        error:
          "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!credentialsMatch(username, password)) {
    const current = attempts.get(key)!;
    current.count += 1;
    attempts.set(key, current);
    return NextResponse.json(
      { error: "Benutzername oder Passwort ist falsch." },
      { status: 401 },
    );
  }

  attempts.delete(key);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    await createSessionToken(username),
    sessionCookieOptions(),
  );
  return response;
}
