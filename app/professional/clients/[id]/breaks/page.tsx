"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiDel, ApiError } from "@/lib/api";

type Client = { _id: string; name: string };

type MovementBreak = {
  _id: string;
  title: string;
  category: string;
  icon: string;
  durationSeconds: number;
  instructions: string[];
};

type Assignment = { assignmentId: string; break: MovementBreak };

type BreakLog = {
  _id: string;
  breakId: MovementBreak | string;
  durationSeconds: number;
  createdAt: string;
};

export default function ClientBreaksPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [library, setLibrary] = useState<MovementBreak[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [logs, setLogs] = useState<BreakLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [clientRes, libraryRes, assignedRes, logsRes] = await Promise.all([
        apiGet<{ ok: boolean; data: Client }>(`/api/clients/${clientId}`),
        apiGet<{ ok: boolean; items: MovementBreak[] }>("/api/movement-breaks"),
        apiGet<{ ok: boolean; items: Assignment[] }>(`/api/client-breaks?clientId=${clientId}`),
        apiGet<{ ok: boolean; items: BreakLog[] }>(`/api/break-logs?clientId=${clientId}&limit=20`),
      ]);
      setClient(clientRes.data);
      setLibrary(libraryRes.items || []);
      setAssignments(assignedRes.items || []);
      setLogs(logsRes.items || []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load breaks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) loadAll();
  }, [clientId]);

  const assignedIds = new Set(assignments.map((a) => a.break._id));

  async function assign(breakId: string) {
    try {
      await apiPost("/api/client-breaks", { clientId, breakId });
      await loadAll();
    } catch {
      // no-op
    }
  }

  async function unassign(assignmentId: string) {
    try {
      await apiDel(`/api/client-breaks/${assignmentId}`);
      await loadAll();
    } catch {
      // no-op
    }
  }

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;

  return (
    <main className="page container">
      <Link href={`/professional/clients/${clientId}`} className="badge" style={{ marginBottom: "var(--space-4)", display: "inline-block" }}>
        ← Back to {client?.name || "client"}
      </Link>

      <section className="hero" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">Movement breaks</h1>
        <p className="hero-sub">Assign quick sensory/movement breaks for {client?.name} from the shared library.</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Assigned ({assignments.length})</h2>
      {assignments.length === 0 ? (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}><p className="muted">No breaks assigned yet — add some from the library below.</p></div>
      ) : (
        <div className="break-grid" style={{ marginBottom: "var(--space-8)" }}>
          {assignments.map((a) => (
            <div className="card glow break-card" key={a.assignmentId}>
              <span className="break-icon" aria-hidden="true">{a.break.icon}</span>
              <strong>{a.break.title}</strong>
              <span className={`badge break-cat ${a.break.category}`}>{a.break.category}</span>
              <span className="text-xs">{Math.round(a.break.durationSeconds / 60 * 10) / 10} min</span>
              <button className="btn danger" onClick={() => unassign(a.assignmentId)}>Unassign</button>
            </div>
          ))}
        </div>
      )}

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Break library</h2>
      <div className="break-grid" style={{ marginBottom: "var(--space-8)" }}>
        {library.map((b) => (
          <div className="card break-card" key={b._id}>
            <span className="break-icon" aria-hidden="true">{b.icon}</span>
            <strong>{b.title}</strong>
            <span className={`badge break-cat ${b.category}`}>{b.category}</span>
            <span className="text-xs">{Math.round(b.durationSeconds / 60 * 10) / 10} min</span>
            <button
              className="btn primary"
              disabled={assignedIds.has(b._id)}
              onClick={() => assign(b._id)}
            >
              {assignedIds.has(b._id) ? "Assigned" : "Assign"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Recent completions</h2>
      <div className="checkin-list">
        {logs.length === 0 && <p className="muted">No completions logged yet.</p>}
        {logs.map((l) => {
          const b = typeof l.breakId === "object" ? l.breakId : null;
          return (
            <div className="checkin-row" key={l._id}>
              <span style={{ fontSize: 20 }} aria-hidden="true">{b?.icon || "🏃"}</span>
              <div style={{ flex: 1 }}><strong>{b?.title || "Break"}</strong></div>
              <span className="text-xs">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
