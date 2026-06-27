"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, ApiError } from "@/lib/api";

type Client = {
  _id: string;
  name: string;
  discipline: string;
  caregiverEmail?: string;
  notes?: string;
  createdAt: string;
};

const DISCIPLINES = ["SLP", "OT", "PT", "Behaviorist", "Psychologist", "Other"];

export default function ProfessionalPortal() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("Other");
  const [caregiverEmail, setCaregiverEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  async function loadClients() {
    setLoading(true);
    try {
      const res = await apiGet<{ ok: boolean; items: Client[] }>("/api/clients");
      setClients(res.items || []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function addClient() {
    if (!name.trim()) {
      setFormMsg("Name is required.");
      return;
    }
    setSaving(true);
    setFormMsg(null);
    try {
      await apiPost("/api/clients", { name, discipline, caregiverEmail, notes });
      setName("");
      setCaregiverEmail("");
      setNotes("");
      setShowForm(false);
      await loadClients();
    } catch (e) {
      setFormMsg(e instanceof ApiError ? e.message : "Failed to create client");
    } finally {
      setSaving(false);
    }
  }

  function initials(n: string) {
    return n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <main className="page container">
      <section className="hero" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">Your client roster</h1>
        <p className="hero-sub">
          Add clients, link a caregiver to invite them into check-ins, and review regulation trends
          across disciplines — SLP, OT, PT, behaviorist, psychologist, and more.
        </p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      <div className="row" style={{ marginBottom: "var(--space-6)" }}>
        <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add client"}
        </button>
      </div>

      {showForm && (
        <div className="card glow" style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>New client</h2>
          <div className="formRow">
            <div className="stack">
              <label htmlFor="c-name">Name</label>
              <input id="c-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="stack">
              <label htmlFor="c-discipline">Discipline</label>
              <select id="c-discipline" className="input" value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
                {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="stack">
              <label htmlFor="c-email">Caregiver email (optional)</label>
              <input id="c-email" className="input" type="email" value={caregiverEmail} onChange={(e) => setCaregiverEmail(e.target.value)} placeholder="parent@example.com" />
            </div>
            <div className="stack">
              <label htmlFor="c-notes">Notes (optional)</label>
              <textarea id="c-notes" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            <button className="btn primary" disabled={saving} onClick={addClient}>
              {saving ? "Saving…" : "Create client"}
            </button>
            {formMsg && <span className="muted">{formMsg}</span>}
          </div>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading clients…</p>
      ) : clients.length === 0 ? (
        <div className="card"><p className="muted">No clients yet. Add your first one above.</p></div>
      ) : (
        <div className="grid grid-2">
          {clients.map((c) => (
            <Link key={c._id} href={`/professional/clients/${c._id}`} className="card interactive client-card">
              <div className="row">
                <span className="client-avatar" aria-hidden="true">{initials(c.name)}</span>
                <div>
                  <strong>{c.name}</strong>
                  <div className="text-xs">{c.discipline}{c.caregiverEmail ? ` · linked to ${c.caregiverEmail}` : " · no caregiver linked"}</div>
                </div>
              </div>
              <span className="badge">View history →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
