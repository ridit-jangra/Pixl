import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
}

// service_role key bypasses RLS — this client must only ever run server-side,
// never ship this key to Godot/any client.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Types matching the table shapes (snake_case, matching Postgres columns) ---
export interface UserRow {
  id: string;
  oauth_provider: string;
  oauth_id: string;
  display_name: string;
  avatar_url: string | null;
  skin: string;
  created_at: string;
}

export interface PlayerStateRow {
  user_id: string;
  scene: string;
  pos_x: number;
  pos_y: number;
  direction: string;
  updated_at: string;
}
