"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Who can join?",
    answer:
      "Teen hackers, first-time builders, designers, coders, and curious friends who want to make something real.",
  },
  {
    question: "Wait, why is it called Pixl?",
    answer:
      "The world was originally called Origin, until its Core got overloaded with every invention ever made and broke apart into pixelated islands. Its survivors crossed universes looking for the only people they figured could actually help rebuild it: Hack Clubbers. Together they're now the Pixelians, and they renamed the place Pixl.",
  },
  {
    question: "Do I need a team?",
    answer: "No. Come solo or with friends. ",
  },
  {
    question: "Is this only for expert coders?",
    answer:
      "Nope. Bring curiosity. Mentors will help with ideas, debugging, demos, and shipping.",
  },
  {
    question: "When is Pixl starting?",
    answer:
      "Pixl launches August 18th, 2026 , there's a live countdown ticking down to it further up the page. Stay tuned!",
  },
  {
    question: "Is this free?",
    answer:
      "Yes! Each of your projects will be funded, and the event itself is 100% free.",
  },
  {
    question: "Who is running Pixl?",
    answer: (
      <>
        A big team of friends!{" "}
        <a
          href="https://docs.google.com/document/d/1Bq4wNR3PsDhs6BdLDFssY3Ltl-pAnn6IoL8DVkVsPXo/edit?usp=sharing"
          target="_blank"
          rel="noreferrer"
          className="text-[#ec3750] font-bold underline"
          onClick={(e) => e.stopPropagation()}
        >
          Meet the whole team here.
        </a>
      </>
    ),
  },
  {
    question: "I have more questions!",
    answer: "Ask us in #pixl-help on the Hack Club Slack.",
  },
];

function FAQItem({
  question,
  answer,
  index,
  open,
  onToggle,
}: {
  question: string;
  answer: React.ReactNode;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.1,
      }}
    >
      <motion.div
        className="bg-[#fffaf7] border-2 border-black cursor-pointer select-none"
        style={{ boxShadow: open ? "6px 6px 0px #ff8c37" : "6px 6px 0px #000" }}
        animate={{
          boxShadow: open ? "6px 6px 0px #ff8c37" : "6px 6px 0px #000",
        }}
        transition={{ duration: 0.2 }}
        onClick={onToggle}
        whileHover={{ x: -2, y: -2, boxShadow: "8px 8px 0px #ec3750" }}
        whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0px #000" }}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-[#ec3750] font-black text-xl"
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {">"}
            </motion.span>
            <span className="text-xl font-bold text-black">{question}</span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 border-t-2 border-black pt-4 text-black/80 text-[17px] leading-relaxed">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section
      className="my-10 md:my-30 px-4 md:px-20 text-center flex flex-col items-center w-full"
      id="faq"
    >
      <motion.p
        className="text-sm font-bold uppercase tracking-widest text-black/50 mb-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        FAQ
      </motion.p>
      <motion.p
        className="text-6xl font-black text-black mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        Quick answers
      </motion.p>

      <div className="flex flex-col gap-4 max-w-200 w-full">
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            index={i}
            question={faq.question}
            answer={faq.answer}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}
