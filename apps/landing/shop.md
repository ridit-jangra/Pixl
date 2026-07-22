# PIXL Shop — Inventory

Conversion rate: **1 h of work = $3.5 = 40 pixels**. Shop price (px) = hours × 40.

Dollar values and fulfillment notes are internal reference only — the website shows pixel prices only, no dollar estimates.

The website list lives in `app/_components/Shop.tsx` (`generalItems`, rendered as a marquee carousel like the Sidequests section). This file is the recap: if you change an item, update **both places** (see note at the bottom).

## General Shop (buyable with pixels, sorted by price)

| ID | Name | Hours | Price (px) | Internal cost / fulfillment notes | Image |
|---|---|---|---|---|---|
| `signed-photo` | Signed Org Photo | 2 h | 80 | ~$3 shipping + ~$1 photo; envelope near-free if we buy ~20 per member at once | `/shop/signed-photo.svg` (placeholder) |
| `assets-grant` | Game Assets Grant | 3 h | 120 | $10 HCB grant, stackable. Fraudable like every grant but it's about pixels so ok | `/shop/assets-grant.png` |
| `hc-stickers` | Hack Club Sticker Pack | 3 h | 120 | Cheap if HQ stock; new custom stickers = big order (up to $500). Envelope ~$3 worldwide, ~$10 per pack total | `/shop/hc-stickers.png` |
| `api-credits` | AI Credits | 3 h | 120 | $10 HCB grant, no shipping. Fraudable like every grant | `/shop/api.png` |
| `mystery-object` | Random Desk Object | 4 h | 160 | Object is free (random PCB, stickers — Gabin has a lot). Signed letter included ;) Shipping max ~$10. **Only a few in stock** | `/shop/mystery-box.svg` (placeholder) |
| `pixel-composer` | Pixel Composer License | 5 h | 200 | $15, no shipping, easy to send as gift | `/shop/pixel-composer.png` |
| `pico8` | PICO-8 License | 5 h | 200 | $15, gift code, no fraud, in theme asf | `/shop/pico8.png` |
| `pixl-poster` | PIXL Poster | 6 h | 240 | ~$20 grant (general poster or print grant at a local shop). Design by Ricky or community bounty? **//not sure** | `/shop/poster.png` |
| `aseprite` | Aseprite License | 7 h | 280 | $22, no shipping, easy gift. High hacker value | `/shop/aseprite.png` |
| `tamagotchi-kit` | Pixl Tamagotchi DIY Kit | 8 h | 320 | Parts ~$30 (PCB + screen + components via JLC, cheaper in batch on LCSC/JLCPCB) + reshipping ~$10 ≈ $40. Huge in-house hacker value. **Waiting on mangoman for exact price/hours** | `/shop/tamagotchi.png` |
| `indie-game` | Indie Game of Your Choice | 8 h | 320 | Selection from the jame gam prize pool ($15–30 games), pay as if $25. Steam gift / Humble Bundle link, no shipping, no fraud | `/shop/indie-game.png` |
| `esp32-kit` | ESP32 Starter Kit | 10 h | 400 | ~$20 AliExpress / ~$30 Amazon US-EU, avg ~$25 + ~$8 shipping ≈ $33 | `/shop/esp32.png` |
| `godot-plush` | Godot Plush (Limited Edition) | 13 h | 520 | ~$30 + ~$10–15 small packet shipping ≈ $45 on Makeship, no reship needed | `/shop/godot-plush.png` |
| `pixl-hoodie` | PIXL Hoodie | 14 h | 560 | Print-on-demand (Printful type): they handle worldwide shipping and sizes, ~$35–45 shipped, global avg ~$50 | `/shop/hoodie.png` |
| `wacom-intuos` | Wacom Intuos (Small) | 15 h | 600 | ~$50–80, varies a lot by region (THE per-region problem item) + ~$10 shipping, global avg ~$50 | `/shop/wacom.png` |
| `retro-handheld` | Retro Handheld (Miyoo Mini+ / RG35XX) | 20 h | 800 | ~$60–70 shipped from AliExpress, ships worldwide cheap (PK, IN, BR no problem) | `/shop/retro-handheld.png` |
| `keyboard-th80` | Epomaker TH80 V2 Pro | 20 h | 800 | $72 Amazon US. Hot-swap, has a screen. Color chosen via order note. **Vote pending: keep this or the F75** | `/shop/keyboard.png` |
| `keyboard-f75` | Epomaker x Aula F75 | 20 h | 800 | $70 Amazon US. 75% hot-swap. Color chosen via order note. **Vote pending: keep this or the TH80** | `/shop/keyboard.png` |
| `gamemaker` | GameMaker Pro | 29 h | 1160 | $99.99 one-time license, key, no shipping, no fraud | `/shop/gamemaker.png` |
| `monitor-grant` | Monitor Grant (Stackable) | 30 h | 1200 | $100 stackable grant. Fraudable | `/shop/monitor-4k.png` |
| `raspberry-pi-5` | Raspberry Pi 5 | 40 h (4GB) / 63 h (8GB) | 1600 (4GB) / 2520 (8GB) | Board $130 (4GB) / $200 (8GB) + shipping ~$10–20. One card on the site, 8GB price mentioned in the description | `/shop/rpi.png` |
| `a1-mini` | Bambu Lab A1 Mini | 67 h | 2680 | $235 Amazon US, sometimes $220 on Bambu Lab site. Order in user's regional store | `/shop/a1-mini.png` |
| `sony-xm5` | Sony WH-1000XM5 | 72 h | 2880 | $250 Amazon US, easily shippable | `/shop/sony-headphones.png` |
| `ipad` | iPad (11th gen) | 115 h | 4600 | $400 US but 509€ EU and more in expensive regions; priced on US $400 | `/shop/ipad.png` |
| `airpods-max` | AirPods Max 2 | 129 h | 5160 | $450 Amazon US, easily shippable | `/shop/airpods-max.svg` (placeholder) |

