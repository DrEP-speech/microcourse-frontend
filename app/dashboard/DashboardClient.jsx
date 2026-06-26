"use client";

import Link from "next/link";

export default function DashboardClient() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Strict build + test mode is on. If it breaks, it gets fixed — immediately.
      </p>

      <nav style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Home
        </Link>
        <Link href="/dashboard" style={{ textDecoration: "underline" }}>
          Refresh Dashboard
        </Link>
      </nav>
    </main>
  );
}

