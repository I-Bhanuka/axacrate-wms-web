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
import { ArrowRight , ShieldCheck, Clock } from "lucide-react";


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

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-4 space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-2 w-2 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 py-10 text-white/20">
        <ShieldCheck size={28} className="text-emerald-500/40" />
        <p className="text-xs font-medium">No alerts — all systems clear</p>
      </div>
    );
  }

  
  // ── Alert list ─────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="divide-y divide-white/[0.04]">
        {alerts.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.LOW;
          const isPending = alert.alertStatus === "PENDING";

          return (
            <div
              key={alert.id}
              className={`
                flex items-start gap-3 px-4 py-3
                border-l-2 ${cfg.border}
                ${isPending ? "bg-white/[0.015]" : ""}
                transition-colors hover:bg-white/[0.025] cursor-default
              `}
            >
              {/* Severity dot */}
              <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />

              {/* Main content */}
              <div className="flex-1 min-w-0">

                {/* Top row: type name + severity badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-medium text-white/75 truncate">
                    {friendlyType(alert.alertType)}
                  </span>
                  <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>
                    {alert.severity}
                  </span>
                  {isPending && (
                    <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 bg-red-500/15 text-red-400 border-red-500/30">
                      PENDING
                    </span>
                  )}
                </div>

                {/* Message — truncated to one line */}
                {alert.message && (
                  <p className="text-[11px] text-white/35 mt-0.5 truncate">
                    {alert.message}
                  </p>
                )}

              </div>

              {/* Right side: zone + time */}
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                {alert.zoneName && (
                  <span className="text-[10px] text-white/30 font-medium truncate max-w-[80px]">
                    {alert.zoneName}
                  </span>
                )}
                <span className="text-[10px] text-white/20 flex items-center gap-1">
                  <Clock size={9} />
                  {timeAgo(alert.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>


      {/* Footer: total count + link to full alerts page */}
      <div
        className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => navigate("/alerts")}
      >
        <span className="text-[11px] text-white/25">
          {(allAlerts as AlertItemDashboard[]).length} total alerts
        </span>
        <span className="text-[11px] text-orange-400/70 hover:text-orange-400 transition-colors font-medium">
          View all <ArrowRight size={12} className="inline-block ml-1" />
        </span>
      </div>

    </div>
  );
}
