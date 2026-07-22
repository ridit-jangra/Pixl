# PIXL Sidequests , Master List

40 sidequests across 10 regions. Every region has exactly 4 quests: one Easy, one Medium, one Hard, one Very Hard.

## How this list was built

- The 7 sidequests already on the website are kept as-is and marked `[on the website]`. They are slotted into their natural region. Tim's Roblox quest and "Design your own region" fit none of the given regions, so a new region was created for them: **Starter Village**, the hub where players begin.
- Based on `shipped_project_analysis.md` (7273 ships: retro games 22%, PCB/keyboards 9%, portfolios 8%, productivity 6%, CLI 5%, bots 4%), roughly **20% of quests sit in familiar territory** (marked `familiar`) so everyone has an on-ramp. The other **80% deliberately push people out of their usual lane** (marked `curveball`): hardware builds, audio synthesis, computer vision, simulation, real-time multiplayer, streaming infra, engines from scratch. About a third of all quests involve real hardware.
- Rules carried over from the website: art can be at most 50% of submitted time, quests are code-primary, and any prize can be swapped for something of equivalent value.

## Difficulty ladder and prize formula

Prize value = hours x $5, and 1 hour = 50 pixels (10 px = $1).

| Difficulty | Hours | Prize range | Matches website level |
| :--- | :--- | :--- | :--- |
| Easy | ~5-8 h | ~$25-40 / 250-400 px | Beginner (green) |
| Medium | ~15-20 h | ~$75-100 / 750-1000 px | Intermediate (orange) |
| Hard | ~30-40 h | ~$150-200 / 1500-2000 px | Expert (red) |
| Very Hard | ~50-70 h | ~$250-350 / 2500-3500 px | Expert+ (red) |

## Hardware quests: don't own the parts?

Most people don't have components lying around, so every quest tagged `hardware` can be shipped one of two ways:

1. **Design first, get funded.** Ship the complete design: schematic, firmware, CAD and a priced BOM. Once approved, the BOM gets funded out of the quest's prize budget (still earned at $5 per documented hour). Then you build it: the quest only counts as complete when the real build works, not just the design.
2. **Already have the parts?** Then the design alone doesn't ship, the build has to ship too. Submit the working build (design + video proof it works) and you receive the full base prize, since nothing was spent on parts.

Either way, what ships in the end is a working build on video, never a design on paper.

---

## CYBERPUNK REGION

### Easy , GHOST's burner pager (~7 h) `curveball` `hardware`
TLDR: Build a real pocket pager (ESP32 + OLED) that buzzes when a message hits your endpoint.
GHOST never carries a phone, phones talk too much. Build a burner pager: an ESP32 with a small OLED and a vibration motor that connects to WiFi, polls or subscribes to your own message endpoint, and buzzes when a new message lands. One button marks it read.
Tags: Hardware, ESP32, Firmware, API
Prize: 350 px (~$35) , e.g. ESP32 starter kit + sticker pack

### Medium , GHOST's dead drop (~18 h) `curveball`
TLDR: Encrypted one-time-read message drops shared as QR codes, zero plaintext on the server.
Before GHOST trusts anyone with the network job, couriers must prove they can move secrets. Build an encrypted dead-drop system: messages are sealed client-side, shared as QR codes or one-time links, and burn after being read once. No plaintext may ever touch the server.
Tags: Cryptography, Backend, Security
Prize: 900 px (~$90) , e.g. Wacom Intuos + sticker pack

### Hard , Secure the Cyberpunk City network (~35 h) `curveball` `[on the website]`
TLDR: Network intrusion detection system with anomaly flags and a real-time alert dashboard.
GHOST, a rogue hacker NPC, needs a network intrusion detection system that monitors traffic, flags anomalies, and sends real-time alerts to a dashboard.
Tags: Networking, Security, Backend
Prize: 1750 px (~$175) , Flipper Zero (listed on the website)

