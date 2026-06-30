import Link from "next/link";

export const metadata = {
  title: "LexiMind Academy",
  description:
    "Professional learning, CEU-ready education, certification pathways, and clinical growth tools for therapy providers.",
};

const learnTracks = [
  "Speech Therapy",
  "Occupational Therapy",
  "Physical Therapy",
  "Behavioral Health",
  "Psychology",
  "Documentation & Compliance",
  "Business Growth",
  "Leadership & Operations",
];

const formats = [
  { title: "MicroCourses", body: "Short, focused lessons you can finish in a single sitting." },
  { title: "Full Courses", body: "Deeper, multi-module courses for complete topic mastery." },
  { title: "CEU Pathways", body: "Continuing education credit, tracked and certificate-ready." },
  { title: "Certification Tracks", body: "Structured pathways that build toward a credential." },
  { title: "Clinical Toolkits", body: "Practical templates and tools for day-to-day practice." },
  { title: "Provider Onboarding Modules", body: "Get new providers up to speed, fast." },
  { title: "Leadership Modules", body: "Operations and people-management training for leads." },
];

export default function AcademyPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section
        className="hero container"
        aria-labelledby="academy-heading"
        style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}
      >
        <div className="hero-text">
          <p className="eyebrow accent" style={{ marginBottom: 18 }}>
            LEXIMIND ACADEMY
          </p>

          <h1 id="academy-heading" className="h1">
            LexiMind Academy
          </h1>

          <p className="hero-sub">
            Professional learning, CEU-ready education, certification pathways, and clinical
            growth tools for therapy providers.
          </p>

          <div className="cta-row">
            <Link className="btn primary" href="/register" style={{ minWidth: 160 }}>
              Start Learning
            </Link>
            <Link className="btn secondary" href="/courses">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── What You Can Learn ── */}
      <section className="container" style={{ paddingBottom: "var(--space-8)" }} aria-label="What you can learn">
        <p className="eyebrow" style={{ marginBottom: 8 }}>What You Can Learn</p>
        <h2 className="h2" style={{ marginBottom: "var(--space-5)" }}>
          Disciplines and skills, covered in depth.
        </h2>
        <div className="grid grid-3" style={{ gap: 15 }}>
          {learnTracks.map((track) => (
            <div key={track} className="card" style={{ padding: "22px 24px" }}>
              <strong>{track}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ── Learning Formats ── */}
      <section className="container" style={{ paddingBottom: "var(--space-8)" }} aria-label="Learning formats">
        <p className="eyebrow" style={{ marginBottom: 8 }}>Learning Formats</p>
        <h2 className="h2" style={{ marginBottom: "var(--space-5)" }}>
          Learn the way that fits your schedule.
        </h2>
        <div className="grid grid-3" style={{ gap: 15 }}>
          {formats.map(({ title, body }) => (
            <div key={title} className="card" style={{ padding: "26px 24px" }}>
              <h3 style={{ marginBottom: 8, fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)" }}>
                {title}
              </h3>
              <p style={{ color: "var(--color-ash)", fontSize: "var(--text-body-sm)", lineHeight: 1.6 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Course ── */}
      <section className="container" style={{ paddingBottom: "var(--space-8)" }} aria-label="Featured course">
        <p className="eyebrow" style={{ marginBottom: 8 }}>Featured Course</p>
        <div
          className="card glow"
          style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 12 }}
        >
          <span className="badge active" style={{ alignSelf: "flex-start" }}>Flagship course</span>
          <h2 className="h2" style={{ margin: 0 }}>Rehab Revenue Engine</h2>
          <p style={{ color: "var(--color-ash)", fontSize: "var(--text-body)", lineHeight: 1.65 }}>
            Rehab Revenue Engine helps rehabilitation professionals understand documentation,
            reimbursement, clinical operations, payer behavior, and revenue integrity across SNF,
            LTACH, ARU, outpatient, and private-pay settings.
          </p>
          <div>
            <Link className="btn primary" href="/courses">
              View in catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marketplace Connection ── */}
      <section className="container" style={{ paddingBottom: "var(--space-10)" }} aria-label="LexiMind Marketplace connection">
        <div
          style={{
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
            <p className="eyebrow" style={{ marginBottom: 8 }}>Connected to LexiMind Marketplace</p>
            <p style={{ color: "var(--color-ash)", fontSize: "var(--text-body)", letterSpacing: "0.025em", maxWidth: 560 }}>
              Providers can strengthen their LexiMind Marketplace profile by completing learning
              pathways inside LexiMind Academy — every CEU, certification, and toolkit you finish
              here builds the credentials clients and partners see on your Marketplace listing.
            </p>
          </div>
          <Link className="btn primary" href="/register">
            Start Learning
          </Link>
        </div>
      </section>
    </>
  );
}
