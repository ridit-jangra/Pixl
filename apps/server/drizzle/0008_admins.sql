CREATE TABLE IF NOT EXISTS "admins" (
	"slack_id" text PRIMARY KEY,
	"name" text DEFAULT '' NOT NULL,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	"added_by" text DEFAULT '' NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
