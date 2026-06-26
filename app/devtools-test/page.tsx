"use client";

import React from "react";

export const dynamic = "force-dynamic";

export default function DevtoolsTestPage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ margin: 0 }}>Devtools Test</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        This route is intentionally build-safe. If you want Redux selector testing here, add it back
        later inside a client-only component (and never run store reads at module scope).
      </p>
    </main>
  );
}

