"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocale } from "./LocaleProvider";
import { config } from "../_generated/config";

const ITEM_IMAGES = [
  "/shop/signed-photo.png",
  "/shop/meme-pack.png",
  "/shop/assets-grant.png",
  "/shop/hc-stickers.png",
  "/shop/api.png",
  "/shop/music-grant.png",
  "/shop/soldering-grant.png",
  "/shop/hardware-grant.png",
  "/shop/domain-grant.png",
  "/shop/hosting-grant.png",
  "/shop/mystery-box.png",
  "/shop/art-grant.png",
  "/shop/cookie-cutter.png",
  "/shop/soldering-iron.png",
  "/shop/food-grant.png",
  "/shop/pixel-composer.png",
  "/shop/pico8.png",
  "/shop/poster.png",
  "/shop/aseprite.png",
  "/shop/google-play.png",
  "/shop/tamagotchi.png",
  "/shop/indie-game.png",
  "/shop/screwdriver.png",
  "/shop/esp32.png",
  "/shop/furycube.png",
  "/shop/godot-plush.png",
  "/shop/hoodie.png",
  "/shop/blahaj.png",
  "/shop/cpu-grant.png",
  "/shop/gpu-grant.png",
  "/shop/ram-grant.png",
  "/shop/wacom.png",
  "/shop/retro-handheld.png",
  "/shop/keyboard-s75-pro.png",
  "/shop/gamemaker.png",
  "/shop/steam-license.png",
  "/shop/apple-dev.png",
  "/shop/monitor-4k.png",
  "/shop/pencil-pro.png",
  "/shop/rpi.png",
  "/shop/sony-ch720n.png",
  "/shop/ender3-v3.png",
  "/shop/airpods-pro-3.png",
  "/shop/a1-mini.png",
  "/shop/samsung-t7-ssd.png",
  "/shop/sony-headphones.png",
  "/shop/sparkx-i7.png",
  "/shop/bambu-a1.png",
  "/shop/centauri-carbon.png",
  "/shop/ipad.png",
  "/shop/bambu-a1-combo.png",
  "/shop/samsung-s24.png",
  "/shop/airpods-max.png",
  "/shop/nothing-phone.png",
  "/shop/macbook-neo.png",
  "/shop/ipad-air-m4.png",
  "/shop/macbook-air.png",
  "/shop/framework-13.png",
  "/shop/framework-16.png",
  "/shop/mac-mini.png",
  "/shop/nintendo-switch-2.png",
];

// Repriced at the payout floor (hours rounded to the nearest 0.5). That floor
// is the worst rate anyone gets - it only climbs from there as shipped
// projects build up Restoration Energy.
const ITEM_PRICES = [
  125, 125, 150, 150, 150, 150, 150, 150, 175, 150, 225, 150, 250, 225, 150, 225, 225, 275, 325, 350, 650, 350, 425, 475, 500, 650, 725, 575, 725, 725, 725, 725, 1000, 1025, 1425, 1425, 1425, 1425, 1850, 2000, 2150, 2725, 2850, 3350, 3275, 3575, 3725, 4275, 5150, 5725, 5725, 5725, 6425, 7150, 10000, 10000, 17150, 17150, 17900, 22425, 7150,
];

const NICHE_INDICES = new Set([0, 1, 10, 12, 18]);

function fmtHours(h: number, lang: string) {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(h);
}

// Spells out both rates every time (not just two bare numbers) so it's clear
// why there are two: hours needed at the payout floor, then hours needed at
// the ceiling you reach once you've built up Restoration Energy. Each locale
// keeps its own currency formatting in the hoursRate template; the rates
// themselves are substituted in from config so they can't drift from the
// server's payout maths.
function hoursRange(price: number, template: string, lang: string) {
  const lo = price / (config.economy.basePayoutUsd / config.economy.pixelValueUsd);
  const hi = (lo * config.economy.basePayoutUsd) / config.economy.maxPayoutUsd;
  return template
    .replace("{lo}", fmtHours(lo, lang))
    .replace("{hi}", fmtHours(hi, lang))
    .replace("{loRate}", fmtRate(config.economy.basePayoutUsd, lang))
    .replace("{hiRate}", fmtRate(config.economy.maxPayoutUsd, lang));
}

