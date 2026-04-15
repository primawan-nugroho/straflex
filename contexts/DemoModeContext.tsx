"use client";

/**
 * DemoModeContext
 * ---------------
 * Provides a global boolean that signals whether the app is running
 * with demo (mock) data instead of a live Strava OAuth session.
 *
 * Usage
 * -----
 *   // Wrap your root layout (or a subtree) with the provider:
 *   <DemoModeProvider>…</DemoModeProvider>
 *
 *   // Consume in any client component:
 *   const { isDemoMode, toggleDemoMode, activity } = useDemoMode();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEMO_ACTIVITY, type StravaActivity } from "@/lib/demo-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DemoModeContextValue {
  /** True when the user has chosen to preview with mock data. */
  isDemoMode: boolean;
  /** Toggle demo mode on / off. */
  toggleDemoMode: () => void;
  /**
   * The activity to render.
   * In demo mode this is always `DEMO_ACTIVITY`.
   * In live mode callers should inject the real activity here via
   * `setLiveActivity` after fetching from `/api/strava`.
   */
  activity: StravaActivity | null;
  /** Store the real Strava activity fetched from the API. */
  setLiveActivity: (activity: StravaActivity | null) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DemoModeProvider({
  children,
  defaultDemo = false,
}: {
  children: React.ReactNode;
  /**
   * When `true` the provider starts in demo mode.
   * Useful for the landing / introduction page that should always show
   * a preview without requiring OAuth.
   */
  defaultDemo?: boolean;
}) {
  const [isDemoMode, setIsDemoMode] = useState(defaultDemo);
  const [liveActivity, setLiveActivity] = useState<StravaActivity | null>(null);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => !prev);
  }, []);

  const activity = useMemo<StravaActivity | null>(
    () => (isDemoMode ? DEMO_ACTIVITY : liveActivity),
    [isDemoMode, liveActivity],
  );

  const value = useMemo<DemoModeContextValue>(
    () => ({ isDemoMode, toggleDemoMode, activity, setLiveActivity }),
    [isDemoMode, toggleDemoMode, activity],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDemoMode(): DemoModeContextValue {
  const ctx = useContext(DemoModeContext);
  if (!ctx) {
    throw new Error("useDemoMode must be used inside <DemoModeProvider>.");
  }
  return ctx;
}
