"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, ApiError } from "@/lib/api";

type CEUCourse = {
  _id: string;
  title: string;
  description: string;
  ceCredits: number;
  targetDisciplines: string[];
  completed: boolean;
};

export default function CEUCataloguePage() {
  const [courses, setCourses] = useState<CEUCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ ok: boolean; items: CEUCourse[] }>("/api/ceu/courses");
        setCourses(res.items || []);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load CEU courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;

  return (
    <main className="page container">
      <div
        role="note"
        style={{ fontSize: 12, padding: "8px 12px", marginBottom: 12, borderRadius: 8, background: "rgba(255,200,0,0.07)", border: "1px solid rgba(255,200,0,0.2)", color: "var(--muted)" }}
      >
        <strong>Beta notice:</strong> CEU certificates issued here are platform completion records only.
        They are not accredited and do not satisfy licensure renewal requirements unless accreditation approval has been confirmed.
      </div>
      <section className="hero" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">CEU courses</h1>
        <p className="hero-sub">Continuing education micro-courses matched to your discipline.</p>
        <div className="row" style={{ justifyContent: "center", marginTop: "var(--space-4)" }}>
          <Link className="btn secondary" href="/professional/ceu/certificates">My certificates →</Link>
        </div>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {courses.length === 0 && !error && (
        <div className="card"><p className="muted">No CEU courses available for your discipline yet.</p></div>
      )}

      <div className="ceu-grid">
        {courses.map((c) => (
          <div className="card glow-amber ceu-card" key={c._id}>
            <div className="ceu-card-head">
              <strong style={{ fontSize: "var(--text-lg)" }}>{c.title}</strong>
              <span className="ceu-credits-pill">{c.ceCredits} CE credit{c.ceCredits === 1 ? "" : "s"}</span>
            </div>
            <p className="text-sm muted">{c.description}</p>
            {c.targetDisciplines && c.targetDisciplines.length > 0 && (
              <div className="ceu-discipline-tags">
                {c.targetDisciplines.map((d) => <span className="badge" key={d}>{d}</span>)}
              </div>
            )}
            {c.completed && <span className="badge" style={{ color: "var(--glow-teal)" }}>✓ Completed</span>}
            <Link className="btn primary" href={`/professional/ceu/${c._id}`}>
              {c.completed ? "Review course →" : "Start course →"}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
