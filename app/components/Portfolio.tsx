"use client";

import { useState } from "react";
import { motion, MotionConfig, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { C } from "../lib/data";
import { useReducedMotion } from "../lib/useReducedMotion";
import { Boot } from "./Boot";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { GitLog } from "./Experience";
import { Projects } from "./Projects";
import { SkillsUniverse } from "./SkillsUniverse";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { ThemeToggle } from "./ThemeToggle";

export default function Portfolio() {
  const [booted, setBooted] = useState(false);
  const reduced = useReducedMotion();

  // top scroll-progress bar (spring-smoothed; raw under reduced motion)
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const progressScaleX = reduced ? scrollYProgress : smoothProgress;

  return (
    <MotionConfig reducedMotion="user">
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "var(--font-body), sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <div className="zh-bg" aria-hidden>
        <div className="zh-grid" />
        <motion.div
          className="zh-glow zh-glow1"
          animate={{ x: [0, "6vw", 0], y: [0, "4vw", 0] }}
          transition={{ duration: 26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <motion.div
          className="zh-glow zh-glow2"
          animate={{ x: [0, "-5vw", 0], y: [0, "-4vw", 0] }}
          transition={{ duration: 32, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <span className="zh-wm zh-wm-tr">{"<system.init />"}</span>
        <span className="zh-wm zh-wm-bl">{"while(alive) { code() }"}</span>
      </div>

      <AnimatePresence>
        {!booted && <Boot onDone={() => setBooted(true)} />}
      </AnimatePresence>
      <ThemeToggle />

      {/* scroll progress bar */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 2,
          background: "var(--accent)", transformOrigin: "0%",
          scaleX: progressScaleX, zIndex: 90,
        }}
      />

      <Nav />

      <main id="top" style={{ position: "relative", zIndex: 1, maxWidth: 1040, margin: "0 auto", padding: "0 clamp(20px, 6vw, 40px)" }}>
        <Hero booted={booted} />

        <GitLog />
        <Projects />

        {/* SKILLS */}
        <section id="skills" style={{ padding: "70px 0" }}>
          <Reveal>
          <SectionLabel index="03">SKILLS — skills.universe</SectionLabel>
          <SkillsUniverse />
          </Reveal>
        </section>

        {/* CONTACT */}
        <Contact />

        <Footer />
      </main>
    </div>
    </MotionConfig>
  );
}
