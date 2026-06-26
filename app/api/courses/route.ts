export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:11001";

export async function GET() {
  const url = new URL("/courses", BASE);
  const r = await fetch(url.toString(), { cache: "no-store" });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
}
