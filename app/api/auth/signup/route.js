import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const payload = await req.json();
    const upstream = await fetch(`${process.env.AUTH_API_BASE_URL}/api/auth/signup`, {
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
      return NextResponse.json({ message: data?.message || "Signup failed", details: data }, { status: upstream.status });
    }
    const token = data?.token ?? data?.accessToken;
    const res = NextResponse.json({ user: data?.user ?? null, tokenSet: !!token }, { status: 201 });
    if (token) {
      res.cookies.set("mc_token", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60*60*24*7 });
    }
    return res;
  } catch (err) {
    return NextResponse.json({ message: "Signup proxy error", error: String(err) }, { status: 500 });
  }
}