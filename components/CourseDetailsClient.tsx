"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError, getApiBase } from "@/lib/api";

type Course = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
};

type Lesson = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  courseId?: string;
};

type Quiz = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  courseId?: string;
  lessonId?: string;
};

export default function CourseDetailsClient({ courseId }: { courseId: string }) {
  const apiBase = useMemo(() => getApiBase(), []);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        // Try common patterns. Your backend may be:
        // - GET /api/courses/:id
        // - or GET /api/courses/:id/details
        const c1 = await apiFetch<any>(`/api/courses/${courseId}`);
        const cObj: Course = c1?.course ?? c1?.data ?? c1 ?? null;

        // Lessons might be included or separate
        let lList: Lesson[] =
          Array.isArray(c1?.lessons) ? c1.lessons :
          Array.isArray(c1?.data?.lessons) ? c1.data.lessons :
          [];

        // Lessons live behind their own endpoint, scoped by courseId.
        if (lList.length === 0) {
          try {
            const lRes = await apiFetch<any>(`/api/lessons?courseId=${encodeURIComponent(courseId)}`);
            lList = Array.isArray(lRes?.items) ? lRes.items
              : Array.isArray(lRes?.data) ? lRes.data
              : Array.isArray(lRes) ? lRes
              : [];
          } catch {
            // No lessons route reachable / no lessons yet — leave list empty.
          }
        }

        // Quizzes are listed globally; filter down to this course/its lessons
        // so we can link "Take Quiz" from the right place.
        let qList: Quiz[] = [];
        try {
          const qRes = await apiFetch<any>(`/api/quizzes`);
          const allQuizzes: Quiz[] = Array.isArray(qRes?.data) ? qRes.data
            : Array.isArray(qRes?.items) ? qRes.items
            : Array.isArray(qRes) ? qRes
            : [];
          const lessonIds = new Set(lList.map((l) => String(l._id || l.id)));
          qList = allQuizzes.filter((q) => {
            const qCourseId = q.courseId ? String(q.courseId) : null;
            const qLessonId = q.lessonId ? String(q.lessonId) : null;
            return qCourseId === String(courseId) || (qLessonId && lessonIds.has(qLessonId));
          });
        } catch {
          // Quiz list requires auth; if it fails just show lessons without quiz links.
        }

        if (alive) {
          setCourse(cObj);
          setLessons(lList);
          setQuizzes(qList);
        }
      } catch (e: any) {
        const msg = e instanceof ApiError ? `${e.message} (status ${e.status})` : (e?.message || "Unknown error");
        if (alive) setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, [courseId]);

  function quizForLesson(lessonId?: string): Quiz | undefined {
    if (!lessonId) return undefined;
    return quizzes.find((q) => q.lessonId && String(q.lessonId) === String(lessonId));
  }

  const courseLevelQuizzes = quizzes.filter((q) => !q.lessonId);

  const title = course?.title || course?.name || "Course";

  return (
    <section>
      <div className="spread">
        <Link href="/courses" className="link">← Back to courses</Link>
        <div className="muted" style={{ fontSize: 12 }}>
          API: <span style={{ fontFamily: "monospace" }}>{apiBase}</span>
        </div>
      </div>

      <hr className="hr" />

      {loading && <div className="muted">Loading course…</div>}

      {!loading && err && (
        <div className="alert">
          <div style={{ fontWeight: 700 }}>Failed to load course</div>
          <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", fontSize: 13, marginTop: 6 }}>{err}</div>
        </div>
      )}

      {!loading && !err && (
        <div className="card">
          <h1 className="h1" style={{ margin: 0 }}>{title}</h1>

          {course?.description && (
            <p className="muted" style={{ marginTop: 12 }}>{course.description}</p>
          )}

          <h2 className="h2" style={{ marginTop: 22 }}>Lessons</h2>

          {lessons.length === 0 ? (
            <div className="muted">No lessons published for this course yet.</div>
          ) : (
            <ul style={{ marginTop: 10, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
              {lessons.map((l) => {
                const lessonId = l._id || l.id || "";
                const quiz = quizForLesson(lessonId);
                const isOpen = openLessonId === lessonId;
                return (
                  <li key={lessonId || Math.random()} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                    <div
                      className="spread"
                      style={{ cursor: "pointer" }}
                      onClick={() => setOpenLessonId(isOpen ? null : lessonId)}
                    >
                      <span style={{ fontWeight: isOpen ? 700 : 400 }}>{l.title || l.name || "(untitled lesson)"}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {quiz && (
                          <Link
                            href={`/quiz/${quiz._id || quiz.id}`}
                            className="link"
                            style={{ fontSize: 14 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Take Quiz →
                          </Link>
                        )}
                        <span className="muted" style={{ fontSize: 13 }}>{isOpen ? "Hide answer ▲" : "Show answer ▼"}</span>
                      </span>
                    </div>
                    {isOpen && (
                      <div
                        className="muted"
                        style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                      >
                        {l.description || "No detailed answer available yet for this lesson."}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {courseLevelQuizzes.length > 0 && (
            <>
              <h2 className="h2" style={{ marginTop: 22 }}>Course quiz</h2>
              <ul style={{ marginTop: 10, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
                {courseLevelQuizzes.map((q) => (
                  <li key={q._id || q.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                    <Link href={`/quiz/${q._id || q.id}`} className="link">
                      {q.title || q.name || "Quiz"} →
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}