"use client";

/**
 * DemoToggle
 * ----------
 * A small, tasteful pill toggle that lets the user switch between
 * "Try Demo" and "Live Data" modes without touching OAuth.
 *
 * Designed to sit at the top of the Studio page or in the nav bar.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useDemoMode } from "@/contexts/DemoModeContext";

export function DemoToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <button
      onClick={toggleDemoMode}
      aria-pressed={isDemoMode}
      className={[
        // Layout
        "relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full",
        "text-xs font-mono tracking-widest uppercase select-none",
        "transition-all duration-300 ease-out",
        "border",
        // Colours vary by mode
        isDemoMode
          ? "bg-stone-900 border-amber-500/60 text-amber-400"
          : "bg-white border-stone-200 text-stone-500 hover:border-stone-400",
      ].join(" ")}
    >
      {/* Animated dot indicator */}
      <span className="relative flex h-2 w-2">
        <AnimatePresence mode="wait">
          {isDemoMode ? (
            <motion.span
              key="demo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 rounded-full bg-amber-400"
            />
          ) : (
            <motion.span
              key="live"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 rounded-full bg-emerald-500"
            />
          )}
        </AnimatePresence>
        {/* Ping animation when live */}
        {!isDemoMode && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        )}
      </span>

      <AnimatePresence mode="wait">
        <motion.span
          key={isDemoMode ? "demo-label" : "live-label"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {isDemoMode ? "Demo Mode" : "Live Data"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
