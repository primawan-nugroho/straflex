/**
 * Mock Strava activity object.
 * Mirrors the v3 Strava API DetailedActivity schema exactly so the
 * visualisation components see the same shape whether data is real or demo.
 *
 * Docs: https://developers.strava.com/docs/reference/#api-models-DetailedActivity
 */

export type StravaActivityType =
  | "Run"
  | "Ride"
  | "Swim"
  | "Walk"
  | "Hike"
  | "VirtualRide"
  | "Workout";

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  city: string;
  country: string;
}

export interface StravaMap {
  id: string;
  summary_polyline: string;
  resource_state: number;
}

export interface StravaLap {
  id: number;
  name: string;
  elapsed_time: number;   // seconds
  moving_time: number;    // seconds
  distance: number;       // metres
  average_speed: number;  // m/s
  max_speed: number;      // m/s
  average_heartrate?: number;
  max_heartrate?: number;
  lap_index: number;
  split: number;
}

/** Subset of the Strava DetailedActivity used across Straflex. */
export interface StravaActivity {
  id: number;
  name: string;
  type: StravaActivityType;
  sport_type: string;
  start_date: string;          // ISO-8601
  start_date_local: string;    // ISO-8601
  timezone: string;

  // Distance / time
  distance: number;            // metres
  moving_time: number;         // seconds
  elapsed_time: number;        // seconds

  // Elevation
  total_elevation_gain: number;  // metres
  elev_high: number;
  elev_low: number;

  // Speed
  average_speed: number;  // m/s
  max_speed: number;       // m/s

  // Heart rate (optional – device may not have sensor)
  has_heartrate: boolean;
  average_heartrate?: number;  // bpm
  max_heartrate?: number;      // bpm

  // Cadence
  average_cadence?: number;    // rpm (running: steps/min ÷ 2)

  // Power (cycling)
  average_watts?: number;
  weighted_average_watts?: number;
  max_watts?: number;
  kilojoules?: number;

  // Kudos / social
  kudos_count: number;
  comment_count: number;
  athlete_count: number;

  // Athlete
  athlete: StravaAthlete;

  // Map
  map: StravaMap;

  // Splits (1 km or 1 mi)
  splits_metric: Array<{
    distance: number;
    elapsed_time: number;
    elevation_difference: number;
    moving_time: number;
    split: number;
    average_speed: number;
    pace_zone: number;
  }>;

  laps: StravaLap[];

  // Misc
  description: string;
  calories: number;
  suffer_score: number | null;
  achievement_count: number;
  pr_count: number;
  gear_id: string | null;
  commute: boolean;
  trainer: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  visibility: "everyone" | "followers_only" | "only_me";
}

// ---------------------------------------------------------------------------
// Demo payload
// ---------------------------------------------------------------------------

export const DEMO_ACTIVITY: StravaActivity = {
  id: 99999999,
  name: "Morning Tempo on the Promenade",
  type: "Run",
  sport_type: "Run",
  start_date: "2025-04-12T05:34:00Z",
  start_date_local: "2025-04-12T06:34:00+01:00",
  timezone: "(GMT+01:00) Europe/London",

  distance: 10_243,           // 10.24 km
  moving_time: 2_618,         // 43 min 38 s
  elapsed_time: 2_741,

  total_elevation_gain: 48,
  elev_high: 37,
  elev_low: 2,

  average_speed: 3.91,        // ~4:16 /km
  max_speed: 5.12,

  has_heartrate: true,
  average_heartrate: 163,
  max_heartrate: 178,

  average_cadence: 88,

  kudos_count: 24,
  comment_count: 3,
  athlete_count: 1,

  athlete: {
    id: 1234567,
    firstname: "Alex",
    lastname: "Mercer",
    profile_medium: "https://dgalywyr863hv.cloudfront.net/pictures/athletes/demo.jpg",
    city: "London",
    country: "United Kingdom",
  },

  map: {
    id: "a99999999",
    // Encoded polyline approximating a Thames-side loop (demo – not precise)
    summary_polyline:
      "sviyH~cWKJEBG@GBIDKHMHIJILINKLJ DJFHFLFL@NBPBND",
    resource_state: 2,
  },

  splits_metric: [
    { distance: 1000, elapsed_time: 262, elevation_difference:  2, moving_time: 258, split: 1, average_speed: 3.88, pace_zone: 3 },
    { distance: 1000, elapsed_time: 258, elevation_difference:  5, moving_time: 255, split: 2, average_speed: 3.92, pace_zone: 3 },
    { distance: 1000, elapsed_time: 255, elevation_difference: -3, moving_time: 252, split: 3, average_speed: 3.97, pace_zone: 4 },
    { distance: 1000, elapsed_time: 260, elevation_difference:  1, moving_time: 257, split: 4, average_speed: 3.89, pace_zone: 3 },
    { distance: 1000, elapsed_time: 257, elevation_difference:  4, moving_time: 254, split: 5, average_speed: 3.94, pace_zone: 4 },
    { distance: 1000, elapsed_time: 253, elevation_difference: -2, moving_time: 250, split: 6, average_speed: 4.00, pace_zone: 4 },
    { distance: 1000, elapsed_time: 259, elevation_difference:  3, moving_time: 256, split: 7, average_speed: 3.91, pace_zone: 3 },
    { distance: 1000, elapsed_time: 254, elevation_difference: -4, moving_time: 251, split: 8, average_speed: 3.98, pace_zone: 4 },
    { distance: 1000, elapsed_time: 256, elevation_difference:  6, moving_time: 253, split: 9, average_speed: 3.95, pace_zone: 4 },
    { distance:  243, elapsed_time:  67, elevation_difference:  2, moving_time:  65, split: 10, average_speed: 3.74, pace_zone: 3 },
  ],

  laps: [
    {
      id: 1,
      name: "Lap 1",
      elapsed_time: 1320,
      moving_time: 1310,
      distance: 5050,
      average_speed: 3.86,
      max_speed: 4.80,
      average_heartrate: 159,
      max_heartrate: 170,
      lap_index: 1,
      split: 1,
    },
    {
      id: 2,
      name: "Lap 2",
      elapsed_time: 1421,
      moving_time: 1308,
      distance: 5193,
      average_speed: 3.97,
      max_speed: 5.12,
      average_heartrate: 167,
      max_heartrate: 178,
      lap_index: 2,
      split: 2,
    },
  ],

  description: "Felt strong through the back half. HR stayed controlled on the bridge climb. Demo activity — connect Strava for real data.",
  calories: 672,
  suffer_score: 68,
  achievement_count: 3,
  pr_count: 1,
  gear_id: null,

  commute: false,
  trainer: false,
  manual: false,
  private: false,
  flagged: false,
  visibility: "everyone",
};

// ---------------------------------------------------------------------------
// Derived helpers (reused across viz components)
// ---------------------------------------------------------------------------

/** Seconds → "MM:SS /km" pace string */
export function secondsPerKmToPaceString(mps: number): string {
  const secsPerKm = 1000 / mps;
  const mins = Math.floor(secsPerKm / 60);
  const secs = Math.round(secsPerKm % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/** Seconds → "H:MM:SS" or "MM:SS" duration string */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Metres → "X.XX km" */
export function formatKm(metres: number): string {
  return (metres / 1000).toFixed(2) + " km";
}
