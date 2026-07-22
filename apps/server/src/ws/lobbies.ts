import { supabase } from "../db/client.js";

export interface Lobby {
  id: string;
  name: string;
  isPublic: boolean;
  password: string;
  capacity: number;
  ownerId: string;
  createdAt: number;
}

export interface LobbyInfo {
  id: string;
  name: string;
  isPublic: boolean;
  count: number;
  capacity: number;
  mine?: boolean;
  password?: string;
}

export const LOBBY_SCENE_PREFIX = "lobby:";
export const LOBBY_CAPACITY = 16;
const MAX_LOBBIES = 200;

export const lobbies = new Map<string, Lobby>();

export function lobbyIdFromScene(scene: string): string | null {
  if (!scene.startsWith(LOBBY_SCENE_PREFIX)) return null;
  const id = scene.slice(LOBBY_SCENE_PREFIX.length);
  return id || null;
}

export function lobbyScene(id: string): string {
  return LOBBY_SCENE_PREFIX + id;
}

export async function loadLobbies() {
  const { data, error } = await supabase.from("lobbies").select("*");
  if (error) {
    console.error("Failed to load lobbies (is the lobbies table migrated?)", error);
    return;
  }
  for (const r of data ?? []) {
    lobbies.set(r.id as string, {
      id: r.id as string,
      name: r.name as string,
      isPublic: !!r.is_public,
      password: (r.password as string) ?? "",
      capacity: LOBBY_CAPACITY,
      ownerId: (r.owner_id as string) ?? "",
      createdAt: Date.parse(r.created_at as string) || Date.now(),
    });
  }
  console.log(`[lobbies] loaded ${lobbies.size} persisted lobbies`);
}

function persistLobby(l: Lobby) {
  if (!l.ownerId) return;
  void supabase
    .from("lobbies")
    .upsert({
      id: l.id,
      name: l.name,
      is_public: l.isPublic,
      password: l.password,
      owner_id: l.ownerId,
      created_at: new Date(l.createdAt).toISOString(),
    })
    .then(({ error }) => {
      if (error) console.error("Failed to persist lobby", error);
    });
}

function gen4DigitPassword(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function genLobbyCode(len = 5): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code: string;
  do {
    code = "";
    for (let i = 0; i < len; i++)
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
  } while (lobbies.has(code));
  return code;
}

export function createLobby(opts: {
  isPublic: boolean;
  name?: string;
  ownerId: string;
}): Lobby | null {
  if (lobbies.size >= MAX_LOBBIES) return null;
  const id = genLobbyCode();
  const name =
    (typeof opts.name === "string" ? opts.name.trim().slice(0, 30) : "") ||
    (opts.isPublic ? `Lobby ${id}` : `Private ${id}`);
  const lobby: Lobby = {
    id,
    name,
    isPublic: opts.isPublic,
    password: opts.isPublic ? "" : gen4DigitPassword(),
    capacity: LOBBY_CAPACITY,
    ownerId: opts.ownerId,
    createdAt: Date.now(),
  };
  lobbies.set(id, lobby);
  persistLobby(lobby);
  return lobby;
}

export function renameLobby(l: Lobby, name: string) {
  const clean = name.trim().slice(0, 30);
  if (clean) l.name = clean;
  persistLobby(l);
}

export function setLobbyVisibility(l: Lobby, isPublic: boolean) {
  l.isPublic = isPublic;
  l.password = isPublic ? "" : l.password || gen4DigitPassword();
  persistLobby(l);
}

export function deleteLobby(id: string) {
  if (!lobbies.delete(id)) return;
  void supabase
    .from("lobbies")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.error("Failed to delete lobby", error);
    });
}

export function lobbyInfoFor(
  l: Lobby,
  count: number,
  userId: string,
): LobbyInfo {
  const info: LobbyInfo = {
    id: l.id,
    name: l.name,
    isPublic: l.isPublic,
    count,
    capacity: l.capacity,
  };
  if (l.ownerId && l.ownerId === userId) {
    info.mine = true;
    if (!l.isPublic) info.password = l.password;
  }
  return info;
}
