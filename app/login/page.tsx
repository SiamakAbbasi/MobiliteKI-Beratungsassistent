import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import LoginForm from "./login-form";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE_NAME)?.value,
  );
  if (session) redirect("/");
  const requestedNext = (await searchParams).next;
  const nextPath =
    typeof requestedNext === "string" &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/";

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <span>〽</span>
          <div>
            <b>Mobility Pulse AI</b>
            <small>Intelligenz für den deutschen Verkehr</small>
          </div>
        </div>
        <div className="login-message">
          <span>
            <ShieldCheck /> Geschützter Zugang
          </span>
          <h1>Verkehrsinformationen erkennen. Entwicklungen einordnen.</h1>
          <p>
            Ein zentraler Zugang zu Verkehrsnachrichten, KI-Erkenntnissen und
            strategischen Beratungen.
          </p>
        </div>
      </section>
      <section className="login-card-wrap">
        <div className="login-card">
          <div className="login-lock">
            <LockKeyhole />
          </div>
          <span className="login-kicker">Mobility Pulse AI</span>
          <h2>Willkommen zurück</h2>
          <p>Melden Sie sich mit dem gemeinsamen Demo-Zugang an.</p>
          <LoginForm nextPath={nextPath} />
          <small className="login-security">
            <ShieldCheck /> Ihre Sitzung wird in einem geschützten
            HttpOnly-Cookie gespeichert.
          </small>
        </div>
      </section>
    </main>
  );
}
