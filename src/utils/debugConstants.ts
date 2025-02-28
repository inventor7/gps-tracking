/**
 * Debug configuration constants
 */

export const DEBUG_THRESHOLDS = {
  PERFORMANCE: {
    GOOD: 50, // milliseconds
    FAIR: 100, // milliseconds
    POOR: 150, // milliseconds
    CRITICAL: 200, // milliseconds
  },

  ANIMATION: {
    MIN_FPS: 30,
    TARGET_FPS: 60,
    FRAME_BUDGET: 16.67, // ms (1000/60)
    MAX_FRAME_TIME: 33.33, // ms (1000/30)
  },

  MAP: {
    MAX_MARKERS: 500,
    MAX_VISIBLE_MARKERS: 100,
    MAX_ANIMATED_MARKERS: 50,
    MAX_PATH_POINTS: 1000,
  },

  UPDATE_RATES: {
    PERFORMANCE_METRICS: 1000, // 1 second
    ANIMATION_STATS: 100, // 100ms
    MAP_HEALTH: 2000, // 2 seconds
    DEBUG_PANEL: 500, // 500ms
  },

  LOGGING: {
    MAX_ENTRIES: 1000,
    MAX_AGE: 5 * 60 * 1000, // 5 minutes
    FLUSH_THRESHOLD: 100,
  },
} as const;

/**
 * Visual configuration for debug elements
 */
export const DEBUG_STYLES = {
  COLORS: {
    GOOD: "#10B981", // green-500
    FAIR: "#F59E0B", // yellow-500
    POOR: "#EF4444", // red-500
    CRITICAL: "#7C3AED", // purple-600
  },

  OPACITY: {
    PANEL: 0.8,
    OVERLAY: 0.3,
    HIGHLIGHT: 0.6,
  },

  SIZES: {
    PANEL_WIDTH: 400,
    PANEL_HEIGHT: "90vh",
    METRIC_BAR_HEIGHT: 6,
    ICON_SIZE: 16,
  },

  Z_INDEX: {
    DEBUG_BASE: 9000,
    OVERLAY: 9500,
    TOOLTIP: 9600,
    MODAL: 9700,
  },
} as const;

/**
 * Debug feature flags
 */
export const DEBUG_FEATURES = {
  PERFORMANCE_MONITORING: true,
  ANIMATION_DEBUG: true,
  MAP_DEBUG: true,
  PATH_VISUALIZATION: true,
  DETAILED_LOGGING: true,
  PROFILER: true,
  ERROR_BOUNDARIES: true,
  STATE_INSPECTOR: true,
} as const;

/**
 * Debug panel configurations
 */
export const DEBUG_PANELS = {
  PERFORMANCE: {
    defaultMetrics: [
      "map-initialization",
      "marker-animation",
      "positions-update",
      "actor-markers-creation",
    ],
    maxMetrics: 10,
    refreshInterval: 500,
  },

  ANIMATION: {
    maxTrackedAnimations: 20,
    samplingRate: 100,
    retentionPeriod: 5000,
  },

  MAP: {
    statusRefreshRate: 1000,
    maxStoredPaths: 50,
    pathRetentionTime: 30000,
  },
} as const;

// Export types for type safety
export type DebugThresholds = typeof DEBUG_THRESHOLDS;
export type DebugStyles = typeof DEBUG_STYLES;
export type DebugFeatures = typeof DEBUG_FEATURES;
export type DebugPanels = typeof DEBUG_PANELS;
