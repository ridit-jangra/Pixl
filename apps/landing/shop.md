# PIXL Shop , Inventaire

Conversion : **1 h de travail = 5 $ = 50 pixels** (donc 10 px = 1 $).

Les descriptions affichées sur le site sont dans `app/_components/Shop.tsx` (champ `description` de chaque item). Ce fichier-ci est le récap : si tu modifies une description, fais-le **aux deux endroits** (voir note en bas).

## General Shop (achetable en pixels)

| ID | Nom | Description | Prix (px) | Heures | Valeur ($) | Image |
|---|---|---|---|---|---|---|
| `hc-stickers` | Hack Club Sticker Pack | An envelope of Hack Club and Pixl stickers | 100 | 2 h | ~10 $ | `/shop/hc-stickers.png` |
| `pixel-composer` | Pixel Composer License | Node-based tool to make effects and animations for pixel art. | 100 | 2 h | ~10 $ | `/shop/pixel-composer.png` |
| `blahaj` | 3D Printed Blahaj | A 3D printed pixelated mini Blahaj, made by Ricky and shipped to your house | 100 | 2 h | ~10 $ | `/shop/blahaj.png` |
| `api-credits` | AI Credits ($10) | a $10 grant for AI credits for the provider of your choice. | 100 | 2 h | 10 $ | `/shop/api.png` |
| `assets-grant` | Game Assets Grant ($10) | $10 to spend on tilesets, sprites, music and sounds for your game. | 125 | 2.5 h | 10 $ | `/shop/assets-grant.png` |
| `esp32-kit` | ESP32 Starter Kit | ESP32 dev board with a breadboard and components to start hacking. | 150 | 3 h | ~15 $ | `/shop/esp32.png` |
| `pico8` | PICO-8 License | The fantasy console. Code, draw and compose tiny games in one tool. | 150 | 3 h | 15 $ | `/shop/pico8.png` |
| `pixl-poster` | PIXL Poster | A poster grant to buy nay poster you want. Everyone love posters | 200 | 4 h | ~20 $ | `/shop/poster.png` |
| `aseprite` | Aseprite License | The pixel art editor. Animated sprites, tilesets and more. | 200 | 4 h | ~20 $ | `/shop/aseprite.png` |
| `indie-game` | Indie Game of Your Choice | Hollow Knight, Celeste, Stardew... any indie game up to $30 on Steam. | 200 | 5 h | ≤30 $ | `/shop/indie-game.png` |
| `switch-online` | Nintendo Switch Online (1 year) | 12 months of Nintendo Switch Online for your account. | 200 | 4 h | 20 $ | `/shop/switch-online.png` |
| `tamagotchi-kit` | Pixl Tamagotchi DIY Kit | Solder and code your own pocket pet, designed by mangoman. | 300 | 6 h | ~30 $ | `/shop/tamagotchi.png` |
| `godot-plush` | Godot Plush | The official Godot robot plushie. Emotional support for game jams. | 350 | 7 h | ~30 $ | `/shop/godot-plush.png` |
| `pixl-hoodie` | PIXL Hoodie | Limited PIXL hoodie with the logo on the chest. | 500 | 10 h | ~50 $ | `/shop/hoodie.png` |
| `github-pro` | GitHub Pro (1 year) | A year of GitHub Pro for your projects. | 500 | 10 h | ~50 $ | `/shop/github.png` |
| `retro-handheld` | Retro Handheld (RG35XX / Miyoo Mini+) | A retro handheld to play your builds and the classics on the go. | 600 | 12 h | ~60 $ | `/shop/retro-handheld.png` |
| `wacom-intuos` | Wacom Intuos (Small) | A Wacom drawing tablet, the classic for digital art. | 600 | 12 h | ~60 $ | `/shop/wacom.png` |
| `gamemaker` | GameMaker Pro | GameMaker Professional license to export your games everywhere. | 1000 | 20 h | ~100 $ | `/shop/gamemaker.png` |
| `mechanical-keyboard` | Mechanical Keyboard | A solid mechanical keyboard for late night game jams. | 1000 | 20 h | ~100 $ | `/shop/keyboard.png` |
| `raspberry-pi-5` | Raspberry Pi 5 | A Raspberry Pi 5 to run your servers, emulators and experiments. | 1200 | 24 h | ~120 $ | `/shop/rpi.png` |
| `sony-headphones` | Sony WH-1000XM4 | Noise cancelling headphones to get in the zone. | 2500 | 50 h | ~250 $ | `/shop/sony-headphones.png` |
| `a1-mini` | Bambu Lab A1 Mini | A fast, quiet 3D printer. Print your own game props and cases. | 2500 | 50 h | 249 $ | `/shop/a1-mini.png` |
| `monitor-4k` | 27" 4K Monitor | A 27 inch 4K monitor. Your pixels deserve more pixels. | 3000 | 60 h | ~300 $ | `/shop/monitor-4k.png` |
| `ipad` | iPad (11th gen) | An iPad with pencil support for drawing and playtesting. | 4500 | 90 h | ~450 $ | `/shop/ipad.png` |

## Sidequest Rewards (pas achetables , récompenses de sidequests)

| ID | Nom | Description | Sidequest | Image |
|---|---|---|---|---|
| `domain-stickers` | Domain + Sticker Pack | A domain of your choice for a year, plus a pack of stickers. | Build a merchant's storefront | `/shop/domain.png` |
| `apple-dev` | Apple Developer Account | A year of the Apple Developer Program to ship your app on the App Store. | Ship a mobile app for the Traveler | `/shop/apple-dev.png` |
| `flipper-zero` | Flipper Zero | The legendary hacking multi-tool for pentesting and hardware tinkering. | Secure the Cyberpunk City network | `/shop/flipper.png` |
| `graphics-tablet` | Graphics Tablet | A drawing tablet to sketch, paint and design your pixel art and ship even more to pixl | Design your own region | `/shop/tablet.png` |
| `stickers-poster` | Sticker Pack + Poster | PIXL stickers and a printed poster of your assets for your wall. | Draw sprites for the Item Shop | `/shop/stickers.png` |
| `pcb-run` | Full PCB Manufacturing Run | We manufacture your own PCB design and ship the boards to you. | Build a robot arm for the Factory | `/shop/pcb.png` |
| `robux` | 2000 Robux | 2000 Robux dropped straight into your Roblox account. | Make me a Roblox game!! | `/shop/robux.png` |

Sous la grille du General Shop, le site affiche « ...and even more coming! ».

## Idées de la conversation NON ajoutées (décisions)

- **Arduino Starter Kit** → retiré du site (l'image `/shop/arduino.png` est gardée si tu veux le remettre)

- **Neon stuff** → refusé (« go fuck the neon stuff »)
- **XP-Pen graphics tablet** → refusé (« xp pen are ass »), la Wacom existe déjà
- **Steam grant / itch.io grant** → jugés trop vagues, remplacés par `indie-game` et `assets-grant`
- **Stickers / Pi 5 / iPad** → déjà dans le shop

## Où éditer les descriptions

1. **Website** : `app/_components/Shop.tsx` , chaque item a un champ `description` (les items sont triés par prix croissant dans `generalItems`, et `sidequestRewards` pour les récompenses).
2. **Ce fichier** : `shop.md` , colonne « Description » des tableaux ci-dessus.

Les deux ne sont pas synchronisés automatiquement : édite les deux à la main (cherche l'`id` de l'item pour retrouver la bonne ligne).
