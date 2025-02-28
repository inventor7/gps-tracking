import { createLogger } from "./logger";

const logger = createLogger("Performance");

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private thresholds: Map<string, number> = new Map();

  constructor() {
    // Default thresholds in milliseconds
    this.setThreshold("marker-creation", 50);
    this.setThreshold("position-update", 16); // ~1 frame at 60fps
    this.setThreshold("map-pan", 300);
    this.setThreshold("api-request", 1000);
  }

  start(name: string, metadata?: Record<string, any>) {
    const startTime = globalThis.performance.now();
    this.metrics.set(name, { name, startTime, metadata });
    logger.debug(`Starting measurement: ${name}`, metadata);
  }

  end(name: string, additionalMetadata?: Record<string, any>) {
    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`No measurement found for: ${name}`);
      return;
    }

    const endTime = globalThis.performance.now();
    const duration = endTime - metric.startTime;

    const updatedMetric = {
      ...metric,
      endTime,
      duration,
      metadata: { ...metric.metadata, ...additionalMetadata },
    };

    this.metrics.set(name, updatedMetric);

    // Check threshold
    const threshold = this.thresholds.get(name);
    if (threshold && duration > threshold) {
      logger.warn(`Performance threshold exceeded for ${name}:`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
        metadata: updatedMetric.metadata,
      });
    } else {
      logger.debug(`Measurement complete for ${name}:`, {
        duration: `${duration.toFixed(2)}ms`,
        metadata: updatedMetric.metadata,
      });
    }

    return duration;
  }

  setThreshold(name: string, threshold: number) {
    this.thresholds.set(name, threshold);
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  clear() {
    this.metrics.clear();
  }

  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error });
      throw error;
    }
  }

  async *batchMeasure<T>(
    name: string,
    items: T[],
    fn: (item: T) => Promise<void>,
    batchSize: number = 10
  ) {
    const batches = Math.ceil(items.length / batchSize);
    logger.debug(`Starting batch operation: ${name}`, {
      totalItems: items.length,
      batchSize,
      totalBatches: batches,
    });

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      this.start(`${name}-batch-${batchNumber}`, {
        batchNumber,
        itemCount: batch.length,
      });

      await Promise.all(batch.map(fn));

      const duration = this.end(`${name}-batch-${batchNumber}`);
      yield {
        batchNumber,
        itemCount: batch.length,
        duration,
      };
    }

    logger.debug(`Batch operation complete: ${name}`);
  }
}

// Create and export singleton instance
export const performanceTracker = new PerformanceTracker();
