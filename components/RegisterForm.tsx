"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError, setClientToken } from "@/lib/api";

export function isBetaAccessRequired(): boolean {
  return process.env.NEXT_PUBLIC_BETA_ACCESS_REQUIRED === "true";
}

const ROLES = [
  { value: "student", label: "Student / Learner" },
  { value: "caregiver", label: "Caregiver / Parent" },
  { value: "professional", label: "Therapy Professional" },
];

const DISCIPLINES = ["SLP", "OT", "PT", "Behaviorist", "Psychologist", "Other"];

export function RegisterForm({ betaGate = isBetaAccessRequired() }: { betaGate?: boolean }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [discipline, setDiscipline] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"ok" | "alert">("alert");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    try {
      const body: Record<string, string> = { name, email, password, role };
      if (role === "professional" && discipline) body.discipline = discipline;
      if (betaGate) body.inviteCode = inviteCode;

      const data = await apiFetch<{ token: string }>("/api/auth/register", {
        method: "POST",
        body,
        noAuth: true,
      });

      setClientToken(data.token);
      setMsgType("ok");
      setMsg("Account created! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      const code = err instanceof ApiError ? err.details?.error : null;
      setMsgType("alert");
      if (code === "INVITE_CODE_REQUIRED") {
        setMsg("An invite code is required to create an account during beta.");
      } else if (code === "INVALID_INVITE_CODE") {
        setMsg("That invite code is not valid. Check with your beta coordinator.");
      } else if (code === "EMAIL_EXISTS") {
        setMsg("An account with that email already exists.");
      } else {
        setMsg(err?.message || "Registration failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <div className="card" style={{ maxWidth: 520, margin: "48px auto" }}>
        <h1 className="h2" style={{ marginBottom: 4 }}>Create your account</h1>

        <div
          className="alert"
          role="note"
          style={{ fontSize: 13, marginBottom: 16, background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.25)" }}
        >
          <strong>Beta notice:</strong> LexiMind Academy is in controlled beta. Do not enter real
          patient data or PHI. Use demo or anonymized data only.
        </div>

        <form onSubmit={onSubmit} className="formRow">
          <label className="stack">
            <span className="muted">Full name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>

          <label className="stack">
            <span className="muted">Email address</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label className="stack">
            <span className="muted">Password (min 8 characters)</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
          </label>

          <label className="stack">
            <span className="muted">I am a…</span>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>

          {role === "professional" && (
            <label className="stack">
              <span className="muted">Discipline</span>
              <select className="input" value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                <option value="">Select discipline</option>
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
          )}

          {betaGate && (
            <label className="stack">
              <span className="muted">Beta invite code</span>
              <input
                className="input"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                data-testid="invite-code-input"
              />
            </label>
          )}

          <button type="submit" disabled={busy} className="btn primary full">
            {busy ? "Creating account..." : "Create account"}
          </button>

          {msg && (
            <div className={msgType} role="alert">
              {msg}
            </div>
          )}

          <div style={{ textAlign: "center", fontSize: 13 }}>
            <span className="muted">Already have an account? </span>
            <Link href="/login" style={{ textDecoration: "underline" }}>Sign in</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
