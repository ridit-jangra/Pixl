<div align="center">

# Pixl: The Game

**A pixelated multiplayer world where you level up by shipping IRL projects.**

[![Hack Club](https://img.shields.io/badge/Hack%20Club-YSWS-ec3750?style=flat-square)](https://hackclub.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../../LICENSE)

[**Play Now**](https://play.pixl.rsvp) · [RSVP](https://pixl.rsvp) · [Server](../../apps/server)

</div>

---

This is the Godot game client for Pixl. See the [monorepo root](../../README.md) for other apps (server, dashboards, Slack bot).

## About

**Pixl** is a pixel-themed [YSWS](https://hackclub.com) where you explore a retro 2D open world and level up by building real projects. Explore regions like a cyberpunk city, an underwater world, or a gambling zone. Each region has NPCs with sidequests — build apps, websites, or hardware and get paid in Pixels, the in-game currency. Spend them in the shop on prizes and unlock better regions.

- **Shared open world** — explore with other Hack Clubbers in real time
- **Private village** — your own personal space
- **Shop & economy** — spend Pixels on prizes (mainly grants)
- **Custom skins** — draw your own 16×16 pixel avatar
- **In-game chat** — communicate with nearby players
- **Project submissions** — ship projects via the **Pip** NPC
- **Hackatime integration** — coding time is automatically tracked and rewarded

---

## Screenshots

> _More screenshots coming soon, add yours by opening a PR!_

<table>
  <tr>
    <td align="center">
      <img width=400 alt="image" src="https://github.com/user-attachments/assets/4811829c-61fa-42e2-ae8c-030b5627c02f" /><br/>
      <sub><b>private village</b></sub>
    </td>
    <td align="center">
      <img width=400 alt="image" src="https://github.com/user-attachments/assets/7998b7d1-9366-4e16-bb6a-2af67ed38de9" /><br/>
      <sub><b>openworld</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width=400 alt="image" src="https://github.com/user-attachments/assets/b86c3eba-578c-4f1f-9116-6cec3281e087" />
<br/>
      <sub><b>In-Game Shop</b></sub>
    </td>
    <td align="center">
      <img width=400 alt="image" src="https://github.com/user-attachments/assets/f3eba801-37c8-4561-be33-e568c2ea9ecb" /><br/>
      <sub><b>Custom Skin Editor</b></sub>
    </td>
  </tr>
</table>

---

## Features

### Multiplayer World
A real-time top-down world. Explore the shared **open world** with other players in real time, or head to your own **village**.

### Consistency system (for the future ysws, not implemented yet)
The more project you ship, the best merchants you unlock in your village, meaning that they will pay you more !

### Pixel Economy (for the future ysws, not implemented yet)
Earn **Pixels** by shipping projects. Spend them in the shop on prizes. Prices are enforced server-side — no spoofing possible.

### Character Customisation 
Choose from 5 preset character skins, or open the **Skin Editor** to draw a completely custom 16×16 avatar. Your skin is saved to your account and broadcast to all nearby players.

### Project Submissions (YSWS) (for the future ysws, not implemented yet)
Talk to the **Pip** NPC in your village to submit projects with a name, description, repo URL, and demo link. Link your [Hackatime](https://hackatime.hackclub.com/) account to automatically sync coding time to your projects.

---

## Authentication Flow

```
Client
  └─▶ GET /auth/login
        └─▶ Hack Club consent screen
              └─▶ GET /auth/callback  (token exchange + /api/v1/me)
                    └─▶ Redirect to client with #auth=<sessionToken>
                          └─▶ Client stores token in localStorage
                                └─▶ Sent in socket handshake → server/auth.ts validates
```

- Accounts and tokens are stored in the SQLite `accounts` table with a 30-day sliding session expiry.
- Game state (position, pixels) is keyed by Hack Club account ID.
- **One active session per account** — a new login kicks the previous session.

---

## World System

Players exist in exactly one world at a time, identified by a `WorldRef`:

| Kind | Description |
|---|---|
| `openworld` | Shared world for all players |
| `village` | Your own village |
| `house` | Single shared multiplayer interior |

World switches are requested via the `world:enter` socket event. The server validates access and emits `world:state` with the new player list. Walking onto a door tile triggers building entry; a portal tile switches between the open world and your village.

---

## Contributing

See the [monorepo contributing guide](../../README.md#contributing).

---

## License

MIT — see the [monorepo license](../../LICENSE).

---

<div align="center">


[![Hack Club](https://img.shields.io/badge/Hack%20Club-ec3750?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNEg5VjhIMTF2OHptNCAwaC0yVjhoMnY4eiIvPjwvc3ZnPg==)](https://hackclub.com/)

</div>
