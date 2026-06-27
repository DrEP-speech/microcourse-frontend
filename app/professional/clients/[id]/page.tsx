"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, ApiError } from "@/lib/api";

type Client = {
  _id: string;
  name: string;
  discipline: string;
  caregiverEmail?: string;
  notes?: string;
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

const ZONE_LABEL: Record<string, string> = {
  blue: "Blue — low/sad/tired",
  green: "Green — calm/ready",
  yellow: "Yellow — heightened",
  red: "Red — out of control",
};

export default function ClientHistoryPage() {
  const params = useParams();
  const id = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [clientRes, checkinsRes] = await Promise.all([
          apiGet<{ ok: boolean; data: Client }>(`/api/clients/${id}`),
          apiGet<{ ok: boolean; items: CheckIn[] }>(`/api/checkins?clientId=${id}&limit=100`),
        ]);
        setClient(clientRes.data);
        setHistory(checkinsRes.items || []);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load client");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const zoneCounts = history.reduce<Record<string, number>>((acc, h) => {
    acc[h.zone] = (acc[h.zone] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;
  if (error) return <main className="page container"><div className="alert" role="alert">{error}</div></main>;

  return (
    <main className="page container">
      <Link href="/professional" className="badge" style={{ marginBottom: "var(--space-4)", display: "inline-block" }}>← Back to roster</Link>

      <section className="hero" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">{client?.name}</h1>
        <p className="hero-sub">{client?.discipline} · {history.length} check-in{history.length === 1 ? "" : "s"} recorded</p>
        <div className="row" style={{ justifyContent: "center", marginTop: "var(--space-4)" }}>
          <Link className="btn primary" href={`/professional/clients/${id}/boards`}>Choice boards →</Link>
          <Link className="btn secondary" href={`/professional/clients/${id}/breaks`}>Movement breaks →</Link>
          <Link className="btn secondary" href={`/professional/clients/${id}/lessons`}>Microlearning →</Link>
        </div>
      </section>

      <div className="grid grid-3" style={{ marginBottom: "var(--space-8)" }}>
        {(["blue", "green", "yellow", "red"] as const).map((z) => (
          <div key={z} className="card" style={{ textAlign: "center" }}>
            <span className={`checkin-zone-chip ${z}`} style={{ display: "inline-block", marginBottom: 8 }} aria-hidden="true" />
            <div className="h2">{zoneCounts[z] || 0}</div>
            <div className="text-xs" style={{ textTransform: "capitalize" }}>{z} zone</div>
          </div>
        ))}
      </div>

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Check-in history</h2>
      <div className="checkin-list">
        {history.length === 0 && <p className="muted">No check-ins recorded yet for this client.</p>}
        {history.map((h) => (
          <div className="checkin-row" key={h._id}>
            <span className={`checkin-zone-chip ${h.zone}`} aria-hidden="true" />
            <div style={{ flex: 1 }}>
              <strong>{ZONE_LABEL[h.zone]}</strong>
              {h.label && <span className="muted"> — {h.label}</span>}
              {h.note && <p className="text-sm" style={{ marginTop: 4 }}>{h.note}</p>}
              <p className="text-xs" style={{ marginTop: 4 }}>
                energy {h.energy.toFixed(2)} · pleasantness {h.pleasantness.toFixed(2)}
              </p>
            </div>
            <span className="text-xs">{new Date(h.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
