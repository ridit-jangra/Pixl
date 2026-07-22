"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const steps = [
  {
    step: 1,
    title: "Join the World",
    description: "Enter Pixl, create your character and join others in a retro 2D open world",
    video: "https://cdn.hackclub.com/019eee3b-5ab8-7923-9c8c-3a901acadfce/step-1.mp4",
  },
  {
    step: 2,
    title: "Explore Regions",
    description: "Discover cyberpunk cities, underwater zones & more",
    video: "https://cdn.hackclub.com/019eee3b-a3fa-7c98-8c0d-76f7b0ac78e4/step-2.mp4",
  },
  {
    step: 3,
    title: "Accept Sidequests",
    description: "Build apps, websites & hardware for in-game characters",
    video: "/step-3.mp4",
  },
  {
    step: 4,
    title: "Get Rewarded",
    description: "NPCs reward you for your work with real prizes and pixels, the in-game currency you can spend in shops",
    video: "/step-4.mp4",
  },
  {
    step: 5,
    title: "Spend your Pixels",
    description: "Take your pixels to merchants and spend them on items, upgrades and real-world rewards",
    video: "/step-5.mp4",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function VideoCard({ s }: { s: typeof steps[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const comingSoon = s.step >= 3;

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch && !comingSoon) videoRef.current?.play();
  }, [comingSoon]);

  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col gap-2 text-left"
      onPointerEnter={(e) => { if (!comingSoon && e.pointerType === "mouse") videoRef.current?.play(); }}
      onPointerLeave={(e) => { if (!comingSoon && e.pointerType === "mouse") videoRef.current?.pause(); }}
    >
      <div className="relative border-2 border-black aspect-square overflow-hidden bg-black shadow-[4px_4px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:-translate-x-2 transition-all">
        <span
          className="absolute top-2 left-2 z-10 text-xs px-2 py-0.5 border border-black font-pixel"
          style={{ background: "#ec3750", color: "#F5EED2" }}
        >
          {String(s.step).padStart(2, "0")}
        </span>
        <video
          ref={videoRef}
          src={s.video}
          preload="auto"
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-90"
        />
        {comingSoon && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <p className="font-pixel text-[#ec3750] text-4xl">Pixl</p>
            <p className="font-pixel text-[#F5EED2] text-lg tracking-wide">Coming Soon</p>
          </div>
        )}
      </div>
      <p className="text-xl font-pixel leading-tight">{s.title}</p>
      <p className="text-base text-black/60 leading-snug">{s.description}</p>
    </motion.div>
  );
}

export function WTFISTHIS() {
  return (
    <section
      className="my-20 px-4 md:px-8 text-center flex flex-col items-center gap-10"
      id="what"
    >
      <motion.h2
        className="text-6xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        What is Pixl?
      </motion.h2>

      <motion.p
        className="max-w-2xl text-[18px]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        Centuries ago, Origin was the greatest digital civilization ever built, until the Great
        Static shattered it into islands lost in the Void. Its people crossed universes and found
        Hack Clubbers, who helped rebuild it under a new name: Pixl. A pixel-themed YSWS where
        every real project you ship repairs the world and unlocks real-world rewards.
      </motion.p>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-15 w-full max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {steps.map((s) => (
          <VideoCard key={s.step} s={s} />
        ))}
        <motion.div variants={cardVariants} className="flex flex-col gap-2 text-left">
          <div className="aspect-square flex flex-col">
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="font-pixel text-[#ff8c37] leading-none" style={{ fontSize: "clamp(1rem, 4vw, 3rem)" }}>You Repair</p>
              <p className="text-black/70 leading-snug text-xs sm:text-sm md:text-lg lg:text-xl">Ship real hardware & software sidequests for NPCs. Every project becomes Restoration Energy that rebuilds a broken piece of Pixl</p>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1">
              <p className="font-pixel text-[#ec3750] leading-none" style={{ fontSize: "clamp(1rem, 4vw, 3rem)" }}>The Core Pays</p>
              <p className="text-black/70 leading-snug text-xs sm:text-sm md:text-lg lg:text-xl">The Core is a vault of old Pixelian tech. As you repair it, it gives its treasures back: real prizes and grants matched to what you built</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

