type LogLevel = "debug" | "info" | "warn" | "error";

function ts(): string {
  return new Date().toISOString();
}

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const payload = meta ? { ...meta } : undefined;
    const line = payload ? { ts: ts(), level, message, ...payload } : { ts: ts(), level, message };
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](line);
  },
  debug(message: string, meta?: Record<string, unknown>) { this.log("debug", message, meta); },
  info(message: string, meta?: Record<string, unknown>) { this.log("info", message, meta); },
  warn(message: string, meta?: Record<string, unknown>) { this.log("warn", message, meta); },
  error(message: string, meta?: Record<string, unknown>) { this.log("error", message, meta); },
};
