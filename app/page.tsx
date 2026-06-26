"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: "⚡",
    title: "Bite-sized lessons",
    body: "Each course is broken into short, focused lessons you can finish in minutes — no 4-hour marathon required.",
  },
  {
    icon: "🎯",
    title: "Real quizzes",
    body: "Check your understanding as you go with instant scoring and pass/fail feedback. No faking it.",
  },
  {
    icon: "📈",
    title: "Track your progress",
    body: "Your dashboard keeps tabs on what you've completed and surfaces exactly what's next.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <div
          id="hero-heading"
          className="h1"
          style={{ letterSpacing: "-0.03em" }}
        >
          Learn in small,{" "}
          <span style={{ color: "var(--primary)" }}>focused bursts.</span>
        </div>
        <p className="hero-sub">
          MicroCourse breaks topics into short lessons and quick quizzes, so you
          can make real progress without blocking out hours you don&apos;t have.
        </p>
        <div className="cta-row">
          <Link className="btn primary" href="/register" style={{ minWidth: 148, fontSize: 15 }}>
            Get started free
          </Link>
          <Link className="btn secondary" href="/courses">
            Browse catalog
          </Link>
        </div>
      </section>

      <section
        className="grid grid-3"
        style={{ marginTop: 24 }}
        aria-label="Key features"
      >
        {features.map(({ icon, title, body }) => (
          <div key={title} className="card" style={{ padding: "28px 24px" }}>
            <div
              aria-hidden="true"
              style={{
                fontSize: 28,
                marginBottom: 12,
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "var(--primary-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>
            <div className="h2" style={{ marginBottom: 8 }}>{title}</div>
            <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.65 }}>{body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