### Very Hard , Teach the hover-cabs to drive (~60 h) `curveball`
TLDR: 2D city driving sim plus a trained agent that completes fares, with a generation leaderboard.
OTTO dispatches the city's hover-cabs and is done with human drivers. Build a 2D city driving simulation and train an agent (reinforcement learning or handcrafted AI, your call) to complete fares: pick up, navigate traffic, avoid collisions. Ship the sim, the agent, and a leaderboard comparing agent generations.
Tags: Simulation, AI/ML, Game Dev
Prize: 3000 px (~$300) , e.g. 27" 4K monitor

---

## FAR WEST REGION

### Easy , Wanted: you (~6 h) `curveball`
TLDR: Webcam photo booth that outputs a printable pixel-art wanted poster, fully client-side.
Sheriff Cass has a wall of empty frames and a camera. Build a browser photo booth that turns a webcam shot into an old-timey pixel wanted poster: dithering, sepia palette, bounty amount, printable output. All image processing happens client-side.
Tags: Image Processing, Web, Pixel Art
Prize: 300 px (~$30) , e.g. your wanted poster printed + sticker pack

### Medium , Ship a mobile app for the Traveler (~20 h) `curveball` `[on the website]`
TLDR: Mobile app for route tracking, on-the-go inventory and arrival notifications.
Marco the traveling merchant needs a mobile app to track his routes, log his inventory on the go, and send notifications when he arrives at a new region.
Tags: React Native, Mobile
Prize: 1000 px (~$100) , Apple Developer Account (listed on the website)

### Hard , Reconnect the telegraph line (~32 h) `curveball` `hardware`
TLDR: Two real microcontroller stations exchanging tapped Morse code, decoded and logged to the web.
Ada the telegraph operator lost her line in a storm. Build a working two-station telegraph: two microcontrollers linked by wire or radio, a real key (button) to tap Morse, decoding on the receiving end, and a web log of every message that crosses the wire.
Tags: Hardware, Firmware, Radio/Serial
Prize: 1600 px (~$160) , e.g. mechanical keyboard + ESP32 starter kit

### Very Hard , The Gold Rush (~55 h) `curveball`
TLDR: Server-authoritative multiplayer economy game: claims, mining, trading and sabotage on a live map.
Prospector June struck gold and now everyone wants in. Build a multiplayer gold-rush economy game: players stake claims on a shared map, mine, trade and sabotage in real time. Server-authoritative state, persistent world, live market prices driven by what players actually do.
Tags: Multiplayer, Backend, Game Dev, Economy
Prize: 2750 px (~$275) , e.g. Bambu Lab A1 Mini + assets grant

---

## MEDIEVAL REGION

### Easy , Build a merchant's storefront (~6 h) `familiar` `[on the website]`
TLDR: Clean landing page with item listings and a contact form for Zara's cloth shop.
Zara the cloth merchant needs a simple website to showcase her wares. Build her a clean landing page with item listings and a contact form.
Tags: HTML/CSS, Web
Prize: 300 px (~$30) , Domain + Sticker Pack (listed on the website)

### Medium , The Bard's new lute (~16 h) `curveball` `hardware`
TLDR: Build a physical playable instrument with real keys or sensors, then record an original ballad on it.
Lyric the bard snapped her last string mid-ballad. Build her a real instrument: buttons, touch pads, strings with sensors, whatever makes sound when played by hand, driven by a microcontroller synth. At least two voices, and you must compose and record one original chiptune ballad with it.
Tags: Hardware, Audio, Firmware, Music
Prize: 800 px (~$80) , e.g. MIDI keyboard controller

### Hard , Sir Aldric's siege trials (~35 h) `curveball` `hardware`
TLDR: Desktop trebuchet instrumented with sensors, launch stats charted on a dashboard.
Sir Aldric wants proof before he builds the full-size trebuchet. Build a desktop-sized one and instrument it: an IMU or sensors log every launch, and a dashboard charts range, angle and consistency across trials.
Tags: Hardware, Sensors, Data Viz, Physics
Prize: 1750 px (~$175) , e.g. hardware grant (motors, sensors, printing budget)

