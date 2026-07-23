import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "../lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet(request, "/api/projects");
}

export async function POST(request: NextRequest) {
  return proxyPost(request, "/api/projects");
}
