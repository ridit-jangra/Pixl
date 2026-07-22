"use client";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
} as any;

export function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black px-4 md:px-20 py-6 md:py-10 mt-10 md:mt-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <p className="text-xl font-black mb-4">
          A project by{" "}
          <a
            target="_blank"
            className="text-[#ec3750] underline underline-offset-4 hover:text-[#ff8c37] transition-colors"
          >
            Teens
          </a>
        </p>
        <p className="max-w-2xl text-black/70 leading-relaxed">
          Hack Club is a 501(c)(3) nonprofit and network of 60k+ technical high
          schoolers. We believe you learn best by building, so we&apos;re
          creating community and providing grants so you can make awesome
          projects. In the past few years, we&apos;ve{" "}
          <a
            href="https://summer.hackclub.com"
            target="_blank"
            className="underline underline-offset-2 hover:text-[#ec3750] transition-colors"
          >
            partnered with GitHub to run Summer of Making
          </a>
          ,{" "}
          <a
            href="https://www.youtube.com/watch?v=nf0S5qGrFyY"
            target="_blank"
            className="underline underline-offset-2 hover:text-[#ec3750] transition-colors"
          >
            hosted the world&apos;s longest hackathon on land
          </a>
          , and{" "}
          <a
            href="https://losangeles.hackclub.com"
            target="_blank"
            className="underline underline-offset-2 hover:text-[#ec3750] transition-colors"
          >
            ran Canada&apos;s largest high school hackathon
          </a>
          .
        </p>
        <p className="mt-4 text-black/70">
          At Hack Club, students aren&apos;t just learning, they&apos;re
          shipping.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8 border-t-2 border-black pt-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <div>
          <motion.p
            variants={item}
            className="font-black text-[#ff8c37] text-lg mb-4"
          >
            Pixl
          </motion.p>
          {[
            { label: "What is Pixl", href: "#what" },
            { label: "How it works", href: "#" },
            { label: "FAQ", href: "#faq" },
            { label: "Docs", href: "#" },
          ].map(({ label, href }) => (
            <motion.a
              key={label}
              variants={item}
              href={href}
              className="block text-black/70 hover:text-[#ec3750] transition-colors mb-2 w-fit"
            >
              {label}
            </motion.a>
          ))}
        </div>

        <div>
          <motion.p
            variants={item}
            className="font-black text-[#ec3750] text-lg mb-4"
          >
            Resources
          </motion.p>
          {[
            { label: "Join our Slack", href: "https://slack.hackclub.com" },
            { label: "Community Events", href: "https://events.hackclub.com/" },
            { label: "Workshops", href: "https://workshops.hackclub.com/" },
            { label: "Code of Conduct", href: "https://hackclub.com/conduct/" },
          ].map(({ label, href }) => (
            <motion.a
              key={label}
              variants={item}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="block text-black/70 hover:text-[#ec3750] transition-colors mb-2 w-fit"
            >
              {label}
            </motion.a>
          ))}
        </div>

        <div>
          <motion.p
            variants={item}
            className="font-black text-[#ec3750] text-lg mb-4"
          >
            Hack Club
          </motion.p>
          {[
            { label: "Philosophy", href: "https://hackclub.com/philosophy/" },
            { label: "Our Team & Board", href: "https://hackclub.com/team/" },
            { label: "Branding", href: "https://hackclub.com/brand/" },
            { label: "Donate", href: "https://hackclub.com/philanthropy/" },
          ].map(({ label, href }) => (
            <motion.a
              key={label}
              variants={item}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="block text-black/70 hover:text-[#ec3750] transition-colors mb-2 w-fit"
            >
              {label}
            </motion.a>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-black/40 text-sm border-t-2 border-black/10 pt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="min-w-0">
          Pixl is made with ♥ by teenagers for teenagers
        </p>
        <p className="min-w-0 text-right">
          want to add something ? Make a PR on{' '}
          <a
            href="https://github.com/Pixl-YSWS/pixl"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-[#ec3750] transition-colors"
          >
            GitHub
          </a>
          .
        </p>
      </motion.div>
    </footer>
  );
}

