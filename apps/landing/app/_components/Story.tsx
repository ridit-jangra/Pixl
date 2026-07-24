"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";

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

export function Story() {
  const { dict } = useLocale();
  const t = dict.story;
  const countdown = useCountdown(LAUNCH_DATE);

  return (
    <section className="my-10 md:my-20 px-4 md:px-8 flex flex-col items-center gap-14" id="story">
      <div className="text-center">
        <motion.p
          className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2 font-sans"
          {...fadeUp}
          transition={{ duration: 0.5 }}
        >
          {t.badge}
        </motion.p>
        <motion.h2
          className="text-5xl md:text-6xl font-black"
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.title}
        </motion.h2>
        <motion.p
          className="mt-3 text-black/60 text-base md:text-lg max-w-xl mx-auto font-sans"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t.subtitle}
        </motion.p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <motion.div
          className="bg-[#fffaf7] border-2 border-black px-6 py-5 text-left hover:rotate-0 transition-transform"
          style={{ boxShadow: `4px 4px 0px #ff8c37`, rotate: "-2deg" }}
          {...fadeUp}
          transition={{ duration: 0.5 }}
        >
          <p className="font-pixel text-lg mb-2">{t.paths[0].title}</p>
          <p className="font-sans text-sm md:text-base text-black/60 leading-relaxed">{t.paths[0].text}</p>
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
            {t.andOr}
          </motion.span>
        </motion.div>

        <motion.div
          className="bg-[#fffaf7] border-2 border-black px-6 py-5 text-left hover:rotate-0 transition-transform"
          style={{ boxShadow: `4px 4px 0px #ec3750`, rotate: "2deg" }}
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          <p className="font-pixel text-lg mb-2">{t.paths[1].title}</p>
          <p className="font-sans text-sm md:text-base text-black/60 leading-relaxed">{t.paths[1].text}</p>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(t.rhythm as any[]).map((c: any, i: number) => (
          <motion.div
            key={c.title}
            className="bg-[#fffaf7] border-2 border-black px-6 py-5 text-left hover:-translate-y-1 hover:-translate-x-1 transition-transform"
            style={{ boxShadow: `4px 4px 0px ${["#000", "#ff8c37", "#ec3750"][i]}` }}
            whileHover={{ boxShadow: `8px 8px 0px ${["#000", "#ff8c37", "#ec3750"][i]}` } as any}
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
        <p className="font-pixel text-xl">{t.ctaTitle}</p>
        <p className="font-sans text-sm text-black/60 -mt-2">
          {t.ctaText}
        </p>
        {countdown?.done ? (
          <motion.p
            className="font-pixel text-2xl text-[#ec3750]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            {t.liveNow}
          </motion.p>
        ) : (
          <div className="flex items-start gap-1.5 sm:gap-2">
            <CountdownUnit value={countdown?.days ?? null} label={t.days} />
            <Colon />
            <CountdownUnit value={countdown?.hours ?? null} label={t.hours} />
            <Colon />
            <CountdownUnit value={countdown?.minutes ?? null} label={t.min} />
            <Colon />
            <CountdownUnit value={countdown?.seconds ?? null} label={t.sec} />
          </div>
        )}
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(t.mechanics as any[]).map((c: any, i: number) => (
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
