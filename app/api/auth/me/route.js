import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = cookies().get("mc_token")?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 401 });

    const base = process.env.AUTH_API_BASE_URL;
    if (!base) {
      return NextResponse.json({ message: "Missing AUTH_API_BASE_URL in environment" }, { status: 500 });
    }
    const path = process.env.AUTH_ME_PATH || "/api/auth/me";

    const upstream = await fetch(`${base}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(process.env.AUTH_API_KEY ? { "x-api-key": process.env.AUTH_API_KEY } : {}),
      },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({ message: data?.message || "Failed to fetch user", details: data }, { status: upstream.status });
    }

    const user = data?.user ?? data;
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("ME proxy error:", err);
    return NextResponse.json({ message: "Me proxy error", error: String(err) }, { status: 500 });
  }
}