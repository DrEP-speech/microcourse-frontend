"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "../../lib/auth";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : "http://localhost:4000"
  ).replace(/\/+$/, "");

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || data.message || "Registration failed");
        return;
      }
      const token = data.token || data.accessToken || data.jwt;
      if (!token) {
        setMsg("Registered but no token returned — check backend response");
        return;
      }
      setToken(token);
      setMsg("Account created! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 400);
    } catch (e) {
      setMsg(e?.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Create account</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Registers via <code>/api/auth/register</code> and stores a JWT locally.
      </p>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input
              type="email"
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
            {busy ? "Creating account..." : "Create account"}
          </button>

          {msg && (
            <div
              style={{
                marginTop: 6,
                color: msg.toLowerCase().includes("redirect") ? "green" : "crimson",
              }}
            >
              {msg}
            </div>
          )}
        </form>

        <p style={{ marginTop: 14, fontSize: 13, opacity: 0.7 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "inherit" }}>
            Sign in
          </a>
        </p>
      </section>
    </main>
  );
}
