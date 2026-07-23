"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  niche?: boolean;
};

const generalItems: ShopItem[] = [
  {
    id: "signed-photo",
    name: "Signed Org Photo",
    description: "A signed photo of one of the org members, shipped to your door.",
    price: 80,
    image: "/shop/signed-photo.svg",
    niche: true,
  },
  {
    id: "assets-grant",
    name: "Game Assets Grant",
    description: "A stackable grant to buy tilesets, sprites, music and sounds for your game.",
    price: 120,
    image: "/shop/assets-grant.png",
  },
  {
    id: "hc-stickers",
    name: "Hack Club Sticker Pack",
    description: "An envelope of Hack Club and Pixl stickers.",
    price: 120,
    image: "/shop/hc-stickers.png",
  },
  {
    id: "api-credits",
    name: "AI Credits",
    description: "A grant for AI credits for the provider of your choice.",
    price: 120,
    image: "/shop/api.png",
  },
  {
    id: "mystery-object",
    name: "Random Desk Object",
    description: "A random object from our desks: a PCB, a sticker stash, anything. Comes with a signed letter. Only a few in stock!",
    price: 160,
    image: "/shop/mystery-box.svg",
    niche: true,
  },
  {
    id: "pixel-composer",
    name: "Pixel Composer License",
    description: "VFX compositor for pixel art. Effects and animations for your sprites.",
    price: 200,
    image: "/shop/pixel-composer.png",
  },
  {
    id: "pico8",
    name: "PICO-8 License",
    description: "The fantasy console. Code, draw and compose tiny games in one tool.",
    price: 200,
    image: "/shop/pico8.png",
  },
  {
    id: "pixl-poster",
    name: "PIXL Poster",
    description: "A print grant for the PIXL poster or any poster you want. Everyone loves posters.",
    price: 240,
    image: "/shop/poster.png",
  },
  {
    id: "aseprite",
    name: "Aseprite License",
    description: "The pixel art editor. Animated sprites, tilesets and more.",
    price: 280,
    image: "/shop/aseprite.png",
  },
  {
    id: "tamagotchi-kit",
    name: "Pixl Tamagotchi DIY Kit",
    description: "Solder and code your own pocket pet, designed by mangoman.",
    price: 320,
    image: "/shop/tamagotchi.png",
    niche: true,
  },
  {
    id: "indie-game",
    name: "Indie Game of Your Choice",
    description: "Pick from our selection of cool indie games. Sent as a gift link on Steam or Humble Bundle.",
    price: 320,
    image: "/shop/indie-game.png",
  },
  {
    id: "esp32-kit",
    name: "ESP32 Starter Kit",
    description: "ESP32 dev board with a breadboard and components to start hacking.",
    price: 400,
    image: "/shop/esp32.png",
  },
  {
    id: "godot-plush",
    name: "Godot Plush (Limited Edition)",
    description: "The official Godot robot plushie. Emotional support for game jams.",
    price: 520,
    image: "/shop/godot-plush.png",
  },
  {
    id: "pixl-hoodie",
    name: "PIXL Hoodie",
    description: "Limited PIXL hoodie with the logo on the chest.",
    price: 560,
    image: "/shop/hoodie.png",
  },
  {
    id: "wacom-intuos",
    name: "Wacom Intuos (Small)",
    description: "A Wacom drawing tablet, the classic for digital art.",
    price: 600,
    image: "/shop/wacom.png",
  },
  {
    id: "retro-handheld",
    name: "Retro Handheld (Miyoo Mini+ / RG35XX)",
    description: "A retro handheld to play your builds and the classics on the go.",
    price: 800,
    image: "/shop/retro-handheld.png",
  },
  {
    id: "keyboard-th80",
    name: "Epomaker TH80 V2 Pro",
    description: "Hot-swap mechanical keyboard with a little screen. Add a note to pick your color.",
    price: 800,
    image: "/shop/keyboard-th80.png",
  },
  {
    id: "keyboard-f75",
    name: "Epomaker x Aula F75",
    description: "75% hot-swap mechanical keyboard. Add a note to pick your color.",
    price: 800,
    image: "/shop/keyboard-f75.png",
  },
  {
    id: "gamemaker",
    name: "GameMaker Pro",
    description: "GameMaker Professional license to export your games everywhere.",
    price: 1160,
    image: "/shop/gamemaker.png",
  },
  {
    id: "monitor-grant",
    name: "Monitor Grant (Stackable)",
    description: "A stackable grant towards the monitor of your choice. Your pixels deserve more pixels.",
    price: 1200,
    image: "/shop/monitor-4k.png",
  },
  {
    id: "raspberry-pi-5",
    name: "Raspberry Pi 5",
    description: "A Raspberry Pi 5 (4GB) to run your servers, emulators and experiments. 8GB version for 2520 px.",
    price: 1600,
    image: "/shop/rpi.png",
  },
  {
    id: "a1-mini",
    name: "Bambu Lab A1 Mini",
    description: "A fast, quiet 3D printer. Print your own game props and cases.",
    price: 2680,
    image: "/shop/a1-mini.png",
  },
  {
    id: "sony-xm5",
    name: "Sony WH-1000XM5",
    description: "Noise cancelling headphones to get in the zone.",
    price: 2880,
    image: "/shop/sony-headphones.png",
  },
  {
    id: "ipad",
    name: "iPad (11th gen)",
    description: "An iPad with pencil support for drawing and playtesting.",
    price: 4600,
    image: "/shop/ipad.png",
  },
  {
    id: "airpods-max",
    name: "AirPods Max 2",
    description: "Apple's over-ear noise cancelling headphones. The endgame flex.",
    price: 5160,
    image: "/shop/airpods-max.svg",
  },
];

