"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, apiDel, ApiError } from "@/lib/api";

type Client = { _id: string; name: string };

type Card = { type: "info" | "quiz"; icon: string; text: string; question: string; choices: string[]; answerIndex: number };
type MicroLesson = { _id: string; title: string; topic: string; icon: string; cards: Card[] };
type Assignment = { assignmentId: string; lesson: MicroLesson };

type Completion = {
  _id: string;
  lessonId: MicroLesson | string;
  correctCount: number;
  totalQuizCards: number;
  createdAt: string;
};

export default function ClientLessonsPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [library, setLibrary] = useState<MicroLesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [clientRes, libraryRes, assignedRes, completionsRes] = await Promise.all([
        apiGet<{ ok: boolean; data: Client }>(`/api/clients/${clientId}`),
        apiGet<{ ok: boolean; items: MicroLesson[] }>("/api/micro-lessons"),
        apiGet<{ ok: boolean; items: Assignment[] }>(`/api/client-lessons?clientId=${clientId}`),
        apiGet<{ ok: boolean; items: Completion[] }>(`/api/lesson-completions?clientId=${clientId}&limit=20`),
      ]);
      setClient(clientRes.data);
      setLibrary(libraryRes.items || []);
      setAssignments(assignedRes.items || []);
      setCompletions(completionsRes.items || []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) loadAll();
  }, [clientId]);

  const assignedIds = new Set(assignments.map((a) => a.lesson._id));

  async function assign(lessonId: string) {
    try {
      await apiPost("/api/client-lessons", { clientId, lessonId });
      await loadAll();
    } catch {
      // no-op
    }
  }

  async function unassign(assignmentId: string) {
    try {
      await apiDel(`/api/client-lessons/${assignmentId}`);
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
        <h1 className="h1 glow-text">Microlearning</h1>
        <p className="hero-sub">Assign short, swipe-through learning sequences for {client?.name} from the shared library.</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Assigned ({assignments.length})</h2>
      {assignments.length === 0 ? (
        <div className="card" style={{ marginBottom: "var(--space-8)" }}><p className="muted">No lessons assigned yet — add some from the library below.</p></div>
      ) : (
        <div className="break-grid" style={{ marginBottom: "var(--space-8)" }}>
          {assignments.map((a) => (
            <div className="card glow break-card" key={a.assignmentId}>
              <span className="break-icon" aria-hidden="true">{a.lesson.icon}</span>
              <strong>{a.lesson.title}</strong>
              {a.lesson.topic && <span className="badge">{a.lesson.topic}</span>}
              <span className="text-xs">{a.lesson.cards.length} card{a.lesson.cards.length === 1 ? "" : "s"}</span>
              <button className="btn danger" onClick={() => unassign(a.assignmentId)}>Unassign</button>
            </div>
          ))}
        </div>
      )}

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Lesson library</h2>
      <div className="break-grid" style={{ marginBottom: "var(--space-8)" }}>
        {library.map((l) => (
          <div className="card break-card" key={l._id}>
            <span className="break-icon" aria-hidden="true">{l.icon}</span>
            <strong>{l.title}</strong>
            {l.topic && <span className="badge">{l.topic}</span>}
            <span className="text-xs">{l.cards.length} card{l.cards.length === 1 ? "" : "s"}</span>
            <button
              className="btn primary"
              disabled={assignedIds.has(l._id)}
              onClick={() => assign(l._id)}
            >
              {assignedIds.has(l._id) ? "Assigned" : "Assign"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Recent completions</h2>
      <div className="checkin-list">
        {completions.length === 0 && <p className="muted">No completions logged yet.</p>}
        {completions.map((c) => {
          const l = typeof c.lessonId === "object" ? c.lessonId : null;
          return (
            <div className="checkin-row" key={c._id}>
              <span style={{ fontSize: 20 }} aria-hidden="true">{l?.icon || "📱"}</span>
              <div style={{ flex: 1 }}>
                <strong>{l?.title || "Lesson"}</strong>
                {c.totalQuizCards > 0 && (
                  <span className="muted"> — {c.correctCount}/{c.totalQuizCards} correct</span>
                )}
              </div>
              <span className="text-xs">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
