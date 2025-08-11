"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      // prove cookie round-trip
      await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      setMsg(`Welcome ${data?.user?.name || data?.user?.email || "!"}`);
      router.push("/");
      router.refresh();
    } catch (err) {
      setMsg(err.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create your account</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border p-2 w-full rounded" placeholder="Name"
          value={form.name} onChange={(e) => setField("name", e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Email" type="email"
          value={form.email} onChange={(e) => setField("email", e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Password" type="password"
          value={form.password} onChange={(e) => setField("password", e.target.value)} />
        <button disabled={busy} className="bg-black text-white px-4 py-2 rounded disabled:opacity-60">
          {busy ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p className="mt-3 text-sm">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </main>
  );
}
