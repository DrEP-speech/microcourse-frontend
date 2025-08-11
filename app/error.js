"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ padding: 24 }}>
        <h1>Something went wrong</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{error?.message}</pre>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
