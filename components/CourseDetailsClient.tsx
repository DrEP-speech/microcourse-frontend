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
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <Link href="/courses" style={{ textDecoration: "underline" }}>← Back to Courses</Link>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          API: <span style={{ fontFamily: "monospace" }}>{apiBase}</span>
        </div>
      </div>

      <hr style={{ margin: "14px 0" }} />

      {loading && <div>Loading course…</div>}

      {!loading && err && (
        <div style={{ color: "crimson" }}>
          <div style={{ fontWeight: 700 }}>Failed to load course</div>
          <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{err}</div>
          <div style={{ marginTop: 10, opacity: 0.85 }}>
            Confirm backend route <span style={{ fontFamily: "monospace" }}>/api/courses/{courseId}</span> exists.
          </div>
        </div>
      )}

      {!loading && !err && (
        <>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{title}</h1>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
            courseId: <span style={{ fontFamily: "monospace" }}>{courseId}</span>
          </div>

          {course?.description && (
            <p style={{ marginTop: 12, opacity: 0.9 }}>{course.description}</p>
          )}

          <h2 style={{ marginTop: 18, fontSize: 18, fontWeight: 700 }}>Lessons</h2>

          {lessons.length === 0 ? (
            <div style={{ opacity: 0.75 }}>
              No lessons published for this course yet.
            </div>
          ) : (
            <ul style={{ marginTop: 10, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
              {lessons.map((l) => {
                const lessonId = l._id || l.id;
                const quiz = quizForLesson(lessonId);
                return (
                  <li key={lessonId || Math.random()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #eee", borderRadius: 8, padding: "8px 12px" }}>
                    <span>{l.title || l.name || "(untitled lesson)"}</span>
                    {quiz && (
                      <Link href={`/quiz/${quiz._id || quiz.id}`} style={{ textDecoration: "underline", fontSize: 14 }}>
                        Take Quiz →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {courseLevelQuizzes.length > 0 && (
            <>
              <h2 style={{ marginTop: 18, fontSize: 18, fontWeight: 700 }}>Course Quiz</h2>
              <ul style={{ marginTop: 10, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
                {courseLevelQuizzes.map((q) => (
                  <li key={q._id || q.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: "8px 12px" }}>
                    <Link href={`/quiz/${q._id || q.id}`} style={{ textDecoration: "underline" }}>
                      {q.title || q.name || "Quiz"} →
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}