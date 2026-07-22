-- Per-user NPC positions. The village is a private per-player room, so each
-- player keeps their villagers roughly where they last saw them.
CREATE TABLE IF NOT EXISTS "npc_state" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "scene" text NOT NULL,
  "npc_id" text NOT NULL,
  "pos_x" real NOT NULL DEFAULT 0,
  "pos_y" real NOT NULL DEFAULT 0,
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id", "scene", "npc_id")
);

CREATE INDEX IF NOT EXISTS "idx_npc_state_user_scene" ON "npc_state"("user_id", "scene");
