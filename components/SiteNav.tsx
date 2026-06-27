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
            {/* SVG icon — no emoji per skill rule no-emoji-icons */}
            <span className="brand-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1" fill="white" fillOpacity="0.9"/>
                <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" fill="white" fillOpacity="0.6"/>
                <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" fill="white" fillOpacity="0.6"/>
                <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" fill="white" fillOpacity="0.35"/>
              </svg>
            </span>
            MicroCourse
          </Link>

          <Link
            className={`badge${pathname === "/courses" ? " active" : ""}`}
            href="/courses"
            aria-current={pathname === "/courses" ? "page" : undefined}
          >
            Catalog
          </Link>

          {authed && (
            <Link
              className={`badge${pathname === "/dashboard" ? " active" : ""}`}
              href="/dashboard"
              aria-current={pathname === "/dashboard" ? "page" : undefined}
            >
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      <div className="row" role="group" aria-label="Account actions">
        {!authed ? (
          <>
            <Link className="badge" href="/login" style={{ color: "var(--color-smoke)" }}>
              Sign in
            </Link>
            <Link className="btn primary" href="/register" style={{ minHeight: 36, fontSize: 12 }}>
              Get started
            </Link>
          </>
        ) : (
          <>
            {role && (
              <span
                className="badge active"
                aria-label={`Signed in as ${role}`}
                style={{ borderColor: "var(--color-plum-voltage)", color: "var(--color-plum-voltage)", border: "1px solid" }}
              >
                {role}
              </span>
            )}
            <button
              className="btn danger"
              onClick={onLogout}
              aria-label="Log out of your account"
              style={{ minHeight: 36, fontSize: 12 }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
