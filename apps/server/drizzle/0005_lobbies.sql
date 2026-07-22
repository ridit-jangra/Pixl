CREATE TABLE IF NOT EXISTS "lobbies" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "is_public" boolean NOT NULL DEFAULT true,
  "password" text NOT NULL DEFAULT '',
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