function ShopCard({ item }: { item: ShopItem }) {
  const accent = item.niche ? "#ec3750" : "#ff8c37";
  return (
    <div
      className="relative flex flex-col border-2 border-black bg-[#fffaf7] w-44 shrink-0"
      style={{ boxShadow: `4px 4px 0px ${accent}` }}
    >
      {item.niche && (
        <img
          src="/pixel_currency_red-removebg-preview.png"
          alt=""
          className="absolute -top-9 -right-9 w-24 h-24 pointer-events-none z-10"
        />
      )}
      <div className="h-32 border-b-2 border-black flex items-center justify-center p-2 bg-white">
        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" loading="lazy" draggable={false} />
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-1 flex-1">
        <p className="font-pixel text-xs leading-snug">{item.name}</p>
        <p className="text-black/60 text-[11px] leading-snug font-sans flex-1">{item.description}</p>
        <span
          className="self-start font-pixel text-[11px] text-white px-2 py-0.5 border-2 border-black mt-1"
          style={{ background: accent, boxShadow: "2px 2px 0px #000" }}
        >
          {item.price} px
        </span>
      </div>
    </div>
  );
}

const MARQUEE_DURATION = 75;

function wrap(value: number, min: number, max: number) {
  const range = max - min;
  return min + (((value - min) % range) + range) % range;
}

function Marquee({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const halfWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartValueRef = useRef(0);

  function startLoop(from: number) {
    animRef.current?.stop();
    animRef.current = animate(x, [from, from - halfWidthRef.current], {
      duration: MARQUEE_DURATION,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
  }

  useEffect(() => {
    if (!trackRef.current) return;
    const halfWidth = trackRef.current.scrollWidth / 2;
    halfWidthRef.current = halfWidth;
    x.set(-halfWidth);
    startLoop(-halfWidth);
    return () => animRef.current?.stop();
  }, [x]);

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartValueRef.current = x.get();
    animRef.current?.stop();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 5) draggedRef.current = true;
    const halfWidth = halfWidthRef.current;
    if (halfWidth) x.set(wrap(dragStartValueRef.current + delta, -halfWidth, 0));
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startLoop(x.get());
  }

  return (
    <div
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
      style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => { if (!draggingRef.current) animRef.current?.pause(); }}
      onMouseLeave={() => { if (!draggingRef.current) animRef.current?.play(); }}
    >
      <motion.div ref={trackRef} className="flex gap-4 pt-9" style={{ x, width: "max-content" }} draggable={false}>
        {children}
      </motion.div>
    </div>
  );
}

export function Shop() {
  return (
    <section className="my-10 md:my-20 px-4 md:px-8 flex flex-col items-center gap-16" id="shop">
      <div className="text-center">
        <motion.p
          className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2 font-sans"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Spend your pixels
        </motion.p>
        <motion.h2
          className="text-5xl md:text-6xl font-black"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          The Shop
        </motion.h2>
        <motion.p
          className="mt-3 text-black/60 text-base md:text-lg max-w-xl mx-auto font-sans"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          1 hour of work = 40 pixels.
        </motion.p>
      </div>

      <Marquee>
        {[...generalItems, ...generalItems].map((item, i) => (
          <ShopCard key={i} item={item} />
        ))}
      </Marquee>

      <motion.p
        className="inline-block font-pixel text-sm md:text-base bg-[#ff8c37] text-white px-5 py-3 border-2 border-black text-center"
        style={{ boxShadow: "4px 4px 0px #000" }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        ...and even more coming!
      </motion.p>
    </section>
  );
}