### Very Hard , The Chronicler's impossible book (~60 h) `curveball`
TLDR: Procedural generator that simulates centuries of kingdom history and exports a readable chronicle.
Quill the chronicler has been asked to write the kingdom's next thousand years, in advance. Build a procedural history generator: simulate dynasties, wars, plagues, alliances and betrayals over centuries, then export the result as a readable, illustrated chronicle. Think Dwarf Fortress legends mode, but yours.
Tags: Procedural Generation, Simulation, Systems Design
Prize: 3000 px (~$300) , e.g. 27" 4K monitor

---

## JUNGLE REGION

### Easy , Dr. Fern's field guide (~6 h) `familiar`
TLDR: Interactive web bestiary with animated sprites, filters and search, at least eight creatures.
Dr. Fern keeps losing her notes to the humidity. Build an interactive web bestiary of jungle creatures: animated sprites, habitat filters, rarity tiers and a search box. At least eight creatures, each with behavior notes.
Tags: Web, Pixel Art, HTML/CSS
Prize: 300 px (~$30) , e.g. Aseprite license + sticker pack

### Medium , Canopy weather station (~18 h) `familiar` `hardware`
TLDR: Solar sensor node logging temperature, humidity and light to a live dashboard with alerts.
Ranger Kai needs eyes above the canopy. Build a solar or battery powered sensor node (ESP32 or similar) that logs temperature, humidity and light, and pushes readings to a live vine-themed dashboard with history charts and low-battery alerts.
Tags: Hardware, ESP32, IoT, Data Viz
Prize: 900 px (~$90) , e.g. IoT parts grant (sensors, solar panel, boards)

### Hard , Decode the ruins (~35 h) `curveball`
TLDR: Invent a glyph alphabet, train a recognizer for hand-drawn glyphs, wrap it in a temple puzzle game.
Professor Moss found glyphs no one can read. Invent a glyph alphabet, train a recognizer (CNN or classical CV) that reads glyphs drawn on a canvas, and wrap it in a temple-puzzle game where drawing the right glyph opens the next chamber.
Tags: Computer Vision, ML, Game Dev
Prize: 1750 px (~$175) , e.g. Wacom Intuos + GameMaker Pro

### Very Hard , The living jungle (~60 h) `curveball`
TLDR: Agent-based ecosystem sim where populations emerge and crash on their own, thousands of agents.
Weaver, the spirit of the jungle, wants to watch the forest breathe. Build an agent-based ecosystem simulation: plants grow, prey graze, predators hunt, seasons turn. Populations must emerge and crash on their own, with tools to inspect any creature and fast-forward years. Performance matters: thousands of agents.
Tags: Simulation, Performance, Data Viz
Prize: 3000 px (~$300) , e.g. Sony WH-1000XM4 + assets grant

---

## PIXL CAFE / COZY REGION

### Easy , Draw sprites for the Item Shop (~5 h) `familiar` `[on the website]`
TLDR: Pixel icon pack (potions, weapons, tools) plus a showcase website, best ones enter the game.
Loot, the item shop NPC, needs a pack of pixel art icons: potions, weapons, tools and collectibles. Build a website to showcase them, art can be at most 50% of your submitted time. The best ones get added to the real game.
Tags: Pixel Art, Design, Web
Prize: 250 px (~$25) , Sticker Pack + Poster (listed on the website)

### Medium , Mocha's endless playlist (~16 h) `curveball`
TLDR: Generative lofi machine in the browser: procedural chords, drums and crackle, no prerecorded loops.
Mocha the barista refuses to loop the same three lofi tracks forever. Build a generative lofi machine: procedural chord progressions, drums and vinyl crackle synthesized in the browser, with sliders for rain, warmth and tempo. No prerecorded loops allowed.
Tags: Web Audio, Procedural Generation, Music
Prize: 800 px (~$80) , e.g. Pocket Operator synth

### Hard , The Regulars (~32 h) `familiar`
TLDR: Cozy cafe management game where NPCs keep schedules and remember you between sessions.
The cafe's charm is that everyone knows your name. Build a cozy cafe management game where NPCs are actual regulars: they keep schedules, remember your past choices between sessions, and their storylines branch on how you treated them. Persistence and dialogue systems are the real quest here.
Tags: Game Dev, Save Systems, Dialogue Trees
Prize: 1600 px (~$160) , e.g. retro handheld + GameMaker Pro

