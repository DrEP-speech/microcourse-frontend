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
    <section>
      {loading && <div className="muted">Loading courses…</div>}

      {!loading && err && (
        <div className="alert">
          <div style={{ fontWeight: 700 }}>Failed to load courses</div>
          <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", fontSize: 13, marginTop: 6 }}>{err}</div>
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="card muted">No courses available yet.</div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="grid grid-3">
          {items.map((c) => {
            const id = courseId(c);
            return (
              <div key={id || Math.random()} className="card">
                <div className="h2">{courseTitle(c)}</div>
                {c.description && <p className="muted" style={{ marginTop: 8 }}>{c.description}</p>}
                {id ? (
                  <Link href={`/courses/${id}`} className="link" style={{ display: "inline-block", marginTop: 12 }}>
                    View course →
                  </Link>
                ) : (
                  <span className="muted" style={{ display: "block", marginTop: 12 }}>Unavailable</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="muted" style={{ fontSize: 12, marginTop: 20 }}>
        API: <span style={{ fontFamily: "monospace" }}>{apiBase}</span>
      </div>
    </section>
  );
}