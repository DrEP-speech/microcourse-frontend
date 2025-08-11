"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      const data = await res.json();
      setUser(data?.success ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshMe(); }, []);

  async function onLogout() {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
      setUser(null);
    } catch {}
  }

  return (
    <header style={{borderBottom:"1px solid #eee", padding:"12px 16px", display:"flex", gap:12, alignItems:"center"}}>
      <Link href="/" style={{ fontWeight: 700 }}>MicroCourse LMS</Link>
      <nav style={{ marginLeft: "auto", display:"flex", gap:12 }}>
        {loading ? (
          <span>…</span>
        ) : user ? (
          <>
            <span>Hello, {user.name ?? user.email}</span>
            <button onClick={onLogout} style={{ padding:"6px 10px", border:"1px solid #ddd", borderRadius:8, cursor:"pointer" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
