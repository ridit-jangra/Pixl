import { NextRequest } from "next/server";
import { proxyGet } from "../lib/proxy";

export async function GET(request: NextRequest) {
  return proxyGet(request, "/api/projects");
}
