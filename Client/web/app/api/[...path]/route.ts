import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = path.join("/");
  const url = new URL(request.url);
  const query = url.search;
  const target = `${BACKEND_URL}/api/${backendPath}${query}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  const init: RequestInit = { method: request.method, headers };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(target, init);
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }

  const isAuthEndpoint = backendPath.startsWith("auth/");
  const setCookie = backendRes.headers.get("set-cookie");

  if (isAuthEndpoint && setCookie && setCookie.includes("token=")) {
    try {
      const cookiePair = setCookie.split(";")[0];
      const tokenJson = cookiePair.replace("token=", "");
      const tokens = JSON.parse(tokenJson);
      return NextResponse.json(tokens, { status: backendRes.status });
    } catch {
      // Fall through to normal parsing
    }
  }

  if (
    backendRes.status === 204 ||
    backendRes.headers.get("content-length") === "0"
  ) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await backendRes.text();
  if (!text) return new NextResponse(null, { status: 204 });

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    "response" in data
  ) {
    const envelope = data as {
      success: boolean;
      response: { message: unknown };
    };

    if (!envelope.success) {
      return NextResponse.json(
        { error: envelope.response?.message || "Unknown error" },
        { status: backendRes.status >= 400 ? backendRes.status : 400 }
      );
    }

    return NextResponse.json(envelope.response.message, {
      status: backendRes.status,
    });
  }

  return NextResponse.json(data, { status: backendRes.status });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, ctx);
}
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, ctx);
}
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, ctx);
}
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, ctx);
}
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, ctx);
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
