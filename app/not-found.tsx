import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow accent" style={{ marginBottom: 12 }}>404 — Page not found</p>
      <h1 className="h1" style={{ marginBottom: 12 }}>This page doesn&apos;t exist.</h1>
      <p className="muted" style={{ marginBottom: 28 }}>
        The link may be outdated, or the page may have moved. Head back to the home page to find what you&apos;re looking for.
      </p>
      <Link href="/" className="btn primary">
        Go to home page
      </Link>
    </main>
  );
}
