"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-08-18T00:00:00").getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const diff = Math.max(target - now, 0);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  };
}

function CountdownUnit({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center bg-black text-[#F5EED2] border-2 border-black px-3 py-2 sm:px-5 sm:py-3 min-w-16 sm:min-w-20 overflow-hidden">
      <span className="relative font-sans font-bold text-2xl sm:text-4xl leading-none h-[1em] w-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
          >
            {value === null ? "--" : String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-[10px] sm:text-xs font-sans uppercase tracking-widest text-[#F5EED2]/60 mt-1">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span className="font-sans font-bold text-2xl sm:text-4xl text-black/25 leading-none self-start mt-2 sm:mt-3 animate-pulse">
      :
    </span>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const rhythm = [
  {
    title: "Chapters (~3 weeks)",
    text: "The story moves forward in chapters. Each chapter is a push to repair a part of the world: you take sidequests from the regions already unlocked, ship real projects, and your work counts toward the chapter's restoration goal. When the community hits it, the story advances: a new region opens, new NPCs return, new sidequests appear.",
    shadow: "#000",
  },
  {
    title: "Operations (~1 week)",
    text: "Between chapters, short themed events: a game jam, a hackathon, a tool-building week. One week, one theme, one piece of the world brought back online. Perfect if you want something intense with a clear deadline.",
    shadow: "#ff8c37",
  },
  {
    title: "Joining late? All good",
    text: "Unlocked regions never close. Whenever you arrive, you can pick any available sidequest, ship it, and earn your prizes and pixels like everyone else. Chapters only decide what unlocks next, never what you're allowed to build.",
    shadow: "#ec3750",
  },
];

const paths = [
  {
    title: "Take a sidequest",
    text: "The Core already knows about these: known problems NPCs across unlocked regions need solved. Pick one and ship it.",
    shadow: "#ff8c37",
  },
  {
    title: "Build your own thing",
    text: "The Core can't predict every invention. Ship something original it never asked for, and it still counts as Restoration Energy.",
    shadow: "#ec3750",
  },
];

const mechanics = [
  {
    title: "You always win",
    text: "Every shipped project earns you its prize and pixels, no matter what the rest of the community does.",
  },
  {
    title: "Restoration Energy",
    text: "Hours of shipped work convert into Restoration Energy. Keep shipping and it stacks into multipliers on what you earn.",
  },
  {
    title: "Community goals",
    text: "All Restoration Energy also repairs the world itself. At big milestones, new regions unlock, NPCs return and the Core gives back more of what it holds.",
  },
];

export function Story() {
  const t = useCountdown(LAUNCH_DATE);

  return (
    <section className="my-10 md:my-20 px-4 md:px-8 flex flex-col items-center gap-14" id="story">
      <div className="text-center">
        <motion.p
          className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2 font-sans"
          {...fadeUp}
          transition={{ duration: 0.5 }}
        >
          The Restoration
        </motion.p>
        <motion.h2
          className="text-5xl md:text-6xl font-black"
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          How it works
        </motion.h2>
        <motion.p
          className="mt-3 text-black/60 text-base md:text-lg max-w-xl mx-auto font-sans"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Pixl runs as a story in seasons: chapters move the world forward, and everything you ship
          repairs it.
        </motion.p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <motion.div
          className="bg-[#fffaf7] border-2 border-black px-6 py-5 text-left hover:rotate-0 transition-transform"
          style={{ boxShadow: `4px 4px 0px ${paths[0].shadow}`, rotate: "-2deg" }}
          {...fadeUp}
          transition={{ duration: 0.5 }}
        >
          <p className="font-pixel text-lg mb-2">{paths[0].title}</p>
          <p className="font-sans text-sm md:text-base text-black/60 leading-relaxed">{paths[0].text}</p>
        </motion.div>

        <motion.div
          className="font-pixel text-black/50 text-sm bg-[#fffaf7] border-2 border-black rounded-full px-3 py-1.5 justify-self-center"
          style={{ boxShadow: "3px 3px 0px #000" }}
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <motion.span
            className="inline-block"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, delay: 1, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          >
            and/or
          </motion.span>
        </motion.div>

        <motion.div
          className="bg-[#fffaf7] border-2 border-black px-6 py-5 text-left hover:rotate-0 transition-transform"
          style={{ boxShadow: `4px 4px 0px ${paths[1].shadow}`, rotate: "2deg" }}
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          <p className="font-pixel text-lg mb-2">{paths[1].title}</p>
          <p className="font-sans text-sm md:text-base text-black/60 leading-relaxed">{paths[1].text}</p>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-4">
        {rhythm.map((c, i) => (
          <motion.div
            key={c.title}
            className="bg-[#fffaf7] border-2 border-black px-6 py-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform"
            style={{ boxShadow: `4px 4px 0px ${c.shadow}` }}
            whileHover={{ boxShadow: `8px 8px 0px ${c.shadow}` } as any}
            {...fadeUp}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <p className="font-pixel text-xl mb-2">{c.title}</p>
            <p className="font-sans text-sm md:text-base text-black/60 leading-relaxed">{c.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative max-w-2xl w-full bg-[#fffaf7] border-2 border-black px-6 py-8 text-center flex flex-col items-center gap-5 hover:-translate-y-1 hover:-translate-x-1 transition-transform"
        style={{ boxShadow: "6px 6px 0px #ec3750" }}
        whileHover={{ boxShadow: "10px 10px 0px #ec3750" } as any}
        {...fadeUp}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src="/pixel_currency_gold-removebg-preview.png"
          alt=""
          aria-hidden
          className="absolute -top-6 -left-5 sm:-top-14 sm:-left-12 w-14 sm:w-24 select-none pointer-events-none"
          style={{ imageRendering: "pixelated", rotate: "-15deg" }}
          animate={{ y: [0, -6, 0], rotate: ["-15deg", "-8deg", "-15deg"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="/pixel_currency_red-removebg-preview.png"
          alt=""
          aria-hidden
          className="absolute -bottom-5 -right-4 sm:-bottom-12 sm:-right-10 w-12 sm:w-20 select-none pointer-events-none"
          style={{ imageRendering: "pixelated", rotate: "16deg" }}
          animate={{ y: [0, 6, 0], rotate: ["16deg", "24deg", "16deg"] }}
          transition={{ duration: 3.5, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="font-pixel text-xl">Want to know more about the story?</p>
        <p className="font-sans text-sm text-black/60 -mt-2">
          The rest of the lore drops when Pixl launches.
        </p>
        {t?.done ? (
          <motion.p
            className="font-pixel text-2xl text-[#ec3750]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            Pixl is live!
          </motion.p>
        ) : (
          <div className="flex items-start gap-1.5 sm:gap-2">
            <CountdownUnit value={t?.days ?? null} label="days" />
            <Colon />
            <CountdownUnit value={t?.hours ?? null} label="hours" />
            <Colon />
            <CountdownUnit value={t?.minutes ?? null} label="min" />
            <Colon />
            <CountdownUnit value={t?.seconds ?? null} label="sec" />
          </div>
        )}
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {mechanics.map((c, i) => (
          <motion.div
            key={c.title}
            className="bg-[#fffaf7] border-2 border-black px-5 py-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform"
            style={{ boxShadow: "4px 4px 0px #ff8c37" }}
            whileHover={{ boxShadow: "8px 8px 0px #ff8c37" } as any}
            {...fadeUp}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p className="font-pixel text-lg mb-2">{c.title}</p>
            <p className="font-sans text-sm text-black/60 leading-relaxed">{c.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
