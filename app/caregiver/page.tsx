"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";

type Client = {
  _id: string;
  name: string;
  discipline: string;
};

type CheckIn = {
  _id: string;
  zone: "blue" | "green" | "yellow" | "red";
  energy: number;
  pleasantness: number;
  label?: string;
  note?: string;
  createdAt: string;
};

const ZONES: { key: CheckIn["zone"]; label: string; hint: string }[] = [
  { key: "blue", label: "Blue Zone", hint: "Sad, tired, sick, bored" },
  { key: "green", label: "Green Zone", hint: "Calm, happy, focused, ready" },
  { key: "yellow", label: "Yellow Zone", hint: "Worried, silly, excited, frustrated" },
  { key: "red", label: "Red Zone", hint: "Angry, terrified, out of control" },
];

export default function CaregiverPortal() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [zone, setZone] = useState<CheckIn["zone"] | null>(null);
  const [energy, setEnergy] = useState(0);
  const [pleasantness, setPleasantness] = useState(0);
  const [hasMoodPoint, setHasMoodPoint] = useState(false);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<CheckIn[]>([]);
  const meterRef = useRef<HTMLDivElement>(null);

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
        const res = await apiGet<{ ok: boolean; items: CheckIn[] }>(`/api/checkins?clientId=${selectedClient}&limit=10`);
        setHistory(res.items || []);
      } catch {
        setHistory([]);
      }
    })();
  }, [selectedClient, submitMsg]);

  function handleMeterClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1 left->right
    const y = (e.clientY - rect.top) / rect.height; // 0..1 top->bottom
    setPleasantness(Math.round((x * 2 - 1) * 100) / 100);
    setEnergy(Math.round((1 - y * 2) * 100) / 100);
    setHasMoodPoint(true);
  }

  async function submitCheckIn() {
    if (!selectedClient || !zone) {
      setSubmitMsg("Pick a client and a zone first.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      await apiPost("/api/checkins", {
        clientId: selectedClient,
        zone,
        energy,
        pleasantness,
        label,
        note,
      });
      setSubmitMsg("Check-in saved!");
      setLabel("");
      setNote("");
    } catch (e) {
      setSubmitMsg(e instanceof ApiError ? e.message : "Failed to save check-in");
    } finally {
      setSubmitting(false);
    }
  }

  const dotLeft = `${((pleasantness + 1) / 2) * 100}%`;
  const dotTop = `${((1 - energy) / 2) * 100}%`;

  if (loading) return <main className="page container"><p className="muted">Loading your portal…</p></main>;

  return (
    <main className="page container">
      <div
        role="note"
        style={{ fontSize: 12, padding: "8px 12px", marginBottom: 12, borderRadius: 8, background: "rgba(255,200,0,0.07)", border: "1px solid rgba(255,200,0,0.2)", color: "var(--muted)" }}
      >
        <strong>Beta notice:</strong> This is a beta version. Not for emergency use or clinical decision-making.
        Do not enter real patient or PHI data — use demo data only.
      </div>
      <section className="hero" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">How are they feeling right now?</h1>
        <p className="hero-sub">
          A quick regulation check-in, inspired by Zones of Regulation and the Mood Meter — pick a zone,
          then tap where their mood sits for energy and pleasantness.
        </p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {clients.length === 0 && !error && (
        <div className="card">
          <p className="muted">
            No clients are linked to your account yet. Ask your child&apos;s provider to link your email to
            their client record to start checking in.
          </p>
        </div>
      )}

      {clients.length > 0 && (
        <>
          <div className="stack" style={{ marginBottom: "var(--space-6)" }}>
            <label htmlFor="client-select">Checking in for</label>
            <select
              id="client-select"
              className="input"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="card glow" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>1. Pick a zone</h2>
            <div className="zone-grid">
              {ZONES.map((z) => (
                <button
                  key={z.key}
                  type="button"
                  className={`zone-btn ${z.key}${zone === z.key ? " selected" : ""}`}
                  onClick={() => setZone(z.key)}
                  aria-pressed={zone === z.key}
                >
                  <span className="zone-dot" aria-hidden="true" />
                  {z.label}
                  <span className="text-xs">{z.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card glow-amber" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="h2" style={{ marginBottom: "var(--space-2)" }}>2. Mood Meter (optional)</h2>
            <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
              Tap a spot — up is more energy, right is more pleasant.
            </p>
            <div className="mood-meter" ref={meterRef} onClick={handleMeterClick} role="button" tabIndex={0} aria-label="Mood meter grid">
              <span className="mood-meter-axis-label" style={{ top: 4, left: "50%", transform: "translateX(-50%)" }}>High energy</span>
              <span className="mood-meter-axis-label" style={{ bottom: 4, left: "50%", transform: "translateX(-50%)" }}>Low energy</span>
              <span className="mood-meter-axis-label" style={{ left: 6, top: "50%", transform: "translateY(-50%)" }}>Unpleasant</span>
              <span className="mood-meter-axis-label" style={{ right: 6, top: "50%", transform: "translateY(-50%)" }}>Pleasant</span>
              {hasMoodPoint && (
                <span className="mood-meter-dot" style={{ left: dotLeft, top: dotTop }} aria-hidden="true" />
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>3. Add a note (optional)</h2>
            <div className="formRow">
              <div className="stack">
                <label htmlFor="mood-label">Mood word</label>
                <input
                  id="mood-label"
                  className="input"
                  placeholder="e.g. Frustrated, Excited, Calm"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="stack">
                <label htmlFor="mood-note">Note</label>
                <textarea
                  id="mood-note"
                  className="input"
                  rows={3}
                  placeholder="Anything you noticed…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="row" style={{ marginBottom: "var(--space-8)" }}>
            <button className="btn primary" disabled={submitting} onClick={submitCheckIn}>
              {submitting ? "Saving…" : "Save check-in"}
            </button>
            {submitMsg && <span className="muted">{submitMsg}</span>}
          </div>

          <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Recent check-ins</h2>
          <div className="checkin-list">
            {history.length === 0 && <p className="muted">No check-ins yet.</p>}
            {history.map((h) => (
              <div className="checkin-row" key={h._id}>
                <span className={`checkin-zone-chip ${h.zone}`} aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <strong style={{ textTransform: "capitalize" }}>{h.zone} zone</strong>
                  {h.label && <span className="muted"> — {h.label}</span>}
                  {h.note && <p className="text-sm" style={{ marginTop: 4 }}>{h.note}</p>}
                </div>
                <span className="text-xs">{new Date(h.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
