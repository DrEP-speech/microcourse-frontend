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
};

export default function CourseDetailsClient({ courseId }: { courseId: string }) {
  const apiBase = useMemo(() => getApiBase(), []);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
        const lList: Lesson[] =
          Array.isArray(c1?.lessons) ? c1.lessons :
          Array.isArray(c1?.data?.lessons) ? c1.data.lessons :
          [];

        if (alive) {
          setCourse(cObj);
          setLessons(lList);
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
              No lessons included in this response. (That’s fine — we’ll wire a separate lessons route next if needed.)
            </div>
          ) : (
            <ul style={{ marginTop: 10 }}>
              {lessons.map((l) => (
                <li key={l._id || l.id || Math.random()}>
                  {l.title || l.name || "(untitled lesson)"}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}