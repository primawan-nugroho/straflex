"use client";

/**
 * CanvasWrapper
 * -------------
 * Wraps any visualisation element and adds an export-to-PNG pipeline that:
 *
 *   1. Runs a font "preflight" — waits for every declared @font-face to be
 *      fully loaded (FontFaceSet.ready) before allowing html2canvas to paint.
 *      Without this, Editorial typography renders as system fallbacks in the
 *      exported PNG.
 *
 *   2. Temporarily forces the capture node to its exact pixel dimensions
 *      (bypassing any CSS `transform: scale(…)` preview trick) so the export
 *      is always native-resolution.
 *
 *   3. Applies html2canvas options tuned for Straflex:
 *        • scale:  devicePixelRatio * EXPORT_SCALE for retina sharpness
 *        • useCORS: true          – remote athlete avatars
 *        • allowTaint: false
 *        • logging: false
 *        • imageTimeout: 10 000
 *
 *   4. Triggers a browser download of the resulting PNG.
 *
 * Usage
 * -----
 *   <CanvasWrapper
 *     filename="straflex-run-2025-04"
 *     width={1080}
 *     height={1080}
 *   >
 *     <EditorialCard activity={activity} />
 *   </CanvasWrapper>
 *
 * Props
 * -----
 *   children   – the element(s) to capture.  Keep everything inline-styled
 *                or Tailwind-classed; do NOT use CSS `filter:` on the root
 *                (html2canvas cannot rasterise filter).
 *   width      – logical CSS width of the export canvas in px (default 1080).
 *   height     – logical CSS height (default 1080).
 *   filename   – download filename without extension (default "straflex").
 *   className  – extra classes forwarded to the preview wrapper.
 *   previewScale – how much to shrink the card in the UI (default 0.45).
 *   onExportStart / onExportEnd – lifecycle callbacks.
 */

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Extra pixel multiplier applied on top of window.devicePixelRatio. */
const EXPORT_SCALE = 2;

/** Fonts that MUST be loaded before we allow html2canvas to run. */
const REQUIRED_FONT_FAMILIES = [
  "Playfair Display",
  "DM Serif Display",
  "Cormorant Garamond",
  "Geist",
  "Geist Mono",
  // Add any additional @font-face families here as the design evolves.
];

// ---------------------------------------------------------------------------
// Font preflight
// ---------------------------------------------------------------------------

/**
 * Returns a promise that resolves once all `REQUIRED_FONT_FAMILIES` are
 * available in the FontFaceSet, or after `timeoutMs` ms (whichever is first).
 *
 * Strategy:
 *   • `document.fonts.ready` resolves when the initial load queue is empty,
 *     but it doesn't re-wait for lazily-injected faces.
 *   • We combine `fonts.ready` with individual `fonts.load(…)` calls for
 *     each weight / style variant we actually use in the editorial cards.
 */
async function waitForFonts(timeoutMs = 8_000): Promise<void> {
  if (typeof document === "undefined") return;

  const variants = REQUIRED_FONT_FAMILIES.flatMap((family) => [
    `400 16px "${family}"`,
    `700 16px "${family}"`,
    `italic 400 16px "${family}"`,
  ]);

  const loadPromises = variants.map((descriptor) =>
    document.fonts.load(descriptor).catch(() => {
      // Non-fatal: if a variant isn't declared just continue.
    }),
  );

  const timeout = new Promise<void>((resolve) =>
    setTimeout(resolve, timeoutMs),
  );

  await Promise.race([
    Promise.all([document.fonts.ready, ...loadPromises]),
    timeout,
  ]);
}

// ---------------------------------------------------------------------------
// html2canvas dynamic import helper
// ---------------------------------------------------------------------------

