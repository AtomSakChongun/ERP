// Formatting shared by every feature.

/** 510 → "8h 30m" */
export const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
