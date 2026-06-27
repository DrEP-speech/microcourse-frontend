"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken } from "../../lib/auth";

const API_BASE = (
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : "http://localhost:4000")
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
        setMsg({ type: "error", text: data.error || data.message || "Registration failed" });
        return;
      }
      const token = data.token || data.accessToken || data.jwt;
      if (!token) {
        setMsg({ type: "error", text: "Registered but no token returned — check backend" });
        return;
      }
      setToken(token);
      setMsg({ type: "ok", text: "Account created! Taking you in..." });
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Network error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      {/* Eyebrow */}
      <p className="eyebrow accent" style={{ marginBottom: 20 }}>
        MICROCOURSE — NEW ACCOUNT
      </p>

      {/* Display headline */}
      <h1
        style={{
          fontFamily: "var(--font-base)",
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 200,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: "var(--color-bone)",
          textAlign: "center",
          marginBottom: 36,
          maxWidth: 480,
        }}
      >
        Start learning
        <br />
        <span style={{ color: "var(--color-plum-voltage)" }}>in minutes.</span>
      </h1>

      {/* Form card — hairline on void */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-pill)",
          padding: "32px 28px",
        }}
      >
        <form onSubmit={onSubmit} className="formRow">
          <label className="stack">
            <span>Name</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label className="stack">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="stack">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="btn primary full"
            style={{ marginTop: 4 }}
            aria-busy={busy}
          >
            {busy ? "Creating account..." : "Create account"}
          </button>

          {msg && (
            <div className={msg.type === "ok" ? "ok" : "alert"} role="alert">
              {msg.text}
            </div>
          )}
        </form>
      </div>

      {/* Sign-in link */}
      <p style={{ marginTop: 24, fontSize: "var(--text-body-sm)", color: "var(--color-smoke)", letterSpacing: "0.025em" }}>
        Already have an account?{" "}
        <Link href="/login" className="link" style={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
