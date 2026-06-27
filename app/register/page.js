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
  const [role, setRole] = useState("student");
  const [discipline, setDiscipline] = useState("SLP");
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
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          discipline: role === "professional" ? discipline : undefined,
        }),
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
    <div>
      <h1 className="h1" style={{ textAlign: "center", marginBottom: 6 }}>Create your account</h1>
      <p className="muted" style={{ textAlign: "center", marginBottom: 24 }}>
        Takes less than a minute. We&apos;ll get you straight to your dashboard.
      </p>

      <section className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <form onSubmit={onSubmit} className="formRow">
          <label className="stack">
            <span className="muted">Name</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label className="stack">
            <span className="muted">Email</span>
            <input
              className="input"
              type="email"
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

          <label className="stack">
            <span className="muted">I am a…</span>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Learner / general student</option>
              <option value="caregiver">Parent / Caregiver</option>
              <option value="professional">Therapy professional</option>
            </select>
          </label>

          {role === "professional" && (
            <label className="stack">
              <span className="muted">Discipline</span>
              <select className="input" value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                <option value="SLP">Speech-Language Pathologist</option>
                <option value="OT">Occupational Therapist</option>
                <option value="PT">Physical Therapist</option>
                <option value="Behaviorist">Behaviorist</option>
                <option value="Psychologist">Psychologist</option>
                <option value="Other">Other</option>
              </select>
            </label>
          )}

          <button type="submit" disabled={busy} className="btn primary full">
            {busy ? "Creating account..." : "Create account"}
          </button>

          {msg && (
            <div className={msg.toLowerCase().includes("redirect") ? "ok" : "alert"}>
              {msg}
            </div>
          )}
        </form>

        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Already have an account?{" "}
          <a href="/login" className="link">
            Sign in
          </a>
        </p>
      </section>
    </div>
  );
}
