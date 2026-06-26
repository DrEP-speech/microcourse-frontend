"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/http";
import { clearToken, getToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle"|"checking"|"ok"|"fail">("idle");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      setStatus("checking");
      // common endpoint we already scaffolded before: /api/auth/ping-protected
      try {
        const data = await apiFetch<any>("auth/me", { method: "GET" });
        setStatus("ok");
        setResult(data);
      } catch (err: any) {
        setStatus("fail");
        setResult({ error: err?.message || String(err) });
      }
    })();
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24, color: "white" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", border: "1px solid #2a2a2a", borderRadius: 16, padding: 24, background: "#121212" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
          <button onClick={logout} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #2a2a2a", background: "#1a1a1a", color: "white" }}>
            Logout
          </button>
        </div>

        <p style={{ opacity: 0.85 }}>
          Protected route. If token is missing you get bounced to /login. If token is invalid, the /auth/me check fails.
        </p>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: "1px solid #2a2a2a", background: "#0b0b0b" }}>
          <div>Status: <b>{status}</b></div>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}

