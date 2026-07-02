"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
        noAuth: true,
      });
    } catch {
      // Intentionally swallow errors — always show the generic success message
      // to avoid revealing whether the email is registered.
    } finally {
      setBusy(false);
      setSubmitted(true);
    }
  }

  return (
    <main>
      <div className="card" style={{ maxWidth: 480, margin: "48px auto" }}>
        <h1 className="h2" style={{ marginBottom: 8 }}>Reset your password</h1>

        {submitted ? (
          <div>
            <p style={{ marginBottom: 16 }}>
              If that email is registered, a reset link has been sent.
              Check your inbox (and spam folder).
            </p>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              During the beta, reset links are delivered manually by the team.
              If you don&apos;t receive one within a few hours, contact your beta coordinator.
            </p>
            <Link href="/login" className="btn primary">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="formRow">
            <label className="stack">
              <span className="muted">Email address</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <button type="submit" disabled={busy} className="btn primary full">
              {busy ? "Sending..." : "Send reset link"}
            </button>

            <Link href="/login" className="muted" style={{ fontSize: 13, textAlign: "center", display: "block" }}>
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
