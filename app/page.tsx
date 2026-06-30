"use client";

import Link from "next/link";
import NextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

/* Load the particle-constellation brain client-only — canvas needs a
   real DOM/devicePixelRatio, so this can't render during SSR. Matches
   the Dala reference: thousands of tiny triangles/circles/diamonds in
   the brand palette clustering into a brain silhouette on void black. */
const ParticleField = NextDynamic(() => import("@/components/ParticleField"), { ssr: false });

const features = [
  {
    kicker: "Lessons",
    title: "Short.\nFocused.\nDone.",
    body: "Every course is broken into micro-lessons you can finish on a lunch break — no marathon sessions required.",
  },
  {
    kicker: "Quizzes",
    title: "Instant feedback.",
    body: "Real questions with instant scoring and pass/fail results. You know exactly where you stand.",
  },
  {
    kicker: "Progress",
    title: "Track everything.",
    body: "Your dashboard surfaces what you've completed, what's next, and how far you've come.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="hero container"
        aria-labelledby="hero-heading"
        style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}
      >
        <div className="hero-text">
          <p className="eyebrow accent" style={{ marginBottom: 18 }}>
            LEXIMIND ACADEMY — LEARN IN BURSTS
          </p>

          <h1 id="hero-heading" className="h1">
            Knowledge
            <br />
            <span style={{ color: "var(--color-plum-voltage)" }}>compounds.</span>
            <br />
            Start small.
          </h1>

          <p className="hero-sub">
            LexiMind Academy breaks any subject into focused microcourses and
            instant quizzes so you make real progress without blocking
            out hours you don&apos;t have.
          </p>

          <div className="cta-row">
            <Link className="btn primary" href="/register" style={{ minWidth: 160 }}>
              Get started free
            </Link>
            <Link className="btn secondary" href="/academy">
              Explore Academy
            </Link>
          </div>
        </div>

        <ParticleField shape="brain" count={5200} />
      </section>

      {/* ── Features ── */}
      <section
        className="container"
        style={{ paddingBottom: "var(--space-10)" }}
        aria-label="Key features"
      >
        {/* hairline divider */}
        <div className="hr" style={{ marginBottom: "var(--space-6)" }} />

        <div className="grid grid-3" style={{ gap: 15 }}>
          {features.map(({ kicker, title, body }) => (
            <div key={kicker} className="card" style={{ padding: "30px 28px" }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>{kicker}</p>
              <h2
                className="h2"
                style={{
                  whiteSpace: "pre-line",
                  fontSize: "var(--text-heading-sm)",
                  marginBottom: 14,
                  fontWeight: "var(--weight-semibold)",
                  letterSpacing: "0.021em",
                  lineHeight: 1.25,
                }}
              >
                {title}
              </h2>
              <p style={{ color: "var(--color-ash)", fontSize: "var(--text-body)", lineHeight: 1.65, letterSpacing: "0.025em" }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          style={{
            marginTop: "var(--space-6)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-pill)",
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Ready to begin?</p>
            <p style={{ color: "var(--color-ash)", fontSize: "var(--text-body)", letterSpacing: "0.025em" }}>
              Create a free account and start your first micro-lesson today.
            </p>
          </div>
          <Link className="btn primary" href="/register">
            Create free account
          </Link>
        </div>
      </section>
    </>
  );
}
