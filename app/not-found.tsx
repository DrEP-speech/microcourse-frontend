export default function NotFound() {
  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>404</h1>
      <p style={{ opacity: 0.75 }}>
        Build-safe not-found.tsx. If your build passes now, your previous layout/providers had an invalid import/export.
      </p>
    </main>
  );
}

