"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch, getApiBase, API_MODULE_SIGNATURE } from "@/lib/api";

type Probe = { ok: boolean; name?: string; time?: string; env?: string; version?: string; error?: string };

export default function HealthCheckClient() {
  console.log("API MODULE SIGNATURE:", API_MODULE_SIGNATURE);
  console.log("typeof getApiBase:", typeof getApiBase);
  const apiBase = useMemo(() => (typeof getApiBase === "function" ? getApiBase() : "BAD_IMPORT"), []);

  const [results, setResults] = useState<Probe[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setResults(null);

      try {
        const r = await apiFetch<Probe>("/health", { method: "GET", auth: false });
        if (!cancelled) setResults([r]);
      } catch (e: any) {
        console.error("Health check failed:", e);
        if (!cancelled) setError(e?.message || "Health check failed");
      }
    }

    run();
    return () => { cancelled = true; };
  }, [apiBase]);

  return (
    <div style={{ padding: 16, background: "#fff", color: "#111", border: "1px solid #222", borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>API Health Probe</h2>
      <div style={{ opacity: 0.9 }}>API Base: <code>{apiBase}</code></div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #b00020", borderRadius: 10 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && !results && <div style={{ marginTop: 12 }}>Checking…</div>}

      {results && (
        <pre style={{ marginTop: 12, padding: 10, border: "1px solid #333", borderRadius: 10, overflow: "auto" }}>
{JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}