import type { AnimationEasing } from "@/utils/markerAnimation";

interface EnvConfig {
  // API Configuration
  API_BASE_URL: string;
  API_ACCESS_TOKEN: string;
  API_TIMEOUT: string;
  API_RETRY_COUNT: string;

  // Map Configuration
  GOOGLE_MAPS_API_KEY: string;
  MAP_DEFAULT_CENTER_LAT: string;
  MAP_DEFAULT_CENTER_LNG: string;
  MAP_DEFAULT_ZOOM: string;

  // Update Intervals
  UPDATE_INTERVAL: number;
  POSITION_REFRESH_RATE: string;

  // Debug Configuration
  ENABLE_DEBUG_FEATURES: string;
  ENABLE_DEBUG_LOGGING: boolean;
  DEBUG_LOG_LEVEL: "debug" | "info" | "warn" | "error";
  DEBUG_REFRESH_INTERVAL: string;

  // Path Visualization
  PATH_MAX_POINTS: string;
  PATH_FADE_DURATION: string;
  PATH_LINE_COLOR: string;
  PATH_LINE_OPACITY: string;

  // Performance Monitoring
  ENABLE_PERFORMANCE_MONITORING: string;
  PERFORMANCE_SAMPLE_RATE: string;
  MAX_PERFORMANCE_ENTRIES: string;

  // Animation Configuration
  MARKER_ANIMATION_DURATION: number;
  MARKER_ANIMATION_EASING: AnimationEasing;
  ENABLE_ANIMATION_DEBUG: string;
}

export function useEnv(): EnvConfig {
  const env = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_ACCESS_TOKEN: import.meta.env.VITE_API_ACCESS_TOKEN,
    API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || "5000",
    API_RETRY_COUNT: import.meta.env.VITE_API_RETRY_COUNT || "3",

    // Map Configuration
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API || "",
    MAP_DEFAULT_CENTER_LAT:
      import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT || "48.8566",
    MAP_DEFAULT_CENTER_LNG:
      import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG || "2.3522",
    MAP_DEFAULT_ZOOM: import.meta.env.VITE_MAP_DEFAULT_ZOOM || "12",

    // Update Intervals
    UPDATE_INTERVAL: import.meta.env.VITE_UPDATE_INTERVAL || "5000",
    POSITION_REFRESH_RATE: import.meta.env.VITE_POSITION_REFRESH_RATE || "1000",

    // Debug Configuration
    ENABLE_DEBUG_FEATURES: import.meta.env.VITE_ENABLE_DEBUG_FEATURES || "true",
    ENABLE_DEBUG_LOGGING: import.meta.env.VITE_ENABLE_DEBUG_LOGGING || "true",
    DEBUG_LOG_LEVEL: (import.meta.env.VITE_DEBUG_LOG_LEVEL ||
      "debug") as EnvConfig["DEBUG_LOG_LEVEL"],
    DEBUG_REFRESH_INTERVAL:
      import.meta.env.VITE_DEBUG_REFRESH_INTERVAL || "1000",

    // Path Visualization
    PATH_MAX_POINTS: import.meta.env.VITE_PATH_MAX_POINTS || "100",
    PATH_FADE_DURATION: import.meta.env.VITE_PATH_FADE_DURATION || "5000",
    PATH_LINE_COLOR: import.meta.env.VITE_PATH_LINE_COLOR || "#4CAF50",
    PATH_LINE_OPACITY: import.meta.env.VITE_PATH_LINE_OPACITY || "0.6",

    // Performance Monitoring
    ENABLE_PERFORMANCE_MONITORING:
      import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING || "true",
    PERFORMANCE_SAMPLE_RATE:
      import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || "100",
    MAX_PERFORMANCE_ENTRIES:
      import.meta.env.VITE_MAX_PERFORMANCE_ENTRIES || "1000",

    // Animation Configuration
    MARKER_ANIMATION_DURATION:
      import.meta.env.VITE_MARKER_ANIMATION_DURATION || "300",
    MARKER_ANIMATION_EASING: (import.meta.env.VITE_MARKER_ANIMATION_EASING ||
      "easeInOut") as EnvConfig["MARKER_ANIMATION_EASING"],
    ENABLE_ANIMATION_DEBUG:
      import.meta.env.VITE_ENABLE_ANIMATION_DEBUG || "true",
  } satisfies EnvConfig;

  return env;
}

/**
 * Helper function to parse environmental boolean values
 */
export function envBool(value: string): boolean {
  return value.toLowerCase() === "true";
}

/**
 * Helper function to parse environmental numeric values
 */
export function envNumber(value: string, fallback: number): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Export the type for use in other files
export type { EnvConfig };
