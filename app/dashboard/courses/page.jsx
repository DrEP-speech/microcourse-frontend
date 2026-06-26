"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/http";
import { getToken } from "../../lib/auth";

export default function DashboardCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        // backend should serve GET /courses
        const data = await apiFetch("courses");
        const list = Array.isArray(data) ? data : (data?.courses || []);
        setCourses(list);
      } catch (e) {
        setErr(e?.message || "Failed to load courses");
      }
    })();
  }, [router]);

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 data-testid="courses-heading">Courses</h1>
      {err ? <p data-testid="courses-error" style={{ color: "crimson" }}>{err}</p> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {courses.map((c, idx) => (
          <button
            key={c._id || c.id || idx}
            data-testid={`course-card-${idx}`}
            onClick={() => router.push(`/course/${encodeURIComponent(c._id || c.id)}`)}
            style={{
              textAlign: "left",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #333",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700 }} data-testid={`course-title-${idx}`}>{c.title || c.name || "Untitled Course"}</div>
            <div style={{ opacity: 0.8 }}>{c.description || ""}</div>
          </button>
        ))}
      </div>
    </main>
  );
}