async function captureElement(
  el: HTMLElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  // Dynamic import keeps html2canvas out of the main bundle.
  const { default: html2canvas } = await import("html2canvas");

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const scale = dpr * EXPORT_SCALE;

  return html2canvas(el, {
    scale,
    width,
    height,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 10_000,
    // Prevent html2canvas from cloning the element inside an iframe
    // (avoids font re-resolution delays on Firefox).
    foreignObjectRendering: false,
    // We handle background ourselves via the card component.
    backgroundColor: null,
  });
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  link.remove();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CanvasWrapperHandle {
  /** Programmatically trigger an export (e.g. from a parent toolbar button). */
  exportPng: () => Promise<void>;
}

export interface CanvasWrapperProps {
  children: React.ReactNode;
  /** Logical export width in CSS pixels (default 1080). */
  width?: number;
  /** Logical export height in CSS pixels (default 1080). */
  height?: number;
  /** Download filename without `.png` extension (default "straflex"). */
  filename?: string;
  /** Extra Tailwind classes for the outer preview container. */
  className?: string;
  /**
   * How much to scale the card down for the in-browser preview.
   * 0.45 fits a 1080px card comfortably in most viewport widths.
   */
  previewScale?: number;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CanvasWrapper = forwardRef<CanvasWrapperHandle, CanvasWrapperProps>(
  function CanvasWrapper(
    {
      children,
      width = 1080,
      height = 1080,
      filename = "straflex",
      className = "",
      previewScale = 0.45,
      onExportStart,
      onExportEnd,
    },
    ref,
  ) {
    const captureRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<
      "idle" | "loading-fonts" | "capturing" | "done" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // -- Export pipeline --------------------------------------------------

    const exportPng = useCallback(async () => {
      const el = captureRef.current;
      if (!el) return;

      setErrorMessage(null);
      onExportStart?.();

      try {
        // Step 1 – Font preflight
        setStatus("loading-fonts");
        await waitForFonts();

        // Step 2 – Capture
        setStatus("capturing");

        // Temporarily override any CSS transform so html2canvas sees the
        // element at its true pixel dimensions (not the scaled preview size).
        const prevTransform = el.style.transform;
        const prevTransformOrigin = el.style.transformOrigin;
        el.style.transform = "none";
        el.style.transformOrigin = "unset";

        const canvas = await captureElement(el, width, height);

        // Restore
        el.style.transform = prevTransform;
        el.style.transformOrigin = prevTransformOrigin;

        // Step 3 – Download
        downloadCanvas(canvas, filename);
        setStatus("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
        setStatus("error");
        console.error("[CanvasWrapper] Export failed:", err);
      } finally {
        onExportEnd?.();
        // Reset status after a beat so the user can export again.
        setTimeout(() => setStatus("idle"), 2_500);
      }
    }, [filename, width, height, onExportStart, onExportEnd]);

    // Expose `exportPng` to parent refs.
    useImperativeHandle(ref, () => ({ exportPng }), [exportPng]);

    // -- Derived state for UI -------------------------------------------

    const isExporting = status === "loading-fonts" || status === "capturing";
    const statusLabel: Record<typeof status, string> = {
      idle: "Export PNG",
      "loading-fonts": "Loading fonts…",
      capturing: "Capturing…",
      done: "Saved ✓",
      error: "Export failed",
    };

    // -- Render -----------------------------------------------------------

    return (
      <div className={`flex flex-col items-center gap-6 ${className}`}>
        {/* ── Preview ── */}
        <div
          style={{
            width: width * previewScale,
            height: height * previewScale,
            // overflow hidden clips any child that overflows during preview
            overflow: "hidden",
            // Subtle shadow to suggest a physical card
            boxShadow:
              "0 8px 40px -8px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.04)",
            borderRadius: 4,
            // We need position relative so the capture ref sits at (0,0)
            position: "relative",
          }}
        >
          {/*
           * The capture div is always rendered at its TRUE export size.
           * CSS transform scales it down visually without affecting the
           * underlying pixel dimensions that html2canvas will read.
           */}
          <div
            ref={captureRef}
            style={{
              width,
              height,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
              // Prevent scroll bars from appearing in the preview wrapper.
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {children}
          </div>
        </div>

        {/* ── Export button ── */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={exportPng}
            disabled={isExporting}
            aria-busy={isExporting}
            className={[
              "relative overflow-hidden",
              "px-7 py-3 rounded-full",
              "text-xs font-mono tracking-[0.18em] uppercase",
              "transition-all duration-300",
              "border",
              isExporting
                ? "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
                : status === "done"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : status === "error"
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-stone-900 border-stone-900 text-white hover:bg-stone-700",
            ].join(" ")}
          >
            {/* Shimmer sweep while exporting */}
            <AnimatePresence>
              {isExporting && (
                <motion.span
                  key="shimmer"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {statusLabel[status]}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Error detail */}
          <AnimatePresence>
            {status === "error" && errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-red-400 font-mono max-w-xs text-center"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Export dimension hint */}
          <p className="text-[10px] text-stone-400 font-mono">
            {width} × {height} px · {EXPORT_SCALE}× retina
          </p>
        </div>
      </div>
    );
  },
);

CanvasWrapper.displayName = "CanvasWrapper";
