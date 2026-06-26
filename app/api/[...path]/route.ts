import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RAW_BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

function normalizeBackend(raw: string) {
  let b = raw.trim().replace(/\/+$/, "");
  // If someone set BACKEND_URL=http://localhost:4000/api, strip trailing /api once
  b = b.replace(/\/api$/, "");
  return b;
}

const BACKEND = normalizeBackend(RAW_BACKEND);

async function handler(req: NextRequest) {
  const url = new URL(req.url);

  // Incoming: /api/<anything>
  // Forward to: <BACKEND>/api/<anything>
  const forwardPath = url.pathname.replace(/^\/api/, ""); // => /auth/login, /courses, ...
  const target = `${BACKEND}/api${forwardPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET","HEAD"].includes(req.method) ? undefined : await req.text(),
  };

  const upstream = await fetch(target, init);
  const body = await upstream.text();

  return new NextResponse(body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;