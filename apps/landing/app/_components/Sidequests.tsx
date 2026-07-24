"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";

const LEVEL_COLORS = ["#4ade80", "#ff8c37", "#ec3750"] as const;

const TAG_KEYS = [
  ["htmlCss", "web"],
  ["reactNative", "mobile"],
  ["networking", "security", "backend"],
  ["roblox", "lua", "gameDev"],
  ["pixelArt", "design", "gameDev", "code"],
  ["pixelArt", "design", "code"],
  ["robotics", "firmware", "hardware", "code"],
];

function SidequestCard({
  l,
  tags,
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  l: any;
  tags: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="flex flex-col border-2 border-black bg-[#fffaf7] w-80 shrink-0 group relative overflow-hidden cursor-pointer"
      style={{ boxShadow: `6px 6px 0px ${l.color}` }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black">
        <span
          className="font-pixel text-sm px-3 py-1 border-2 border-black"
          style={{ background: l.color, color: "#fff" }}
        >
          {l.level}
        </span>
        <p className="text-black/40 text-xs font-sans">{l.hours}</p>
      </div>

      <div className="px-5 py-5 flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 font-sans">{t.sidequestLabel}</p>
        <p className="font-pixel text-lg leading-snug">{l.quest.title}</p>
        <p className="text-black/60 text-sm leading-relaxed font-sans">{l.quest.description}</p>
        <div className="flex gap-2 flex-wrap mt-1">
          {tags.map((tag) => (
            <span key={tag} className="text-[10px] border border-black/30 px-2 py-0.5 text-black/50 font-sans">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`absolute inset-0 bg-[#fffaf7] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-center px-5 py-5 gap-3 group-hover:translate-y-0 ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 font-sans">{t.prizeLabel}</p>
        <p className="font-pixel text-2xl leading-snug">{l.prize.title}</p>
        <p className="text-black/60 text-sm leading-relaxed font-sans">{l.prize.description}</p>
      </div>
    </div>
  );
}

const MARQUEE_DURATION = 40;

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

  function onClickCapture(e: React.MouseEvent) {
    if (draggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      draggedRef.current = false;
    }
  }

  return (
    <div
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
      style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false; }}
    >
      <motion.div
        ref={trackRef}
        className="flex gap-5"
        style={{ x, width: "max-content" }}
        draggable={false}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function Sidequests() {
  const { dict } = useLocale();
  const t = dict.sidequests;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const levels = (t.levels as any[]).map((l: any, i: number) => ({
    ...l,
    color: LEVEL_COLORS[i % 3 === 2 ? 2 : i % 3 === 1 ? 1 : 0],
  }));
  const tags = t.tags;

  return (
    <section className="my-10 md:my-20 px-4 md:px-8 flex flex-col items-center gap-16" id="sidequests">
      <div className="text-center">
        <motion.p
          className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2"
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

      <motion.div
        className="max-w-2xl w-full border-2 border-black bg-[#fffaf7] px-6 py-5 text-center font-sans"
        style={{ boxShadow: "4px 4px 0px #000" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-pixel text-lg mb-2">{t.howRewardsWork}</p>
        <p className="text-black/60 text-sm leading-relaxed">{t.howRewardsWorkDesc}</p>
      </motion.div>

      <Marquee>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {[...levels, ...levels].map((l: any, i: number) => (
          <SidequestCard
            key={i}
            l={l}
            tags={TAG_KEYS[i % levels.length].map((k: string) => (tags as Record<string, string>)[k])}
            t={t}
          />
        ))}
      </Marquee>

      <motion.a
        href="https://docs.google.com/document/d/1ROqv90L59KqjQ4uCTDhhXNUn2yssMYlLJyvMBjA5xFA/edit?usp=sharing"
        target="_blank"
        rel="noreferrer"
        className="max-w-2xl w-full border-2 border-black bg-[#fffaf7] px-6 py-5 text-center font-sans cursor-pointer hover:-translate-y-1 hover:-translate-x-1 transition-all block"
        style={{ boxShadow: "4px 4px 0px #ec3750" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ boxShadow: "8px 8px 0px #ec3750" } as any}
      >
        <p className="font-pixel text-lg mb-2">{t.seeFullExample}</p>
        <p className="text-black/60 text-sm leading-relaxed">{t.seeFullExampleDesc}</p>
      </motion.a>
    </section>
  );
}
