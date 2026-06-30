"use client";

import NextDynamic from "next/dynamic";
import LoginClient from "@/components/LoginClient";

export const dynamic = "force-dynamic";

/* Load canvas client-only (no SSR) */
const CinematicLoginVisual = NextDynamic(() => import("@/components/CinematicLoginVisual"), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <section
      className="hero container"
      aria-labelledby="login-heading"
      style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-6)" }}
    >
      <div className="hero-text">
        <p className="eyebrow accent" style={{ marginBottom: 18 }}>
          LEXIMIND ACADEMY — WELCOME BACK
        </p>

        <h1 id="login-heading" className="h1">
          Sign in.
          <br />
          <span style={{ color: "var(--color-plum-voltage)" }}>Pick up</span>
          <br />
          where you left off.
        </h1>

        <p className="hero-sub">
          Every check-in, choice board, movement break, and course —
          exactly where you left them.
        </p>

        <div style={{ marginTop: "var(--space-5)" }}>
          <LoginClient />
        </div>
      </div>

      <CinematicLoginVisual />
    </section>
  );
}
