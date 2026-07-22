# Pixl internal dashboard

Moderation dashboard for [Pixl](https://pixl.rsvp): review players, projects and
chat/name violations, warn people over Slack, and hand out timed or permanent
bans that the game server enforces.

## Setup

1. `bun install`
2. Apply `PixlServer/drizzle/0006_moderation.sql` to the Supabase project
   (SQL editor) , it adds `violations`, `bans`, `mod_actions` and `users.slack_id`.
3. Create a Slack app at https://api.slack.com/apps:
   - **OAuth & Permissions → Redirect URLs**: `<BASE_URL>/api/auth/callback`
   - **Bot Token Scopes**: `chat:write`, `im:write`
   - Install to the workspace and copy the bot token.
4. `cp .env.example .env` and fill everything in. `ADMIN_SLACK_IDS` is the
   comma-separated list of Slack member IDs allowed in.
5. `bun run dev` → http://localhost:4900

## How the pieces fit

- The game server logs a row in `violations` whenever chat gets censored or a
  display name is rejected, and refuses logins/connections for players with an
  active row in `bans`.
- Warn/ban actions here DM the player through the Slack bot (players' Slack IDs
  are captured from Hack Club auth on their next login) and are recorded in
  `mod_actions`.
- Timed bans expire on their own; permanent bans stay until lifted.
