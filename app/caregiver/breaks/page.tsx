"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";

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

export default function CaregiverBreaksPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [active, setActive] = useState<MovementBreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ ok: boolean; items: Client[] }>("/api/clients");
        setClients(res.items || []);
        if (res.items && res.items.length > 0) setSelectedClient(res.items[0]._id);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    (async () => {
      try {
        const res = await apiGet<{ ok: boolean; items: Assignment[] }>(`/api/client-breaks?clientId=${selectedClient}`);
        setAssignments(res.items || []);
      } catch {
        setAssignments([]);
      }
    })();
  }, [selectedClient]);

  function startBreak(b: MovementBreak) {
    setActive(b);
    setSecondsLeft(b.durationSeconds);
    setDoneMsg(null);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          finishBreak();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  async function finishBreak() {
    if (!active) return;
    try {
      await apiPost("/api/break-logs", {
        clientId: selectedClient,
        breakId: active._id,
        durationSeconds: active.durationSeconds,
      });
      setDoneMsg("Nice work! Break logged.");
    } catch (e) {
      setDoneMsg(e instanceof ApiError ? e.message : "Couldn't log this break, but great job finishing it!");
    }
  }

  function exitPlayer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setActive(null);
  }

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;

  const pct = active ? Math.round(((active.durationSeconds - secondsLeft) / active.durationSeconds) * 100) : 0;
  const currentStepIdx = active && active.instructions.length > 0
    ? Math.min(
        active.instructions.length - 1,
        Math.floor(((active.durationSeconds - secondsLeft) / active.durationSeconds) * active.instructions.length)
      )
    : -1;

  return (
    <main className="page container">
      <section className="hero" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">Movement breaks</h1>
        <p className="hero-sub">Quick guided breaks assigned by your provider — pick one and follow along.</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {clients.length === 0 && !error && (
        <div className="card"><p className="muted">No clients linked to your account yet.</p></div>
      )}

      {clients.length > 0 && !active && (
        <>
          <div className="stack" style={{ marginBottom: "var(--space-6)" }}>
            <label htmlFor="br-client">For</label>
            <select id="br-client" className="input" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {assignments.length === 0 ? (
            <div className="card"><p className="muted">No breaks assigned yet for this client.</p></div>
          ) : (
            <div className="break-grid">
              {assignments.map((a) => (
                <div className="card glow break-card" key={a.assignmentId}>
                  <span className="break-icon" aria-hidden="true">{a.break.icon}</span>
                  <strong>{a.break.title}</strong>
                  <span className={`badge break-cat ${a.break.category}`}>{a.break.category}</span>
                  <span className="text-xs">{Math.round(a.break.durationSeconds / 60 * 10) / 10} min</span>
                  <button className="btn primary" onClick={() => startBreak(a.break)}>Start</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {active && (
        <div className="card glow break-player">
          <h2 className="h2" style={{ marginBottom: "var(--space-2)" }}>{active.icon} {active.title}</h2>
          <div className="break-timer-ring" style={{ "--pct": pct } as React.CSSProperties}>
            <div className="break-timer-ring-inner">{secondsLeft}s</div>
          </div>

          {active.instructions.length > 0 && (
            <div className="break-steps">
              {active.instructions.map((step, idx) => (
                <div key={idx} className={`break-step${idx === currentStepIdx ? " current" : ""}`}>
                  {idx + 1}. {step}
                </div>
              ))}
            </div>
          )}

          {doneMsg && <p className="ok" style={{ marginTop: "var(--space-5)", display: "inline-block" }}>{doneMsg}</p>}

          <div className="row" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
            <button className="btn secondary" onClick={exitPlayer}>
              {running ? "Cancel" : "Done — back to breaks"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
