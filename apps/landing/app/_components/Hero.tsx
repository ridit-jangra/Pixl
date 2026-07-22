"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RSVP_KEY = "pixl-rsvped";

export function Hero() {
  const [email, setEmail] = useState("");
  const [shake, setShake] = useState(false);
  const [msg, setMsg] = useState("");
  const [rsvped, setRsvped] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (localStorage.getItem(RSVP_KEY)) setRsvped(true);
  }, []);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;

    function tryPlay() {
      video?.play().catch(() => {});
    }

    tryPlay();
    video.addEventListener("canplay", tryPlay);

    const events = ["pointerdown", "touchstart", "keydown", "scroll"];
    function onInteract() {
      tryPlay();
      if (video && !video.paused) {
        events.forEach((e) => window.removeEventListener(e, onInteract));
      }
    }
    events.forEach((e) => window.addEventListener(e, onInteract, { passive: true }));

    return () => {
      video.removeEventListener("canplay", tryPlay);
      events.forEach((e) => window.removeEventListener(e, onInteract));
    };
  }, []);

  async function handleRSVP() {
    if (rsvped) {
      window.open(`https://rsvp.soon.it/pixl`, "_blank");
      return;
    }
    if (!email) {
      triggerError("yo, drop your email first 👀");
      return;
    }
    if (!isValid) {
      triggerError("that doesn't look like a real email lol");
      return;
    }

    await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    localStorage.setItem(RSVP_KEY, "1");
    setRsvped(true);

    window.open(`https://rsvp.soon.it/pixl`, "_blank");
  }

  function triggerError(message: string) {
    setMsg(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="relative h-screen">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="auto"
        poster="/hero-bg1.png"
      >
        <source src="https://cdn.hackclub.com/019eee3a-c90e-79da-a7cc-9251883cfb5a/hero-bg.mp4" type="video/mp4" />
      </video>
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div className="relative z-10 flex h-screen w-full items-center justify-center flex-col">
        <div className="flex flex-col items-center px-4">
          <motion.div
            className="bg-[#fffaf7] border-2 border-black px-4 py-2 sm:px-5 sm:py-3 mb-4 sm:mb-6 max-w-[15rem] sm:max-w-sm mx-4 translate-y-4 sm:translate-y-6"
            style={{ boxShadow: "4px 4px 0px #000", rotate: "-1.5deg" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          >
            <p className="font-sans font-bold text-xs sm:text-sm leading-snug text-center text-black">
              <span className="text-[#ff8c37]">You ship</span> projects inside a story-driven
              game, <span className="text-[#ec3750]">we ship</span> real prizes to your door.
            </p>
          </motion.div>
          <motion.p
            className="font-pixel text-[#ec3750] text-[6rem] sm:text-[9rem] md:text-[13rem] lg:text-[16rem] select-none leading-none"
            style={{ textShadow: "var(--pixl-shadow)" }}
            initial={{ opacity: 0, y: -80, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            Pixl
          </motion.p>
          <motion.div
            className="flex flex-col w-full"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
          >
            {rsvped ? (
              <div className="flex flex-col items-center self-center bg-[#ec3750] px-24 py-1.5 text-white border-black border-r-8 border-t-2 border-l-2 border-b-8">
                <p className="text-base sm:text-lg text-center">
                  you&apos;re already in
                </p>
                <button
                  onClick={() => window.open(`https://rsvp.soon.it/pixl`, "_blank")}
                  className="text-xs underline cursor-pointer opacity-80 hover:opacity-100"
                >
                  view your RSVP
                </button>
              </div>
            ) : (
              <motion.div
                className="flex w-full"
                animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRSVP()}
                  className="w-full px-5 py-3 text-lg sm:text-2xl md:text-3xl focus:outline-0 bg-[#ec3750] text-white transition-all placeholder:text-white/60"
                  placeholder="your@email.com"
                />
                <motion.button
                  onClick={handleRSVP}
                  className="text-center w-[30%] px-5 py-3 text-lg sm:text-2xl md:text-3xl bg-[#ec3750] cursor-pointer text-white hover:-translate-y-1 hover:-translate-x-1 border-black border-r-8 border-t-2 border-l-2 hover:border-b-12 border-b-8 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  RSVP
                </motion.button>
              </motion.div>
            )}
            <AnimatePresence>
              {msg && (
                <motion.p
                  className="text-black text-sm mt-2 pl-1"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
