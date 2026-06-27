"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiDel, ApiError } from "@/lib/api";

type Client = { _id: string; name: string };

type ChoiceItem = { _id?: string; label: string; icon: string };

type Board = {
  _id: string;
  title: string;
  boardType: string;
  items: ChoiceItem[];
  createdAt: string;
};

type Selection = {
  _id: string;
  boardId: string;
  itemLabel: string;
  itemIcon: string;
  createdAt: string;
};

const BOARD_TYPES = [
  { value: "choices", label: "Choices" },
  { value: "first-then", label: "First / Then" },
  { value: "feelings", label: "Feelings" },
  { value: "schedule", label: "Schedule" },
];

const EMPTY_ITEM: ChoiceItem = { label: "", icon: "⭐" };

export default function ClientBoardsPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [boardType, setBoardType] = useState("choices");
  const [items, setItems] = useState<ChoiceItem[]>([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [clientRes, boardsRes, selectionsRes] = await Promise.all([
        apiGet<{ ok: boolean; data: Client }>(`/api/clients/${clientId}`),
        apiGet<{ ok: boolean; items: Board[] }>(`/api/boards?clientId=${clientId}`),
        apiGet<{ ok: boolean; items: Selection[] }>(`/api/choice-selections?clientId=${clientId}&limit=20`),
      ]);
      setClient(clientRes.data);
      setBoards(boardsRes.items || []);
      setSelections(selectionsRes.items || []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) loadAll();
  }, [clientId]);

  function updateItem(idx: number, field: "label" | "icon", value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function addItemRow() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItemRow(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function createBoard() {
    const cleanItems = items.filter((it) => it.label.trim());
    if (!title.trim() || cleanItems.length === 0) {
      setFormMsg("Give the board a title and at least one item.");
      return;
    }
    setSaving(true);
    setFormMsg(null);
    try {
      await apiPost("/api/boards", { clientId, title, boardType, items: cleanItems });
      setTitle("");
      setBoardType("choices");
      setItems([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
      setShowForm(false);
      await loadAll();
    } catch (e) {
      setFormMsg(e instanceof ApiError ? e.message : "Failed to create board");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBoard(boardId: string) {
    try {
      await apiDel(`/api/boards/${boardId}`);
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
        <h1 className="h1 glow-text">Choice boards</h1>
        <p className="hero-sub">Build visual choice boards for {client?.name} — first/then, activity choices, feelings, schedules.</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      <div className="row" style={{ marginBottom: "var(--space-6)" }}>
        <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New board"}
        </button>
      </div>

      {showForm && (
        <div className="card glow" style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>New board</h2>
          <div className="formRow">
            <div className="stack">
              <label htmlFor="b-title">Title</label>
              <input id="b-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Snack Choices" />
            </div>
            <div className="stack">
              <label htmlFor="b-type">Type</label>
              <select id="b-type" className="input" value={boardType} onChange={(e) => setBoardType(e.target.value)}>
                {BOARD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <h3 className="h3" style={{ margin: "var(--space-5) 0 var(--space-3)" }}>Items</h3>
          <div className="stack">
            {items.map((it, idx) => (
              <div className="board-item-row" key={idx}>
                <input
                  className="input"
                  value={it.icon}
                  onChange={(e) => updateItem(idx, "icon", e.target.value)}
                  aria-label={`Icon for item ${idx + 1}`}
                  maxLength={4}
                />
                <input
                  className="input"
                  value={it.label}
                  onChange={(e) => updateItem(idx, "label", e.target.value)}
                  placeholder="Item label (e.g. Apple slices)"
                  aria-label={`Label for item ${idx + 1}`}
                />
                <button type="button" className="btn danger" onClick={() => removeItemRow(idx)} aria-label="Remove item">✕</button>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: "var(--space-3)" }}>
            <button type="button" className="btn secondary" onClick={addItemRow}>+ Add item</button>
          </div>

          <div className="row" style={{ marginTop: "var(--space-5)" }}>
            <button className="btn primary" disabled={saving} onClick={createBoard}>
              {saving ? "Saving…" : "Create board"}
            </button>
            {formMsg && <span className="muted">{formMsg}</span>}
          </div>
        </div>
      )}

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Boards</h2>
      {boards.length === 0 ? (
        <div className="card"><p className="muted">No boards yet. Create one above.</p></div>
      ) : (
        <div className="stack" style={{ marginBottom: "var(--space-8)" }}>
          {boards.map((b) => (
            <div className="card board-picker-card" key={b._id}>
              <div>
                <strong>{b.title}</strong>
                <div className="text-xs" style={{ textTransform: "capitalize" }}>{b.boardType} · {b.items.length} item{b.items.length === 1 ? "" : "s"}</div>
              </div>
              <div className="row">
                <span className="text-sm">{b.items.map((it) => it.icon).join(" ")}</span>
                <button className="btn danger" onClick={() => deleteBoard(b._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Recent selections</h2>
      <div className="checkin-list">
        {selections.length === 0 && <p className="muted">No selections logged yet.</p>}
        {selections.map((s) => (
          <div className="checkin-row" key={s._id}>
            <span style={{ fontSize: 20 }} aria-hidden="true">{s.itemIcon}</span>
            <div style={{ flex: 1 }}><strong>{s.itemLabel}</strong></div>
            <span className="text-xs">{new Date(s.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
