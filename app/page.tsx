"use client";

import React from "react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ margin: 0 }}>MicroCourse</h1>
      <p style={{ marginTop: 10, opacity: 0.85 }}>
        Build-safe home page. If you want to show auth state here, do it inside a client hook
        (not at module scope) and guard everything like it can be null.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/dashboard" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none" }}>
          Go to Dashboard
        </a>
        <a href="/auth/login" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none" }}>
          Login
        </a>
        <a href="/health" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none" }}>
          Health
        </a>
      </div>
    </main>
  );
}

