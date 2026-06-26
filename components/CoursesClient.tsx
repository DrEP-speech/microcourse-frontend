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

function courseId(c: Course) {
  return c._id || c.id || "";
}

function courseTitle(c: Course) {
  return c.title || c.name || "(untitled course)";
}

export default function CoursesClient() {
  const apiBase = useMemo(() => getApiBase(), []);
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr(null);

      try {
        // Backends vary; most of your routes use /api/courses
        const data = await apiFetch<any>("/api/courses");

        const list: Course[] =
          Array.isArray(data) ? data :
          Array.isArray(data?.courses) ? data.courses :
          Array.isArray(data?.data) ? data.data :
          [];

        if (alive) setItems(list);
      } catch (e: any) {
        const msg = e instanceof ApiError ? `${e.message} (status ${e.status})` : (e?.message || "Unknown error");
        if (alive) setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, []);

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>API_BASE: <span style={{ fontFamily: "monospace" }}>{apiBase}</span></div>
        <a
          href={`${apiBase}/health`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, textDecoration: "underline" }}
        >
          Open backend /health
        </a>
      </div>

      {loading && <div>Loading courses…</div>}

      {!loading && err && (
        <div style={{ color: "crimson" }}>
          <div style={{ fontWeight: 700 }}>Failed to load courses</div>
          <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{err}</div>
          <div style={{ marginTop: 10, opacity: 0.85 }}>
            Check that the backend has <span style={{ fontFamily: "monospace" }}>/api/courses</span> and CORS allows <span style={{ fontFamily: "monospace" }}>http://localhost:3000</span>.
          </div>
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div style={{ opacity: 0.8 }}>
          No courses returned. Either the DB has none, or the route is returning a different shape.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {items.map((c) => {
            const id = courseId(c);
            return (
              <li key={id || Math.random()} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{courseTitle(c)}</div>
                    {c.description && <div style={{ opacity: 0.8, marginTop: 4 }}>{c.description}</div>}
                    <div style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
                      id: <span style={{ fontFamily: "monospace" }}>{id || "(missing id field)"}</span>
                    </div>
                  </div>

                  {id ? (
                    <Link
                      href={`/courses/${id}`}
                      style={{ alignSelf: "center", textDecoration: "underline", fontWeight: 600 }}
                    >
                      View →
                    </Link>
                  ) : (
                    <span style={{ alignSelf: "center", opacity: 0.6 }}>No id</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}