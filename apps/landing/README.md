# Pixl

Pixl is a pixel-themed YSWS (You Ship, We Ship) run by Gabin, Ridit and Ricky and soon sponsored by Hack Club. Teenagers build real projects (web, mobile, hardware, game dev, pixel art...) to level up a character in a retro 2D world, complete sidequests given by NPCs, and unlock real-world rewards for what they ship.

This repository holds the marketing/landing site: a single-page Next.js app that explains the event, collects RSVPs, and previews the sidequests and shop.

## Tech stack

- Next.js 16 (App Router, React 19, TypeScript)
- Tailwind CSS v4
- Framer Motion for animations and scroll-triggered reveals
- Lenis for smooth scrolling
- Airtable as the RSVP signup store
- Bun as the package manager (see `bun.lock`)

## Project structure

```
app/
  layout.tsx            Root layout: fonts (Geist, Pixelify Sans), metadata, wraps the page in SmoothScroll
  page.tsx               Assembles the page: Menu, Hero, WTFISTHIS, MainContent, FAQ, Footer
  globals.css            Tailwind entry point, custom fonts, pixel text shadow, marquee keyframes
  api/rsvp/route.ts      POST endpoint that stores an email in Airtable
  _components/
    Menu.tsx              Fixed top bar: Hack Club logo + link to the in-dev game
    Hero.tsx              Full-screen intro video, "Pixl" title, RSVP form/state
    SmoothScroll.tsx      Sets up Lenis smooth scrolling for the whole app
    Description.tsx       "What is Pixl?" section, explains the loop with 5 step videos
    MainContent.tsx       Wires Sidequests and the collapsible Shop section together
    Sidequests.tsx        Scrolling marquee of example sidequests and their prizes, by difficulty
    Shop.tsx               Grid of rewards you can redeem with in-game pixels
    FAQ.tsx                Expandable FAQ list
    Footer.tsx             Hack Club blurb, site links, link to contribute on GitHub
public/                  Images, hero/step videos, shop item art
```

## How the RSVP flow works

`Hero.tsx` renders an email input and an RSVP button. On submit it:

1. Validates the email with a simple regex.
2. POSTs `{ email }` to `/api/rsvp`.
3. Stores `pixl-rsvped` in `localStorage` so the form is replaced by an "already in" message on return visits.
4. Opens `https://rsvp.soon.it/pixl` in a new tab.

`app/api/rsvp/route.ts` checks Airtable for an existing record with that email (to avoid duplicates) and creates a new one if none exists.

The Pixo moderation DM feature (ban/warning DMs triggered from the internal dashboard) lives in the [pixorpheus](https://github.com/pixl-ysws/pixorpheus) repo instead of here, since that dashboard already has its own Slack-authenticated backend.

## Environment variables

```
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TOKEN=your_airtable_personal_access_token
```

Put these in a `.env.local` file at the project root (not committed, see `.gitignore`).

## Getting started

Install dependencies and start the dev server:

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site. The page auto-updates as you edit files under `app/`.

Other scripts:

```bash
bun run build   # production build
bun run start   # run the production build
bun run lint    # eslint
```

## Contributing

Want to add something? Open a PR on [GitHub](https://github.com/Pixl-YSWS/pixl). Questions can go in `#pixl-help` on the Hack Club Slack.
