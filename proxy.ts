import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  if (session) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|api/auth|api/health|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
