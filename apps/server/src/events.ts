import { supabase } from "./db/client.js";

export interface EventRow {
  id: number;
  type: string;
  name: string;
  config: Record<string, unknown>;
  starts_at: string;
  ends_at: string;
}

export async function activeEvents(types?: string[]): Promise<EventRow[]> {
  const now = new Date().toISOString();
  let q = supabase
    .from("events")
    .select("id, type, name, config, starts_at, ends_at")
    .lte("starts_at", now)
    .gt("ends_at", now)
    .is("stopped_at", null);
  if (types && types.length > 0) q = q.in("type", types);
  const { data, error } = await q;
  if (error) {
    console.error("[events] active lookup failed", error.message);
    return [];
  }
  return (data ?? []) as EventRow[];
}

export async function communityGoalProgress(ev: EventRow): Promise<number> {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .gte("shipped_at", ev.starts_at)
    .lt("shipped_at", ev.ends_at)
    .is("archived_at", null)
    .is("banned_at", null);
  if (error) {
    console.error("[events] goal progress failed", error.message);
    return 0;
  }
  return count ?? 0;
}