## Sidequest Rewards (not buyable — earned by completing sidequests)

Shown on the site in the Sidequests section (`Sidequests.tsx`, "min Xh of work" labels), not in the Shop carousel.

| ID | Name | Min hours | Internal cost | Image |
|---|---|---|---|---|
| `domain-stickers` | Domain + Sticker Pack | 7 h | Domain ~$15 as grant, stickers + envelope ~$10 ≈ $25 | `/shop/domain.png` |
| `apple-dev` | Apple Developer Account | 30 h | $99/year flat worldwide, redeemed with code/grant | `/shop/apple-dev.png` |
| `flipper-zero` | Flipper Zero | 55 h | $169 official + ~$15 shipping ≈ $185, ships to most countries | `/shop/flipper.png` |
| `graphics-tablet` | Graphics Tablet | 20 h | Small tablet ~$60–80 + ~$10 shipping ≈ $70 | `/shop/tablet.png` |
| `stickers-poster` | Sticker Pack + Poster | 8.5 h | Stickers ~$10 + poster print grant ~$20 ≈ $30 | `/shop/stickers.png` |
| `pcb-run` | Full PCB Manufacturing Run | — | They do a BOM, funded at the normal $3.5/h rate | `/shop/pcb.png` |
| `robux` | 2000 Robux | 7 h | ≈ $25 gift card, digital, no fraud possible | `/shop/robux.png` |

Below the Shop carousel, the site shows "...and even more coming!".

## Removed vs previous shop

- **3D Printed Blahaj** → now the trophy, not in shop (think about printing legion — image `/shop/blahaj.png` kept)
- **Nintendo Switch Online (1 year)** → dropped from the new list (image kept)
- **GitHub Pro (1 year)** → dropped from the new list (image kept)
- **Sony WH-1000XM4** → replaced by the XM5
- **Generic Mechanical Keyboard** → replaced by the two Epomaker options (vote pending)
- **27" 4K Monitor** → replaced by the stackable monitor grant
- **Arduino Starter Kit** → removed earlier (image `/shop/arduino.png` kept)

## Placeholder images to replace

`signed-photo.svg`, `mystery-box.svg` and `airpods-max.svg` are quick pixel-art SVG placeholders — swap them for real PNGs when available.

## Where to edit items

1. **Website**: `app/_components/Shop.tsx` — each item in `generalItems` has `id`, `name`, `description`, `price` (pixels) and `image`. Items are sorted by ascending price.
2. **This file**: `shop.md` — the tables above.

The two are not synced automatically: edit both by hand (search for the item's `id` to find the right row).
