import { NextRequest, NextResponse } from "next/server";
import { SERVER_URL } from "@/lib/config";

export function getToken(request: NextRequest): string | null {
  return request.headers.get("x-pixl-token");
}

export async function proxyGet(
  request: NextRequest,
  serverPath: string,
): Promise<NextResponse> {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const serverUrl = new URL(SERVER_URL + serverPath);

  url.searchParams.forEach((value, key) => {
    serverUrl.searchParams.set(key, value);
  });
  serverUrl.searchParams.set("token", token);

  const res = await fetch(serverUrl.toString());
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}

export async function proxyPost(
  request: NextRequest,
  serverPath: string,
): Promise<NextResponse> {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const serverUrl = new URL(SERVER_URL + serverPath);
  serverUrl.searchParams.set("token", token);

  const contentType = request.headers.get("content-type") || "application/json";

  const res = await fetch(serverUrl.toString(), {
    method: "POST",
    headers: { "content-type": contentType },
    body: await request.arrayBuffer(),
  });

  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}
