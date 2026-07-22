import { supabase } from "./db/client.js";

export interface FriendRow {
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
}

export async function rowBetween(
  a: string,
  b: string,
): Promise<FriendRow | null> {
  const { data, error } = await supabase
    .from("friends")
    .select("*")
    .or(
      `and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`,
    )
    .limit(1);
  if (error) {
    console.error("[friends] pair query failed", error);
    return null;
  }
  return ((data ?? [])[0] as FriendRow) ?? null;
}

export async function areFriends(a: string, b: string): Promise<boolean> {
  const row = await rowBetween(a, b);
  return row?.status === "accepted";
}
