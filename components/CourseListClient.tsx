"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ApiDebugBanner from "@/components/ApiDebugBanner";
import { apiGet } from "@/lib/api";

type Course = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
};

function pickId(c: Course) {
  return c._id || c.id || "";
}

function pickTitle(c: Course) {
  return c.title || c.name || "Untitled course";
}

export default function CourseListClient() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError(null);
      setCourses(null);

      // Try common endpoints (your backend may use one of these)
      const candidates = ["/api/courses", "/courses", "/api/course"];
      let lastErr: any = null;

      for (const path of candidates) {
        try {
          const data = await apiGet(path);
          const list = Array.isArray(data) ? data : (data?.courses || data?.items || []);
          if (!cancelled) setCourses(list);
          return;
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (!cancelled) {
        setError(lastErr?.message || "Failed to load courses");
        setCourses([]);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>Courses</h1>
      <ApiDebugBanner />

      {error && (
        <div style={{ padding: 12, borderRadius: 10, background: "#ffecec", color: "#7a0000", marginBottom: 14 }}>
          <b>API Error:</b> {error}
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
            Backend is up? Try <code>http://localhost:4000/health</code> in the browser.
          </div>
        </div>
      )}

      {!courses && <div>Loading courses…</div>}

      {courses && courses.length === 0 && (
        <div style={{ opacity: 0.8 }}>
          No courses found yet. Seed your DB or create one in the admin tools next.
        </div>
      )}

      {courses && courses.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {courses.map((c, idx) => {
            const id = pickId(c);
            return (
              <div key={id || idx} style={{
                border: "1px solid #e6e6e6",
                borderRadius: 14,
                padding: 14,
                boxShadow: "0 1px 10px rgba(0,0,0,0.04)"
              }}>
                <div style={{ fontSize: 18, fontWeight: 750, marginBottom: 6 }}>{pickTitle(c)}</div>
                <div style={{ fontSize: 13, opacity: 0.75, minHeight: 36 }}>
                  {(c.description || c.summary || "").slice(0, 110) || "No description yet."}
                </div>

                {id ? (
                  <Link href={`/courses/${id}`} style={{
                    display: "inline-block",
                    marginTop: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "#111",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 13
                  }}>
                    Open →
                  </Link>
                ) : (
                  <div style={{ marginTop: 10, fontSize: 12, color: "crimson" }}>
                    Missing course id (_id/id). Check your backend course schema.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}