"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, ApiError } from "@/lib/api";

type Client = { _id: string; name: string };

type Card = {
  type: "info" | "quiz";
  icon: string;
  text: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

type MicroLesson = { _id: string; title: string; topic: string; icon: string; cards: Card[] };
type Assignment = { assignmentId: string; lesson: MicroLesson };

export default function CaregiverLessonsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [active, setActive] = useState<MicroLesson | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const res = await apiGet<{ ok: boolean; items: Assignment[] }>(`/api/client-lessons?clientId=${selectedClient}`);
        setAssignments(res.items || []);
      } catch {
        setAssignments([]);
      }
    })();
  }, [selectedClient]);

  function startLesson(l: MicroLesson) {
    setActive(l);
    setCardIdx(0);
    setSelectedChoice(null);
    setCorrectCount(0);
    setFinished(false);
  }

  function nextCard() {
    if (!active) return;
    setSelectedChoice(null);
    if (cardIdx + 1 >= active.cards.length) {
      finishLesson();
    } else {
      setCardIdx(cardIdx + 1);
    }
  }

  function selectChoice(idx: number, card: Card) {
    if (selectedChoice !== null) return;
    setSelectedChoice(idx);
    if (idx === card.answerIndex) setCorrectCount((c) => c + 1);
  }

  async function finishLesson() {
    setFinished(true);
    if (!active) return;
    const totalQuizCards = active.cards.filter((c) => c.type === "quiz").length;
    try {
      await apiPost("/api/lesson-completions", {
        clientId: selectedClient,
        lessonId: active._id,
        correctCount,
        totalQuizCards,
      });
    } catch {
      // no-op — still show completion to the caregiver
    }
  }

  function exitLesson() {
    setActive(null);
  }

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;

  const card = active && !finished ? active.cards[cardIdx] : null;
  const totalQuizCards = active ? active.cards.filter((c) => c.type === "quiz").length : 0;

  return (
    <main className="page container">
      <section className="hero" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">Microlearning</h1>
        <p className="hero-sub">Short lessons from your provider — swipe through a few cards at a time.</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {clients.length === 0 && !error && (
        <div className="card"><p className="muted">No clients linked to your account yet.</p></div>
      )}

      {clients.length > 0 && !active && (
        <>
          <div className="stack" style={{ marginBottom: "var(--space-6)" }}>
            <label htmlFor="lesson-client">For</label>
            <select id="lesson-client" className="input" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {assignments.length === 0 ? (
            <div className="card"><p className="muted">No lessons assigned yet for this client.</p></div>
          ) : (
            <div className="break-grid">
              {assignments.map((a) => (
                <div className="card glow break-card" key={a.assignmentId}>
                  <span className="break-icon" aria-hidden="true">{a.lesson.icon}</span>
                  <strong>{a.lesson.title}</strong>
                  {a.lesson.topic && <span className="badge">{a.lesson.topic}</span>}
                  <span className="text-xs">{a.lesson.cards.length} card{a.lesson.cards.length === 1 ? "" : "s"}</span>
                  <button className="btn primary" onClick={() => startLesson(a.lesson)}>Start</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {active && !finished && card && (
        <div>
          <div className="lesson-dots">
            {active.cards.map((_, i) => (
              <span key={i} className={`lesson-dot${i === cardIdx ? " active" : i < cardIdx ? " done" : ""}`} />
            ))}
          </div>

          <div className="lesson-card">
            <span className="lesson-card-icon" aria-hidden="true">{card.icon}</span>

            {card.type === "info" ? (
              <>
                <p className="lesson-card-text">{card.text}</p>
                <div className="row" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
                  <button className="btn primary" onClick={nextCard}>Next →</button>
                </div>
              </>
            ) : (
              <>
                <p className="lesson-card-text" style={{ fontWeight: 700 }}>{card.question}</p>
                <div className="lesson-quiz-choices">
                  {card.choices.map((choice, idx) => {
                    let cls = "lesson-quiz-choice";
                    if (selectedChoice !== null) {
                      if (idx === selectedChoice) cls += idx === card.answerIndex ? " selected correct" : " selected incorrect";
                      else if (idx === card.answerIndex) cls += " reveal-correct";
                    }
                    return (
                      <button key={idx} className={cls} disabled={selectedChoice !== null} onClick={() => selectChoice(idx, card)}>
                        {choice}
                      </button>
                    );
                  })}
                </div>
                {selectedChoice !== null && (
                  <div className="row" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
                    <button className="btn primary" onClick={nextCard}>
                      {cardIdx + 1 >= active.cards.length ? "Finish →" : "Next →"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="row" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
            <button className="btn secondary" onClick={exitLesson}>Exit lesson</button>
          </div>
        </div>
      )}

      {active && finished && (
        <div className="card glow lesson-complete-card">
          <span style={{ fontSize: 48, display: "block", marginBottom: "var(--space-3)" }} aria-hidden="true">🎉</span>
          <h2 className="h2 glow-text" style={{ marginBottom: "var(--space-2)" }}>Lesson complete!</h2>
          {totalQuizCards > 0 && (
            <p className="muted" style={{ marginBottom: "var(--space-5)" }}>{correctCount} / {totalQuizCards} quiz questions correct</p>
          )}
          <button className="btn primary" onClick={exitLesson}>Back to lessons</button>
        </div>
      )}
    </main>
  );
}
