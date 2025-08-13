import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    has_AUTH_API_BASE_URL: !!process.env.AUTH_API_BASE_URL,
    AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL || null, // ok to show publicly
    AUTH_SIGNUP_PATH: process.env.AUTH_SIGNUP_PATH || "/api/auth/signup",
    AUTH_LOGIN_PATH: process.env.AUTH_LOGIN_PATH || "/api/auth/login",
    AUTH_ME_PATH: process.env.AUTH_ME_PATH || "/api/auth/me",
    has_AUTH_API_KEY: !!process.env.AUTH_API_KEY, // boolean only
  });
}