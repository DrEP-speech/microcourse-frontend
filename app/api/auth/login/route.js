import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const base = process.env.AUTH_API_BASE_URL;
    if (!base) {
      return NextResponse.json({ message: "Missing AUTH_API_BASE_URL in environment" }, { status: 500 });
    }
    const path = process.env.AUTH_LOGIN_PATH || "/api/auth/login";
    const payload = await req.json();

    const upstream = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AUTH_API_KEY ? { "x-api-key": process.env.AUTH_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({ message: data?.message || "Login failed", details: data }, { status: upstream.status });
    }

    const token = data?.token ?? data?.accessToken;
    const res = NextResponse.json({ user: data?.user ?? null }, { status: 200 });
    if (token) {
      res.cookies.set("mc_token", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    }
    return res;
  } catch (err) {
    console.error("Login proxy error:", err);
    return NextResponse.json({ message: "Login proxy error", error: String(err) }, { status: 500 });
  }
}