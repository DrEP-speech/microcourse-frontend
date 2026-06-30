"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost, ApiError } from "@/lib/api";

type Course = { _id: string; title: string; description: string; ceCredits: number };
type Lesson = { _id: string; title: string; description: string; completed: boolean };
type Quiz = { _id: string; title: string; passed: boolean };
type Completion = { _id: string; certificateNumber: string; ceCredits: number; completedAt: string };

export default function CEUCoursePlayerPage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [readyToComplete, setReadyToComplete] = useState(false);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finishMsg, setFinishMsg] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    try {
      const res = await apiGet<{
        ok: boolean;
        course: Course;
        lessons: Lesson[];
        quizzes: Quiz[];
        readyToComplete: boolean;
        completion: Completion | null;
      }>(`/api/ceu/courses/${courseId}/progress`);
      setCourse(res.course);
      setLessons(res.lessons || []);
      setQuizzes(res.quizzes || []);
      setReadyToComplete(res.readyToComplete);
      setCompletion(res.completion);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) loadProgress();
  }, [courseId, loadProgress]);

  async function toggleLesson(lessonId: string, alreadyDone: boolean) {
    if (alreadyDone) return;
    try {
      await apiPost(`/api/ceu/lessons/${lessonId}/complete`, {});
      await loadProgress();
    } catch {
      // no-op
    }
  }

  async function finishCourse() {
    try {
      const res = await apiPost<{ ok: boolean; item: Completion }>(`/api/ceu/courses/${courseId}/complete`, {});
      setCompletion(res.item);
      setFinishMsg("Course complete! Your certificate is ready.");
    } catch (e) {
      setFinishMsg(e instanceof ApiError ? e.message : "Couldn't finish the course — make sure every lesson and quiz is complete.");
    }
  }

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;
  if (error) return <main className="page container"><div className="alert" role="alert">{error}</div></main>;

  const completedCount = lessons.filter((l) => l.completed).length;
  const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <main className="page container">
      <Link href="/professional/ceu" className="badge" style={{ marginBottom: "var(--space-4)", display: "inline-block" }}>← Back to CEU courses</Link>

      <section className="hero" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">{course?.title}</h1>
        <p className="hero-sub">{course?.description}</p>
      </section>

      <div className="card" style={{ marginBottom: "var(--space-8)" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Lesson progress</strong>
          <span className="text-sm muted">{completedCount} / {lessons.length} complete</span>
        </div>
        <div className="ceu-progress-track">
          <div className="ceu-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Lessons</h2>
      <div className="ceu-lesson-list" style={{ marginBottom: "var(--space-8)" }}>
        {lessons.map((l) => (
          <div className={`ceu-lesson-row${l.completed ? " completed" : ""}`} key={l._id}>
            <button
              className={`ceu-lesson-check${l.completed ? " checked" : ""}`}
              onClick={() => toggleLesson(l._id, l.completed)}
              aria-label={l.completed ? "Lesson completed" : "Mark lesson complete"}
            >
              {l.completed ? "✓" : ""}
            </button>
            <div style={{ flex: 1 }}>
              <strong>{l.title}</strong>
              <p className="text-sm muted" style={{ marginTop: 4 }}>{l.description}</p>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length > 0 && (
        <>
          <h2 className="h2" style={{ marginBottom: "var(--space-4)" }}>Quiz</h2>
          <div className="stack" style={{ marginBottom: "var(--space-8)" }}>
            {quizzes.map((q) => (
              <div className={`ceu-quiz-row${q.passed ? " passed" : ""}`} key={q._id}>
                <span><strong>{q.title}</strong> {q.passed && <span className="text-sm" style={{ color: "var(--glow-teal)" }}>· Passed</span>}</span>
                <Link className="btn secondary" href={`/quiz/${q._id}`}>{q.passed ? "Review quiz →" : "Take quiz →"}</Link>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card glow-amber" style={{ textAlign: "center" }}>
        {completion ? (
          <div className="cert-card" style={{ border: "none", boxShadow: "none", background: "transparent", padding: 0 }}>
            <p style={{ marginBottom: "var(--space-3)" }}>🎓 Certificate earned — {completion.ceCredits} CE credit{completion.ceCredits === 1 ? "" : "s"}</p>
            <Link className="btn primary" href="/professional/ceu/certificates">View my certificates →</Link>
          </div>
        ) : (
          <>
            <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
              {readyToComplete
                ? "All lessons and quizzes are complete — finish the course to earn your certificate."
                : "Complete every lesson and pass the quiz to unlock your CEU certificate."}
            </p>
            <button className="btn primary" disabled={!readyToComplete} onClick={finishCourse}>
              Finish course &amp; get certificate
            </button>
            {finishMsg && <p className="text-sm" style={{ marginTop: "var(--space-3)" }}>{finishMsg}</p>}
          </>
        )}
      </div>
    </main>
  );
}
