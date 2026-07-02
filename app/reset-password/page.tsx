"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailParam = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Guard: if no token in URL, the link is invalid
  const linkInvalid = !emailParam || !tokenParam;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { email: emailParam, token: tokenParam, password },
        noAuth: true,
      });
      setSuccess(true);
    } catch (err: any) {
      const code = err instanceof ApiError ? err.details?.error : null;
      if (code === "INVALID_OR_EXPIRED_TOKEN") {
        setMsg("This reset link has expired or already been used. Please request a new one.");
      } else if (code === "PASSWORD_TOO_SHORT") {
        setMsg("Password must be at least 8 characters.");
      } else {
        setMsg(err?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (linkInvalid) {
    return (
      <div>
        <p style={{ marginBottom: 16 }}>
          This reset link is invalid or incomplete. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn primary">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <p style={{ marginBottom: 16 }}>
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="formRow">
      <label className="stack">
        <span className="muted">New password</span>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </label>

      <label className="stack">
        <span className="muted">Confirm new password</span>
        <input
          className="input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          required
        />
      </label>

      <button type="submit" disabled={busy} className="btn primary full">
        {busy ? "Updating..." : "Set new password"}
      </button>

      {msg && (
        <div className="alert" role="alert">
          {msg}
        </div>
      )}

      <Link href="/login" className="muted" style={{ fontSize: 13, textAlign: "center", display: "block" }}>
        Back to sign in
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main>
      <div className="card" style={{ maxWidth: 480, margin: "48px auto" }}>
        <h1 className="h2" style={{ marginBottom: 8 }}>Set a new password</h1>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
