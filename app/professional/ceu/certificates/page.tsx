"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, ApiError } from "@/lib/api";

type Completion = {
  _id: string;
  certificateNumber: string;
  ceCredits: number;
  discipline: string;
  completedAt: string;
  courseId: { _id: string; title: string } | string;
};

export default function MyCertificatesPage() {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ ok: boolean; items: Completion[] }>("/api/ceu/completions");
        setCompletions(res.items || []);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load certificates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="page container"><p className="muted">Loading…</p></main>;

  const totalCredits = completions.reduce((sum, c) => sum + (c.ceCredits || 0), 0);

  return (
    <main className="page container">
      <Link href="/professional/ceu" className="badge" style={{ marginBottom: "var(--space-4)", display: "inline-block" }}>← Back to CEU courses</Link>

      <section className="hero" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}>
        <h1 className="h1 glow-text">My CEU certificates</h1>
        <p className="hero-sub">{completions.length} certificate{completions.length === 1 ? "" : "s"} earned · {totalCredits} total CE credit{totalCredits === 1 ? "" : "s"}</p>
      </section>

      {error && <div className="alert" role="alert">{error}</div>}

      {completions.length === 0 && !error && (
        <div className="card"><p className="muted">No certificates earned yet — finish a CEU course to earn your first one.</p></div>
      )}

      <div className="cert-grid">
        {completions.map((c) => {
          const courseTitle = typeof c.courseId === "object" ? c.courseId.title : "CEU Course";
          return (
            <div className="cert-card" key={c._id}>
              <div className="cert-seal" aria-hidden="true">🎓</div>
              <div className="cert-title">Certificate of Completion</div>
              <div className="cert-course">{courseTitle}</div>
              <div className="cert-meta">
                <span>{c.ceCredits} CE credit{c.ceCredits === 1 ? "" : "s"}</span>
                {c.discipline && <span>{c.discipline}</span>}
                <span>{new Date(c.completedAt).toLocaleDateString()}</span>
              </div>
              <div className="cert-number">{c.certificateNumber}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
