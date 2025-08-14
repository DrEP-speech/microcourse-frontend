import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Show only booleans / sanitized values so we don't leak secrets
  const env = {
    AUTH_API_BASE_URL: !!process.env.AUTH_API_BASE_URL,
    AUTH_LOGIN_PATH: process.env.AUTH_LOGIN_PATH || "/api/auth/login",
    AUTH_SIGNUP_PATH: process.env.AUTH_SIGNUP_PATH || "/api/auth/signup",
    AUTH_ME_PATH: process.env.AUTH_ME_PATH || "/api/auth/me",
    AUTH_API_KEY_PRESENT: !!process.env.AUTH_API_KEY,
  };
  return NextResponse.json(env, { headers: { "Cache-Control": "no-store" } });
}