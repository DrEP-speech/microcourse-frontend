"use client";

import { useState } from "react";
import { apiFetch, ApiError, getApiBase, setClientToken } from "@/lib/api";
import { useRouter } from "next/navigation";

type LoginResponse = {
  ok?: boolean;
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: any;
  error?: string;
  message?: string;
};

export default function LoginClient() {
  const router = useRouter();
  const apiBase = getApiBase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      // Try the most likely login route first.
      // If your backend differs, change to your actual endpoint.
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
        noAuth: true,
      });

      const token = data.token || data.accessToken || data.jwt;

      if (!token) {
        throw new ApiError({
          status: 500,
          message: "Login succeeded but no token was returned. Check backend authController response shape.",
          details: data,
        });
      }

      setClientToken(token);
      setMsg("Login successful. Token stored. Redirecting to /courses...");
      setTimeout(() => router.push("/courses"), 350);
    } catch (e: any) {
      const text = e instanceof ApiError ? `${e.message}` : (e?.message || "Login failed");
      setMsg(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <form onSubmit={onSubmit} className="formRow">
        <label className="stack">
          <span className="muted">Email</span>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="stack">
          <span className="muted">Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" disabled={busy} className="btn primary full">
          {busy ? "Signing in..." : "Sign in"}
        </button>

        {msg && (
          <div className={msg.toLowerCase().includes("successful") ? "ok" : "alert"}>
            {msg}
          </div>
        )}

        <div className="muted" style={{ fontSize: 12 }}>
          Backend: <span style={{ fontFamily: "monospace" }}>{apiBase}</span>
        </div>
      </form>
    </section>
  );
}