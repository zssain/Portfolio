"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8% 0px" }}
    >
      {children}
    </motion.div>
  );
}
