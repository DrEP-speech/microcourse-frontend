"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/http";
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

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle"|"checking"|"ok"|"fail">("idle");
  const [result, setResult] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setRole(decodeRole(token));

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
    <main>
      <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="spread">
          <h1 className="h1" style={{ margin: 0 }}>Dashboard</h1>
          <button onClick={logout} className="btn danger">Logout</button>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          You&apos;re signed in. From here you can jump into the catalog and keep going on a course.
        </p>

        {role === "caregiver" && (
          <div className="card glow" style={{ marginTop: 16 }}>
            <h2 className="h2 glow-text" style={{ marginBottom: 8 }}>Mood &amp; regulation check-in</h2>
            <p className="muted" style={{ marginBottom: 12 }}>Check in on how your child is feeling right now.</p>
            <a className="btn primary" href="/caregiver">Go to check-in</a>
          </div>
        )}
        {role === "professional" && (
          <div className="card glow-amber" style={{ marginTop: 16 }}>
            <h2 className="h2 glow-text" style={{ marginBottom: 8 }}>Your client roster</h2>
            <p className="muted" style={{ marginBottom: 12 }}>Manage clients and review regulation check-in history.</p>
            <a className="btn primary" href="/professional">Go to clients</a>
          </div>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <a className="btn primary" href="/courses">Browse courses</a>
        </div>

        <hr className="hr" />

        <div className="stack">
          <div>Account check: <b>{status}</b></div>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 13, color: "var(--muted)" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}

