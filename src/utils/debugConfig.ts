import { useEnv } from "@/composables/useEnv";

interface DebugConfig {
  enabled: boolean;
  visualizations: {
    paths: boolean;
    performanceMetrics: boolean;
    markers: boolean;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    includeTimestamps: boolean;
    includeMetrics: boolean;
  };
  performance: {
    trackAnimations: boolean;
    trackMarkerUpdates: boolean;
    trackPathCalculations: boolean;
  };
  autoRefresh: {
    enabled: boolean;
    interval: number;
  };
}

class DebugConfiguration {
  private config: DebugConfig;

  constructor() {
    const env = useEnv();

    this.config = {
      enabled: import.meta.env.DEV && env.ENABLE_DEBUG_FEATURES !== "false",
      visualizations: {
        paths: true,
        performanceMetrics: true,
        markers: true,
      },
      logging: {
        level: (env.DEBUG_LOG_LEVEL || "debug") as
          | "debug"
          | "info"
          | "warn"
          | "error",
        includeTimestamps: true,
        includeMetrics: true,
      },
      performance: {
        trackAnimations: true,
        trackMarkerUpdates: true,
        trackPathCalculations: true,
      },
      autoRefresh: {
        enabled: true,
        interval: Number(env.DEBUG_REFRESH_INTERVAL) || 1000,
      },
    };
  }

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get visualizations(): DebugConfig["visualizations"] {
    return this.config.visualizations;
  }

  get logging(): DebugConfig["logging"] {
    return this.config.logging;
  }

  get performance(): DebugConfig["performance"] {
    return this.config.performance;
  }

  get autoRefresh(): DebugConfig["autoRefresh"] {
    return this.config.autoRefresh;
  }

  enable() {
    this.config.enabled = true;
  }

  disable() {
    this.config.enabled = false;
  }

  setVisualization(key: keyof DebugConfig["visualizations"], value: boolean) {
    this.config.visualizations[key] = value;
  }

  setLogging(level: DebugConfig["logging"]["level"]) {
    this.config.logging.level = level;
  }

  setPerformanceTracking(
    key: keyof DebugConfig["performance"],
    value: boolean
  ) {
    this.config.performance[key] = value;
  }

  setAutoRefresh(enabled: boolean, interval?: number) {
    this.config.autoRefresh.enabled = enabled;
    if (interval) {
      this.config.autoRefresh.interval = interval;
    }
  }

  enableAll() {
    this.config.enabled = true;
    Object.keys(this.config.visualizations).forEach((key) => {
      this.config.visualizations[
        key as keyof typeof this.config.visualizations
      ] = true;
    });
    Object.keys(this.config.performance).forEach((key) => {
      this.config.performance[key as keyof typeof this.config.performance] =
        true;
    });
  }

  disableAll() {
    this.config.enabled = false;
    Object.keys(this.config.visualizations).forEach((key) => {
      this.config.visualizations[
        key as keyof typeof this.config.visualizations
      ] = false;
    });
    Object.keys(this.config.performance).forEach((key) => {
      this.config.performance[key as keyof typeof this.config.performance] =
        false;
    });
  }

  getConfig(): Readonly<DebugConfig> {
    return Object.freeze({ ...this.config });
  }
}

// Create and export singleton instance
export const debugConfig = new DebugConfiguration();

// Export type for use in other files
export type { DebugConfig };
