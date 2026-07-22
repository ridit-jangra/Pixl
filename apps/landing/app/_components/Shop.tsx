"use client";

import { motion } from "framer-motion";

export function Shop() {
  return (
    <section className="my-10 md:my-20 px-4 md:px-8 flex flex-col items-center gap-6" id="shop">
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
      </div>

      <motion.p
        className="inline-block font-pixel text-sm md:text-base bg-[#ff8c37] text-white px-5 py-3 border-2 border-black text-center"
        style={{ boxShadow: "4px 4px 0px #000" }}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Head to the in-game shop to see the prices and the full catalog!
      </motion.p>
    </section>
  );
}
