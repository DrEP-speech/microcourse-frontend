"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";

type Client = { _id: string; name: string };

type ChoiceItem = { _id?: string; label: string; icon: string };

type Board = {
  _id: string;
  title: string;
  boardType: string;
  items: ChoiceItem[];
};

export default function CaregiverBoardsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
    setSelectedBoard(null);
    (async () => {
      try {
        const res = await apiGet<{ ok: boolean; items: Board[] }>(`/api/boards?clientId=${selectedClient}`);
        setBoards(res.items || []);
      } catch {
        setBoards([]);
      }
    })();
  }, [selectedClient]);

  async function pickItem(item: ChoiceItem) {
    if (!selectedBoard) return;
    setPickedLabel(item.label);
    setStatusMsg(null);
    try {
      await apiPost("/api/choice-selections", {
        boardId: selectedBoard._id,
        itemLabel: item.label,
        itemIcon: item.icon,
      });
      setStatusMsg(`Picked: ${item.icon} ${item.label}`);
    } catch (e) {
      setStatusMsg(e instanceof ApiError ? e.message : "Couldn't save that pick");
    } finally {
      setTimeout(() => setPickedLabel(null), 400);
    }
  }

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;

  return (
    <main className="page container">
      <section className="hero" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">Choice boards</h1>
        <p className="hero-sub">Tap a card to make a choice. Your provider will see what gets picked.</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {clients.length === 0 && !error && (
        <div className="card"><p className="muted">No clients linked to your account yet.</p></div>
      )}

      {clients.length > 0 && (
        <>
          <div className="stack" style={{ marginBottom: "var(--space-5)" }}>
            <label htmlFor="cb-client">For</label>
            <select id="cb-client" className="input" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {boards.length === 0 ? (
            <div className="card"><p className="muted">No choice boards yet for this client.</p></div>
          ) : (
            <div className="portal-tabs" style={{ marginBottom: "var(--space-6)" }}>
              {boards.map((b) => (
                <button
                  key={b._id}
                  className={`portal-tab${selectedBoard?._id === b._id ? " active" : ""}`}
                  onClick={() => setSelectedBoard(b)}
                >
                  {b.title}
                </button>
              ))}
            </div>
          )}

          {selectedBoard && (
            <>
              <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>{selectedBoard.title}</h2>
              <div className="choice-grid">
                {selectedBoard.items.map((item, idx) => (
                  <button
                    key={item._id || idx}
                    type="button"
                    className={`choice-tile${pickedLabel === item.label ? " picked" : ""}`}
                    onClick={() => pickItem(item)}
                  >
                    <span className="choice-icon" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              {statusMsg && <p className="muted" style={{ marginTop: "var(--space-4)" }}>{statusMsg}</p>}
            </>
          )}
        </>
      )}
    </main>
  );
}
