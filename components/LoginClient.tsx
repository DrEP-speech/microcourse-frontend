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
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10 }}>
        Backend: <span style={{ fontFamily: "monospace" }}>{apiBase}</span>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #111",
            background: busy ? "#eee" : "#111",
            color: busy ? "#111" : "#fff",
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>

        {msg && (
          <div style={{ marginTop: 6, whiteSpace: "pre-wrap", color: msg.toLowerCase().includes("successful") ? "green" : "crimson" }}>
            {msg}
          </div>
        )}

        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          If this fails with “route not found”, your backend login route isn’t <span style={{ fontFamily: "monospace" }}>/api/auth/login</span>.
          We’ll switch it to the correct one.
        </div>
      </form>
    </section>
  );
}