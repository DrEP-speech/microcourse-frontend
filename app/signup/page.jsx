"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function SignupPage() {
  const r = useRouter();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, role: "student" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Signup failed");
      r.push("/"); // go home; header will show logged-in state
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={onSubmit} style={{ display:"grid", gap:12, maxWidth:360 }}>
        <input placeholder="Name" value={form.name}
          onChange={e=>setForm(f=>({ ...f, name:e.target.value }))} />
        <input placeholder="Email" value={form.email}
          onChange={e=>setForm(f=>({ ...f, email:e.target.value }))} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e=>setForm(f=>({ ...f, password:e.target.value }))} />
        <button type="submit">Create account</button>
        {err && <p style={{ color:"crimson" }}>{err}</p>}
      </form>
    </div>
  );
}
