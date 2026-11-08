"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "menu";
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={`logout-button ${variant === "menu" ? "logout-menu-item" : ""}`}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.replace("/login");
      }}
    >
      <LogOut />
      {busy ? "Abmeldung…" : "Abmelden"}
    </button>
  );
}
