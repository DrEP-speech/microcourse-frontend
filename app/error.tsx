"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 32 }}>
      <h1 className="h2" style={{ marginBottom: 8 }}>Something went wrong</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        An unexpected error occurred. If this keeps happening, please contact your beta coordinator.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={reset} className="btn primary">
          Try again
        </button>
        <Link href="/" className="btn secondary">
          Go home
        </Link>
      </div>
      {process.env.NODE_ENV !== "production" && error?.message && (
        <pre
          style={{ marginTop: 24, fontSize: 12, color: "var(--muted)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {error.message}
        </pre>
      )}
    </main>
  );
}