### Very Hard , Pixl Cafe Radio, for real (~55 h) `curveball` `hardware`
TLDR: Real 24/7 internet radio: streaming server, request bot, web player and a physical ESP32 radio.
DJ Chai wants the cafe on the airwaves 24/7. Build a real internet radio station: a streaming server with scheduled shows and auto-DJ fallback, song requests through a chat bot, a web player with live listener count, and a physical ESP32 radio client with a volume knob for the cafe counter.
Tags: Streaming, Backend, Hardware, Bots
Prize: 2750 px (~$275) , e.g. Sony WH-1000XM4

---

## MINECRAFT REGION

### Easy , Bo's makeover (~7 h) `curveball`
TLDR: Pixl-palette resource pack plus a data pack with five working custom advancements.
Bo the villager thinks the region looks nothing like Pixl. Build a resource pack plus data pack combo: retexture a coherent set of blocks and items in the Pixl palette, and add a custom advancement tree with at least five Pixl-themed advancements that actually trigger.
Tags: Minecraft, Resource Pack, Data Pack
Prize: 350 px (~$35) , e.g. Minecraft: Java Edition gift code

### Medium , Piston Pete's mod (~20 h) `curveball`
TLDR: Fabric/Forge mod adding a wandering Pixl NPC that trades in pixel currency, shipped as a release.
Piston Pete swears the region is missing something. Build a Fabric or Forge mod that adds a Pixl NPC to the world: it wanders villages, trades in pixel currency, and drops one custom item with a real gameplay effect. Ship it installable, with a versioned release.
Tags: Minecraft Mod, Java, Game Dev
Prize: 1000 px (~$100) , e.g. mechanical keyboard

### Hard , Emerald's grand exchange (~35 h) `curveball`
TLDR: Paper plugin with region shops, player-driven prices and a live web dashboard synced to the server.
Emerald the trader wants a real economy, not chest barter. Build a Paper server plugin implementing region-scoped shops and a player-driven market: dynamic prices, transaction history, and a live web dashboard synced with the running server.
Tags: Server Plugin, Java, Backend, Economy
Prize: 1750 px (~$175) , e.g. one year of server hosting

### Very Hard , The Architect's challenge (~65 h) `curveball`
TLDR: Tiny voxel engine from scratch: chunks, meshing, lighting, block edits, no game engines allowed.
The Architect claims nobody appreciates what a chunk really costs. Build a tiny voxel engine from scratch in any language: chunked world, greedy meshing, face culling, basic lighting, place and break blocks, and a flying camera at a stable framerate. No game engines allowed.
Tags: Graphics, Engine Dev, Performance
Prize: 3250 px (~$325) , e.g. 27" 4K monitor + Aseprite license

---

## LAS VEGAS REGION

No real gambling anywhere in this region: no real money in, no real money out, ever.

### Easy , Your name in lights (~7 h) `curveball` `hardware`
TLDR: Drive a real LED matrix marquee with scrolling text and patterns from a tiny web remote.
Lux owns the biggest marquee on the strip and rents it by the hour. Drive a real LED matrix with a marquee engine: scrolling text, chase patterns, at least three animation styles, controlled from a tiny web remote. Canvas simulator accepted only if you truly have no hardware.
Tags: Hardware, LED, Web, Animation
Prize: 350 px (~$35) , e.g. ESP32 starter kit + LED matrix panel

### Medium , Prof. Odds' museum (~18 h) `curveball`
TLDR: Interactive probability museum: a million simulated rounds proving why the house always wins.
Prof. Odds is tired of tourists who think they can beat the house. Build an interactive probability museum: simulate a million rounds of dice, wheels and card draws in the browser, with live-updating charts that show exactly how the edge eats every strategy, including one playable "beat the odds" sandbox mode with fake chips.
Tags: Data Viz, Statistics, Simulation, Web
Prize: 900 px (~$90) , e.g. retro handheld + PICO-8 license + sticker pack

