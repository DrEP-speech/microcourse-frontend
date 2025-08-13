"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");
      router.push(redirect);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Log in</h1>

      {errorMsg && (
        <div style={{ background:"#fee2e2", border:"1px solid #ef4444", padding:"12px 16px", borderRadius:8, marginBottom:16 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display:"grid", gap:16 }}>
        <label style={{ display:"grid", gap:6 }}>
          <span>Email</span>
          <input name="email" type="email" required value={form.email} onChange={onChange}
            style={{ padding:"10px 12px", borderRadius:8, border:"1px solid #ddd" }} />
        </label>
        <label style={{ display:"grid", gap:6 }}>
          <span>Password</span>
          <input name="password" type="password" required value={form.password} onChange={onChange}
            style={{ padding:"10px 12px", borderRadius:8, border:"1px solid #ddd" }} />
        </label>
        <button type="submit" disabled={loading}
          style={{ padding:"12px 16px", borderRadius:10, border:"1px solid #111", background:"#111", color:"#fff" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        No account? <Link href="/signup" style={{ textDecoration: "underline" }}>Create one</Link>
      </p>
    </div>
  );
}