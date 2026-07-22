-- Position is now tracked per (user, scene) instead of a single row per user,
-- so the village and open world keep independent positions.
ALTER TABLE "player_state" DROP CONSTRAINT "player_state_pkey";--> statement-breakpoint
ALTER TABLE "player_state" ADD CONSTRAINT "player_state_pkey" PRIMARY KEY("user_id","scene");
