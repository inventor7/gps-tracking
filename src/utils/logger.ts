import { useEnv } from "@/composables/useEnv";

interface LoggerOptions {
  enabled?: boolean;
  prefix?: string;
  level?: "debug" | "info" | "warn" | "error";
}

class Logger {
  private enabled: boolean;
  private prefix: string;
  private level: string;

  constructor(options: LoggerOptions = {}) {
    const env = useEnv();
    this.enabled = options.enabled ?? env.ENABLE_DEBUG_LOGGING;
    this.prefix = options.prefix ?? "";
    this.level = options.level ?? "debug";
  }

  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}]${this.prefix ? ` [${this.prefix}]` : ""} ${message}`;
  }

  debug(message: string, ...args: any[]) {
    return;
    if (!this.enabled || this.level !== "debug") return;
    console.debug(this.formatMessage(message), ...args);
  }

  info(message: string, ...args: any[]) {
    if (!this.enabled) return;
    console.info(this.formatMessage(message), ...args);
  }

  warn(message: string, ...args: any[]) {
    if (!this.enabled) return;
    console.warn(this.formatMessage(message), ...args);
  }

  error(message: string, ...args: any[]) {
    // Always log errors regardless of enabled state
    console.error(this.formatMessage(message), ...args);
  }

  group(label: string) {
    if (!this.enabled) return;
    console.group(this.formatMessage(label));
  }

  groupEnd() {
    if (!this.enabled) return;
    console.groupEnd();
  }
}

export function createLogger(
  prefix: string,
  options: Omit<LoggerOptions, "prefix"> = {}
) {
  return new Logger({ ...options, prefix });
}

// Create application-wide logger instance
export const logger = createLogger("App");
