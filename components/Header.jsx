"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (alive) setUser(data.user ?? null);
        } else if (alive) {
          setUser(null);
        }
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function onLogout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      router.refresh();
      router.push("/");
    }
  }

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">MicroCourse</Link>
        <nav className="flex items-center gap-4 text-sm">
          {loading ? (
            <span>…</span>
          ) : user ? (
            <>
              <span className="opacity-70">{user.name || user.email}</span>
              <button onClick={onLogout} className="px-3 py-1 rounded border hover:bg-gray-50">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="underline">Login</Link>
              <Link href="/signup" className="underline">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
