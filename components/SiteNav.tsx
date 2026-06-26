"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/auth";

function decodeRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json?.role || null;
  } catch {
    return null;
  }
}

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    setAuthed(!!token);
    setRole(token ? decodeRole(token) : null);
  }, [pathname]);

  function onLogout() {
    clearToken();
    setAuthed(false);
    router.push("/login");
  }

  return (
    <header className="nav" role="banner">
      <nav aria-label="Main navigation">
        <div className="row">
          <Link href="/" className="brand" aria-label="MicroCourse home">
            <span className="brand-icon" aria-hidden="true">📚</span>
            MicroCourse
          </Link>
          <Link className={`badge${pathname === "/courses" ? " active" : ""}`} href="/courses"
            aria-current={pathname === "/courses" ? "page" : undefined}>
            Catalog
          </Link>
          {authed && (
            <Link className={`badge${pathname === "/dashboard" ? " active" : ""}`} href="/dashboard"
              aria-current={pathname === "/dashboard" ? "page" : undefined}>
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      <div className="row" role="group" aria-label="Account actions">
        {!authed ? (
          <>
            <Link className="btn secondary" href="/login">Login</Link>
            <Link className="btn primary" href="/register">Get started</Link>
          </>
        ) : (
          <>
            {role && <span className="badge" aria-label={`Role: ${role}`}>{role}</span>}
            <button className="btn danger" onClick={onLogout} aria-label="Log out of your account">Logout</button>
          </>
        )}
      </div>
    </header>
  );
}