function fmtRate(usd: number, lang: string) {
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "USD",
    // narrowSymbol keeps the French form as "3,50 $" rather than "3,50 $US",
    // which is what the hand-written template used to say.
    currencyDisplay: "narrowSymbol",
    // Whole dollars stay whole ("$6"), cents keep their cents ("$3.50").
    minimumFractionDigits: Number.isInteger(usd) ? 0 : 2,
  }).format(usd);
}

function ShopCard({
  item,
  index,
  rateTemplate,
  lang,
}: {
  item: { name: string; description: string };
  index: number;
  rateTemplate: string;
  lang: string;
}) {
  const accent = NICHE_INDICES.has(index) ? "#ec3750" : "#ff8c37";
  const price = ITEM_PRICES[index];
  return (
    <div
      className="relative flex flex-col border-2 border-black bg-[#fffaf7] w-44 shrink-0"
      style={{ boxShadow: `4px 4px 0px ${accent}` }}
    >
      {NICHE_INDICES.has(index) && (
        <img
          src="/pixel_currency_red-removebg-preview.png"
          alt=""
          className="absolute -top-9 -right-9 w-24 h-24 pointer-events-none z-10"
        />
      )}
      <div className="h-32 border-b-2 border-black flex items-center justify-center p-2 bg-white">
        <img
          src={ITEM_IMAGES[index]}
          alt={item.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-1 flex-1">
        <p className="font-pixel text-xs leading-snug">{item.name}</p>
        <p className="text-black/60 text-[11px] leading-snug font-sans flex-1">{item.description}</p>
        <div className="flex flex-col gap-1 mt-1">
          <span
            className="self-start font-pixel text-[11px] text-white px-2 py-0.5 border-2 border-black"
            style={{ background: accent, boxShadow: "2px 2px 0px #000" }}
          >
            {price} px
          </span>
          <span className="text-black/40 text-[9px] leading-snug font-sans">
            {hoursRange(price, rateTemplate, lang)}
          </span>
        </div>
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
  const halfWidthRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartValueRef = useRef(0);

  useEffect(() => {
    if (!trackRef.current) return;
    const halfWidth = trackRef.current.scrollWidth / 2;
    halfWidthRef.current = halfWidth;
    x.set(-halfWidth);

    function tick(ts: number) {
      const dt = lastTsRef.current == null ? 0 : ts - lastTsRef.current;
      lastTsRef.current = ts;
      if (!pausedRef.current && !draggingRef.current && halfWidthRef.current) {
        const speed = halfWidthRef.current / (MARQUEE_DURATION * 1000);
        x.set(wrap(x.get() - speed * dt, -halfWidthRef.current, 0));
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [x]);

  function onPointerDown(e: React.PointerEvent) {
    draggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartValueRef.current = x.get();
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
    if (draggedRef.current) pausedRef.current = false;
  }

  return (
    <div
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
      style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false; }}
    >
      <motion.div ref={trackRef} className="flex gap-4 pt-9" style={{ x, width: "max-content" }} draggable={false}>
        {children}
      </motion.div>
    </div>
  );
}

export function Shop() {
  const { dict, lang } = useLocale();
  const t = dict.shop;

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
          {t.badge}
        </motion.p>
        <motion.h2
          className="text-5xl md:text-6xl font-black"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.title}
        </motion.h2>
        <motion.p
          className="mt-3 text-black/60 text-base md:text-lg max-w-xl mx-auto font-sans"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t.description}
        </motion.p>
      </div>

      <Marquee>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {[...(t.items as any[]), ...(t.items as any[])].map((item: any, i: number) => (
          <ShopCard
            key={i}
            item={item}
            index={i % t.items.length}
            rateTemplate={t.hoursRate}
            lang={lang}
          />
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
        {t.moreComing}
      </motion.p>
    </section>
  );
}