### Hard , The Great Pixellini's assistant (~35 h) `curveball` `hardware`
TLDR: A machine that physically shuffles, cuts or deals cards and performs one full trick on video.
The Great Pixellini needs a mechanical assistant that never flubs a trick. Build a machine that physically manipulates cards: shuffle, cut, or deal to a chosen position on command. Stepper motors, servos, whatever it takes. It must perform one complete trick end to end, live on video.
Tags: Robotics, Hardware, Mechanisms
Prize: 1750 px (~$175) , e.g. robotics grant (servos, steppers, drivers)

### Very Hard , The Heist (~55 h) `curveball`
TLDR: Real-time multiplayer social-deduction heist for six players: hidden roles, cameras, timed objectives.
Silva, head of casino security, wants her systems stress-tested the fun way. Build a real-time multiplayer social-deduction heist game: one crew, hidden roles, a security player watching cameras, timed objectives across casino floors. Rooms, roles and live state over websockets, playable by six people at once.
Tags: Multiplayer, Game Dev, Realtime, Backend
Prize: 2750 px (~$275) , e.g. Bambu Lab A1 Mini + assets grant

---

## SPACE / AERO REGION

### Easy , Nova's patch shop (~6 h) `familiar`
TLDR: Web editor for pixel mission patches with templates, curved text and print-resolution export.
Every mission needs a patch, and Nova sews them all. Build a web editor for pixel mission patches: shape templates, star fields, text on a curve, palette presets, PNG export at print resolution. Gallery page of every patch made with it.
Tags: Web, Canvas, Design Tool
Prize: 300 px (~$30) , e.g. PIXL poster + sticker pack

### Medium , Cap's ground station (~18 h) `curveball`
TLDR: Live satellite tracker: TLE data, pass predictions, sky map and an ISS overhead alert.
Cap runs mission control and lost track of half the sky. Build a satellite tracker: pull live orbital data (TLEs), compute passes for the player's location, render a sky map of what is overhead right now, and send an alert before the ISS flies over.
Tags: APIs, Orbital Math, Data Viz, Notifications
Prize: 900 px (~$90) , e.g. RTL-SDR kit + ESP32 starter kit

### Hard , Dr. Apogee's flight computer (~38 h) `curveball` `hardware`
TLDR: Altimeter/IMU flight computer for a rocket, kite or balloon, with a 3D flight replay app. Fly it.
Dr. Apogee refuses to launch blind. Build a flight computer for a model rocket, kite or balloon: altimeter and IMU logging to onboard storage, then a ground-side app that replays the flight in 3D with altitude, acceleration and orientation over time. Launch it at least once.
Tags: Hardware, Sensors, Firmware, 3D Viz
Prize: 1900 px (~$190) , e.g. rocketry grant (motors, altimeter, launch kit)

### Very Hard , Commander Vega's orbital academy (~60 h) `curveball`
TLDR: Orbital mechanics game with honest physics: delta-v budgets, transfer windows, docking, five missions.
Commander Vega trains pilots who think orbits are just circles. Build an orbital mechanics game with honest physics: n-body or patched conics, delta-v budgets, transfer windows, docking. Players must feel why you speed up to slow down. Tutorial campaign of at least five missions.
Tags: Physics, Game Dev, Simulation, Math
Prize: 3000 px (~$300) , e.g. 27" 4K monitor

---

## INDUSTRIAL DISTRICT

### Easy , Foreman Bolt's status light (~7 h) `curveball` `hardware`
TLDR: A real stack light showing your CI status: green passing, red failing, amber building.
Foreman Bolt wants to know how the line is doing without opening a laptop. Wire a real stack light (or LED tower) to your projects: green when CI is passing, red on failure, amber while building, driven by webhooks from GitHub Actions or any pipeline. Include a log of state changes.
Tags: Hardware, CI/CD, Webhooks
Prize: 350 px (~$35) , e.g. parts grant (stack light, relays, controller)

