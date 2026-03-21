// ─────────────────────────────────────────────────────────────────────────────
// Zone colors — Assigned to: Member 3 - Aatif
//
// Implementing a complicated color assignment algorithm
// This is a dynamic zone color system that assigns colors to zone names automatically
// This works with any zone name from the backend and no hardcoding is needed
// ─────────────────────────────────────────────────────────────────────────────


const ZONE_COLORS = [
  "#f97316", // orange
  "#6366f1", // indigo
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
];

// Generating a consistent color for a zone name by hashing the name
export function getZoneColor(zoneName: string): string {
  let hash = 0;
  for (let i = 0; i < zoneName.length; i++) {
    hash = zoneName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ZONE_COLORS.length;
  return ZONE_COLORS[index];
}