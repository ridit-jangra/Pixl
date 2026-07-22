ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "slack_id" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "violations" (
	"id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bans" (
	"id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"banned_by" text DEFAULT '' NOT NULL,
	"expires_at" timestamptz,
	"lifted_at" timestamptz,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mod_actions" (
	"id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"actor" text DEFAULT '' NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "violations" ADD CONSTRAINT "violations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bans" ADD CONSTRAINT "bans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mod_actions" ADD CONSTRAINT "mod_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "violations_user_idx" ON "violations" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "violations_created_idx" ON "violations" ("created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bans_user_idx" ON "bans" ("user_id");
