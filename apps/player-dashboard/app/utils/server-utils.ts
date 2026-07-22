/* eslint-disable @typescript-eslint/no-explicit-any */
import { GAME_URL } from "@/lib/config";

export const GAME = GAME_URL;

function getToken(): string {
  try {
    return localStorage.getItem("pixl_token") || "";
  } catch {
    return "";
  }
}

function clearAuth() {
  try {
    localStorage.removeItem("pixl_token");
    localStorage.removeItem("pixl_name");
    localStorage.removeItem("pixl_is_new");
  } catch {}
}

export async function api(path: string) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    throw new Error("unauthorized");
  }

  const url = "/api" + path;
  const res = await fetch(url, {
    headers: { "x-pixl-token": token },
  });

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("unauthorized");
  }
  if (!res.ok) throw new Error("http_" + res.status);
  return res.json();
}

export async function send(method: string, path: string, body?: any) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    throw new Error("unauthorized");
  }

  const url = "/api" + path;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-pixl-token": token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {}

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("unauthorized");
  }

  return { status: res.status, ...(json || {}) };
}

export async function upload(file: BodyInit) {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    throw new Error("unauthorized");
  }

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: {
      "Content-Type": (file as any).type || "image/png",
      "x-pixl-token": token,
    },
    body: file,
  });

  const json = await res.json().catch(() => null);
  if (!json || !json.ok || !json.url) {
    if (json && json.error === "image_rejected")
      throw new Error(
        "That image was rejected: " +
          (json.reason || "inappropriate for Pixl") +
          ".",
      );
    throw new Error((json && json.error) || "upload_failed");
  }
  return json.url;
}
