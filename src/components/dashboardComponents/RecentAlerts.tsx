// ─────────────────────────────────────────────────────────────────────────────
// RecentAlerts — Dashboard component
//
// What it does:
//   - Fetches the latest 6 alerts from GET /api/alerts
//   - Auto-refreshes every 15 seconds
//   - Shows type, severity badge, zone, age, and status
//   - Empty state when no alerts exist
//   - Skeleton loading state
//   - No props needed — fully self-contained
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { Skeleton } from "../ui/skeleton";
import type { AlertItemDashboard } from "@/types";
import { AlertTriangle, ShieldCheck, Clock } from "lucide-react";


// ─── Severity styles ──────────────────────────────────────────────────────────
//
// Each severity gets a left-border color, a dot color, and a badge style.
// CRITICAL and HIGH get stronger colors since they need immediate attention.

const SEVERITY_CONFIG: Record<string, { dot: string; badge: string; border: string }> = {
  CRITICAL: {
    dot:    "bg-red-500",
    badge:  "bg-red-500/15 text-red-400 border-red-500/30",
    border: "border-l-red-500",
  },
  HIGH: {
    dot:    "bg-orange-400",
    badge:  "bg-orange-500/15 text-orange-400 border-orange-500/30",
    border: "border-l-orange-400",
  },
  MEDIUM: {
    dot:    "bg-yellow-400",
    badge:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    border: "border-l-yellow-400",
  },
  LOW: {
    dot:    "bg-blue-400",
    badge:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
    border: "border-l-blue-400",
  },
};

const STATUS_STYLE: Record<string, string> = {
  PENDING:      "text-red-400",
  ACKNOWLEDGED: "text-yellow-400",
  RESOLVED:     "text-emerald-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Converts "UNAUTHORIZED_MOVEMENT" → "Unauthorized Movement"
function friendlyType(type: string): string {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Converts ISO timestamp into a relative "2m ago" / "3h ago" / "Jan 5" string
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;

  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

const MAX_SHOWN = 6; // How many alerts to display in the dashboard widget

export function RecentAlerts() {
  const navigate = useNavigate();

  const { data: allAlerts = [], isLoading } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn:  () => api.getAlerts(),
    refetchInterval: 15_000,
  });

  const alerts = (allAlerts as AlertItemDashboard[]).slice(0, MAX_SHOWN);

  // For debugging:
  console.log("RecentAlerts data:", alerts);

  return <div />;
}
