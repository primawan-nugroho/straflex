"use client";

/**
 * app/studio/page.tsx  –  Usage example
 * -----------------------------------------------
 * This file shows how CanvasWrapper, DemoModeProvider, and DemoToggle
 * wire together on the Studio page. Replace the placeholder
 * <EditorialCard> with your real visualization component.
 *
 * NOTE: This is a REFERENCE file — copy the relevant parts into your
 * actual app/studio/page.tsx and flesh out the real card component.
 */

import { useRef } from "react";
import { DemoModeProvider, useDemoMode } from "@/contexts/DemoModeContext";
import { DemoToggle } from "@/components/ui/DemoToggle";
import { CanvasWrapper, type CanvasWrapperHandle } from "@/components/viz/CanvasWrapper";

// ---------------------------------------------------------------------------
// Placeholder card – swap this with the real viz component
// ---------------------------------------------------------------------------
function PlaceholderCard() {
  const { activity, isDemoMode } = useDemoMode();

  if (!activity) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-400 font-mono text-sm">
        No activity loaded.
      </div>
    );
  }

  return (
    <div
      // IMPORTANT: no CSS `filter` on this root — html2canvas can't render it.
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)",
        fontFamily: "'Playfair Display', Georgia, serif",
        color: "#f5f0e8",
        padding: 80,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {isDemoMode && (
        <span
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c9a84c",
            fontFamily: "monospace",
          }}
        >
          Demo
        </span>
      )}

      <div>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", marginBottom: 16, fontFamily: "monospace" }}>
          {activity.type} · {new Date(activity.start_date_local).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
          {activity.name}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
        {[
          { label: "Distance", value: (activity.distance / 1000).toFixed(2) + " km" },
          { label: "Time",     value: `${Math.floor(activity.moving_time / 60)}:${String(activity.moving_time % 60).padStart(2,"0")}` },
          { label: "Avg HR",   value: activity.average_heartrate ? `${activity.average_heartrate} bpm` : "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#666", margin: "0 0 6px", fontFamily: "monospace" }}>{label}</p>
            <p style={{ fontSize: 32, fontWeight: 400, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Studio inner – needs to be a child of DemoModeProvider to access context
// ---------------------------------------------------------------------------
function StudioInner() {
  const canvasRef = useRef<CanvasWrapperHandle>(null);

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col items-center py-12 px-4 gap-8">
      {/* Top bar */}
      <header className="w-full max-w-3xl flex items-center justify-between">
        <span className="font-mono text-xs tracking-widest uppercase text-stone-500">
          Straflex Studio
        </span>
        <DemoToggle />
      </header>

      {/* Canvas preview + export */}
      <CanvasWrapper
        ref={canvasRef}
        width={1080}
        height={1080}
        filename="straflex-editorial"
        previewScale={0.46}
      >
        <PlaceholderCard />
      </CanvasWrapper>

      {/*
       * Optional: trigger export from elsewhere (e.g. a floating action button)
       *
       *   <button onClick={() => canvasRef.current?.exportPng()}>
       *     Export from toolbar
       *   </button>
       */}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page export – wraps everything in the provider
// ---------------------------------------------------------------------------
export default function StudioPage() {
  return (
    // defaultDemo={true} means first-time visitors always see content
    // without having to connect Strava first.
    <DemoModeProvider defaultDemo={true}>
      <StudioInner />
    </DemoModeProvider>
  );
}
