import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keys = [
    "AUTH_API_BASE_URL",
    "AUTH_SIGNUP_PATH",
    "AUTH_LOGIN_PATH",
    "AUTH_ME_PATH",
    "AUTH_API_KEY",
  ];

  // Show which envs are present (don’t print secrets)
  const env = Object.fromEntries(
    keys.map((k) => [k, process.env[k] ? (k === "AUTH_API_KEY" ? "<set>" : process.env[k]) : null])
  );

  const base = process.env.AUTH_API_BASE_URL || null;
  const signupPath = process.env.AUTH_SIGNUP_PATH || "/api/auth/signup";
  const loginPath  = process.env.AUTH_LOGIN_PATH  || "/api/auth/login";
  const mePath     = process.env.AUTH_ME_PATH     || "/api/auth/me";

  // Compose sample upstream URLs (null-safe)
  const urls = base
    ? {
        signup: new URL(signupPath, base).toString(),
        login:  new URL(loginPath,  base).toString(),
        me:     new URL(mePath,     base).toString(),
      }
    : null;

  return NextResponse.json({
    ok: true,
    env,
    computed: { signupPath, loginPath, mePath, urls },
  });
}