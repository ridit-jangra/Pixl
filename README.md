<div align="center">

# Pixl

**A pixel-themed YSWS - ship real projects, earn pixels, unlock the world.**

[![Hack Club](https://img.shields.io/badge/Hack%20Club-YSWS-ec3750?style=flat-square)](https://hackclub.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[**pixl.rsvp**](https://pixl.rsvp) · [**play.pixl.rsvp**](https://play.pixl.rsvp)

</div>

---

## What is Pixl?

Centuries ago, **Origin** was the greatest digital civilization ever built - until the Great Static shattered it into islands lost in the Void. Its people crossed universes and found Hack Clubbers, [...]

### How it works

| Step | |
|---|---|
| **01** | **Join the World** - Enter Pixl, create your character and join others in a retro 2D open world |
| **02** | **Explore Regions** - Discover cyberpunk cities, underwater zones, gambling districts, and more |
| **03** | **Complete Sidequests** - NPCs need apps, websites, and hardware. Build them, get paid in Pixels |
| **04** | **Ship & Earn** - Submit projects via the Pip NPC. Real reviewers grade them, real rewards are unlocked |
| **05** | **Spend Pixels** - Use your earnings in the shop on grants, prizes, and access to better regions |

- **Shared open world** - explore with other Hack Clubbers in real time
- **Private village** - your own personal space to build
- **Hackatime integration** - coding time is tracked and rewarded automatically
- **Custom skins** - draw your own 16×16 pixel avatar

---

## Repository Structure

```
Pixl/
├── apps/
│   ├── server/              Bun game server (Express + WebSocket + Drizzle)
│   ├── game/                Godot game client
│   ├── landing/             Next.js landing page (pixl.rsvp)
│   ├── player-dashboard/    Next.js player dashboard
│   ├── internal-dashboard/  Next.js admin/review dashboard
│   └── pixorpheus/          Slack bot (tickets, AI chat, moderation)
├── packages/                Shared packages (types, ui, utils, config)
├── package.json             Monorepo root (Bun workspaces + Turborepo)
└── bun.lock
```

### Apps

| App | Stack | Description |
|---|---|---|
| `server` | Bun, Express, WebSocket, Drizzle, Supabase | Game server - auth, player state, chat, projects, shop, economy |
| `game` | Godot 4 | Game client - the 2D multiplayer world players see |
| `landing` | Next.js 16, Tailwind | Marketing site at [pixl.rsvp](https://pixl.rsvp) |
| `player-dashboard` | Next.js 16, Tailwind | Player-facing dashboard for tracking projects |
| `internal-dashboard` | Next.js 16, Tailwind, shadcn, Supabase | Admin dashboard - review queue, moderation, tickets, stats |
| `pixorpheus` | Node.js, Slack Bolt, Supabase | Slack bot - help tickets, AI chat, slash commands, moderation DMs |

### Packages

Shared libraries used across apps (currently scaffolded):

| Package | Purpose |
|---|---|
| `types` | Shared TypeScript type definitions |
| `ui` | Shared React UI components |
| `utils` | Shared utility functions |
| `config` | Shared ESLint, Tailwind, TypeScript configs |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.com) ≥ 1.3
- [Node.js](https://nodejs.org) ≥ 20 (for pixorpheus)
- [Godot 4](https://godotengine.org/) (for the game client)
- Supabase project (database)

### Install

```bash
bun install
```

### Environment Variables

Each app has its own `.env` (see `.env.example` in each app). At minimum you need:

- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` - shared across all apps
- `SLACK_*` tokens - for pixorpheus and internal-dashboard

### Run

```bash
# Game server
bun run --cwd apps/server dev

# Landing page
bun run --cwd apps/landing dev

# Player dashboard
bun run --cwd apps/player-dashboard dev

# Internal admin dashboard
bun run --cwd apps/internal-dashboard dev

# Slack bot
bun run --cwd apps/pixorpheus start

# Or use Turborepo shortcuts:
bun run dev        # all apps
bun run landing    # @pixl/landing only
bun run internal   # @pixl/internal-dashboard only
bun run player     # @pixl/player-dashboard only
```

### Database Migrations

Drizzle migrations live in `apps/server/drizzle/`. Run them with:

```bash
bun run --cwd apps/server db:migrate
```

---

## Contributing

1. Fork the repository
2. Create a feature branch - `git checkout -b feat/amazing-feature`
3. Commit your changes - `git commit -m 'feat: add amazing feature'`
4. Push - `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## License

MIT
