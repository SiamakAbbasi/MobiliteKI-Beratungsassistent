"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(result.error || "Die Anmeldung ist derzeit nicht möglich.");
      return;
    }
    window.location.replace(nextPath);
  };

  return (
    <form className="login-form" onSubmit={submit}>
      <label>
        <span>Benutzername</span>
        <div className="login-input">
          <UserRound />
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            autoFocus
          />
        </div>
      </label>
      <label>
        <span>Passwort</span>
        <div className="login-input">
          <LockKeyhole />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            className="password-visibility"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={
              showPassword ? "Passwort ausblenden" : "Passwort anzeigen"
            }
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </label>
      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}
      <button className="login-submit" disabled={busy}>
        <LogIn />
        {busy ? "Anmeldung läuft…" : "Anmelden"}
      </button>
    </form>
  );
}
