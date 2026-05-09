type LogLevel = "info" | "warn" | "error";

interface PipelineLogEntry {
  level: LogLevel;
  projectId: string;
  agent?: string;
  status?: string;
  durationMs?: number;
  tokenCount?: number;
  amount?: number;
  reason?: string;
  message: string;
  error?: string;
  timestamp: string;
}

function log(level: LogLevel, entry: Omit<PipelineLogEntry, "level" | "timestamp">): void {
  const record: PipelineLogEntry = {
    level,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  // Structured JSON for Cloud Logging ingestion
  console.log(JSON.stringify(record));
}

export const pipelineLogger = {
  info: (entry: Omit<PipelineLogEntry, "level" | "timestamp">) => log("info", entry),
  warn: (entry: Omit<PipelineLogEntry, "level" | "timestamp">) => log("warn", entry),
  error: (entry: Omit<PipelineLogEntry, "level" | "timestamp">) => log("error", entry),
};
