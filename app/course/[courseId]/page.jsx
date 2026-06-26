"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/http";
import { getToken } from "../../lib/auth";

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    if (!courseId) return;

    (async () => {
      try {
        const courseData = await apiFetch(`courses/${encodeURIComponent(courseId)}`);
        setCourse(courseData?.data || courseData);

        // Quiz model only stores courseId (a back-reference), not the other
        // way around, so quizzes for this course have to be fetched and
        // filtered client-side rather than read off the course document.
        const quizData = await apiFetch("quizzes");
        const allQuizzes = quizData?.data || quizData?.items || [];
        const list = Array.isArray(allQuizzes) ? allQuizzes : [];
        setQuizzes(list.filter((q) => String(q.courseId) === String(courseId)));
      } catch (e) {
        setErr(e?.message || "Failed to load course");
      }
    })();
  }, [courseId, router]);

  if (err) {
    return (
      <main style={{ maxWidth: 900, margin: "30px auto", padding: 16, fontFamily: "system-ui" }}>
        <h1 data-testid="course-heading">Course</h1>
        <p data-testid="course-error" style={{ color: "crimson" }}>{err}</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main style={{ maxWidth: 900, margin: "30px auto", padding: 16, fontFamily: "system-ui" }}>
        <h1 data-testid="course-heading">Course</h1>
        <p data-testid="course-loading">Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 data-testid="course-heading">{course.title || course.name || "Course"}</h1>
      <p style={{ opacity: 0.85 }}>{course.description || ""}</p>

      <h2 style={{ marginTop: 18 }} data-testid="course-quizzes-heading">Quizzes</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {quizzes.length ? quizzes.map((q, idx) => {
          const id = q._id || q.id || q;
          const title = q.title || q.name || `Quiz ${idx + 1}`;
          return (
            <button
              key={id}
              data-testid={`course-quiz-${idx}`}
              onClick={() => router.push(`/quiz/${encodeURIComponent(id)}`)}
              style={{ padding: 12, borderRadius: 12, border: "1px solid #333", background: "transparent", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ fontWeight: 700 }}>{title}</div>
            </button>
          );
        }) : (
          <div data-testid="course-no-quizzes" style={{ opacity: 0.8 }}>No quizzes found for this course.</div>
        )}
      </div>
    </main>
  );
}