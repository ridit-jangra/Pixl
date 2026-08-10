"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "./LocaleProvider";

const MAP_WIDTH = 1640;
const MAP_HEIGHT = 960;
const INITIAL_POS = { x: -600, y: -20 };

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function MapPreview() {
  const { dict } = useLocale();
  const t = dict.mapPreview;
  const frameRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(INITIAL_POS);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  function clampPos(x: number, y: number) {
    const frame = frameRef.current;
    if (!frame) return { x, y };
    const maxX = 0;
    const maxY = 0;
    const minX = Math.min(0, frame.clientWidth - MAP_WIDTH);
    const minY = Math.min(0, frame.clientHeight - MAP_HEIGHT);
    return { x: clamp(x, minX, maxX), y: clamp(y, minY, maxY) };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos(clampPos(dragStart.current.posX + dx, dragStart.current.posY + dy));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <section className="my-10 md:my-20 px-4 md:px-8 flex flex-col items-center gap-8" id="map-preview">
      <div className="text-center">
        <motion.p
          className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2 font-sans"
          {...fadeUp}
          transition={{ duration: 0.5 }}
        >
          {t?.badge}
        </motion.p>
        <motion.h2
          className="text-5xl md:text-6xl font-black"
          {...fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {t?.title}
        </motion.h2>
        <motion.p
          className="mt-3 text-black/60 text-base md:text-lg max-w-xl mx-auto font-sans"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t?.subtitle}
        </motion.p>
      </div>

      <motion.div
        className="relative w-full max-w-4xl"
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          ref={frameRef}
          role="img"
          aria-label={t?.title}
          className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] overflow-hidden bg-[#52aeb9] border-2 border-black select-none"
          style={{ boxShadow: "6px 6px 0px #000", touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={(e) => dragging && handlePointerUp(e)}
        >
          <img
            src="/world-map.webp"
            alt=""
            draggable={false}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            className="absolute top-0 left-0 max-w-none pointer-events-none"
            style={{
              imageRendering: "pixelated",
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            }}
          />
        </div>

        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-pixel text-black/70 text-sm bg-[#fffaf7] border-2 border-black rounded-full px-4 py-1.5 whitespace-nowrap"
          style={{ boxShadow: "3px 3px 0px #000" }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {t?.hint}
        </motion.div>
      </motion.div>
    </section>
  );
}