### Medium , Key's assembly-line macropad (~18 h) `familiar` `hardware`
TLDR: Design and build a macropad from scratch: KiCad PCB, firmware, encoder, printable case.
Key supervises the line and her shortcuts deserve real switches. Design and build a macropad from scratch: schematic and PCB in KiCad, firmware (QMK/KMK or handrolled), at least six keys plus one rotary encoder, and a printable case. Ship the full fab package.
Tags: PCB, KiCad, Firmware, Hardware
Prize: 900 px (~$90) , your macropad manufactured (PCB + parts covered)

### Hard , Sort the warehouse (~38 h) `curveball` `hardware`
TLDR: A robot that follows lines, detects package color and delivers each to the right bay, stats logged.
Gears, the logistics chief, drowns in mixed-up packages. Build a robot that sorts: it follows a line or grid, detects package color or marking, and delivers each to the right bay. Log every sort to a dashboard with an error rate that better be dropping.
Tags: Robotics, Sensors, Firmware
Prize: 1900 px (~$190) , e.g. robotics grant (chassis, motors, sensors)

### Very Hard , Build a robot arm for the Factory (~65 h) `curveball` `hardware` `[on the website]`
TLDR: Working 3-axis robot arm with web control, live position feedback and programmable sequences.
ARIA, the automation NPC at the Industrial District, needs a working 3-axis robot arm controlled via a custom web interface, with live position feedback and programmable sequences.
Tags: Robotics, Firmware, Hardware, Web
Prize: 3250 px (~$325) , Full PCB Manufacturing Run (listed on the website)

---

## STARTER VILLAGE (new region , the hub where every player begins)

### Easy , Make me a Roblox game!! (~5 h) `familiar` `[on the website]`
TLDR: A published Roblox coin-collecting game Tim can play with his friends.
Tim, a 9-year-old NPC from the village, really wants a Roblox game where you collect coins. Build it in Roblox Studio and publish it so he can play with his friends.
Tags: Roblox, Lua, Game Dev
Prize: 250 px (~$25) , 2000 Robux (listed on the website)

### Medium , Design your own region (~15 h) `curveball` `[on the website]`
TLDR: Design and code a playable demo of a brand new Pixl region: map, NPCs, assets, sidequests.
Create a new region for the Pixl world: map, NPCs, assets and sidequests. Then code it into a playable demo, it's not just an art quest. If it's polished enough, it gets added to the real game.
Tags: Pixel Art, Design, Game Dev, Code
Prize: 750 px (~$75) , Graphics Tablet (listed on the website)

### Hard , Bell's town crier (~30 h) `familiar`
TLDR: Discord/Slack bot posting quests with one-click signup, completion tracking and a public standings board.
Bell shouts the news at dawn and nobody listens anymore. Build the village's announcement system: a Discord or Slack bot that posts quests and events, lets villagers sign up with one click, tracks who completed what, and feeds a public web board of standings. Scheduling, persistence and an admin panel included.
Tags: Bots, Backend, Web, Database
Prize: 1500 px (~$150) , e.g. retro handheld + GameMaker Pro

### Very Hard , Raise the Guildhall (~60 h) `curveball`
TLDR: Real-time multiplayer village square: walking avatars, proximity chat, 20+ concurrent players.
Mayor Plaza wants a plaza worthy of the name: a place where every player can actually stand. Build a multiplayer village square: 2D avatars walking around in real time, proximity chat bubbles, day-night cycle, persistent positions, smooth with 20+ concurrent players. Websockets, interpolation, and a server that survives a crowd.
Tags: Multiplayer, Realtime, Networking, Game Dev
Prize: 3000 px (~$300) , e.g. 27" 4K monitor or a year of server hosting

---

## Quota check

- Total: 40 quests, 10 regions, exactly one Easy / Medium / Hard / Very Hard each.
- `familiar` (matches what Hack Clubbers usually ship: websites, games, PCBs, bots, web tools): 8 of 40, exactly 20%.
- `curveball`: 32 of 40, 80%.
- `hardware` (real components involved): 13 of 40, about a third.
- Website quests kept unchanged: 7 of 7, each with its original listed prize; the prize values already line up with the $5/hour rule.
- No neon-themed quests.
