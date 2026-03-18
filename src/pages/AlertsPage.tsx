// ─────────────────────────────────────────────────────────────────────────────
// ALERTS PAGE — Assigned to: Member 4 - Pulindu
// TODO M4: Build the Alerts page UI and integrate with backend API to show real alerts.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { fmtRelative, fmtDateTime } from "../lib/utils";
import type { Alert } from "../types";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Bell, ShieldAlert, CheckCircle2, Clock, RotateCcw, Filter, MapPin } from "lucide-react";

// ── Severity helpers ──────────────────────────────────────────────────────────

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-500/15 text-red-400 border-red-500/30",
  HIGH:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MEDIUM:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  LOW:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:      "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  ACKNOWLEDGED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  RESOLVED:     "bg-green-500/15 text-green-400 border-green-500/30",
};

const SEVERITY_ACCENT: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH:     "#f97316",
  MEDIUM:   "#eab308",
  LOW:      "#3b82f6",
};

const ALERT_TYPE_LABEL: Record<string, string> = {
  UNAUTHORIZED_MOVEMENT: "Unauthorized Movement",
  TAG_MISMATCH:          "Tag Mismatch",
  OFFLINE_READ:          "Offline Read",
  SYNC_FAILURE:          "Sync Failure",
};

// ── Status filter tabs ────────────────────────────────────────────────────────

const STATUS_FILTERS = ["ALL", "PENDING", "ACKNOWLEDGED", "RESOLVED"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

// ── Alert row component ───────────────────────────────────────────────────────

function AlertRow({
  alert,
  onAcknowledge,
  onResolve,
  isActing,
}: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  isActing: boolean;
}) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      {/* Severity indicator */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${SEVERITY_COLOR[alert.severity] ?? ""}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: SEVERITY_ACCENT[alert.severity] ?? "#888" }}
          />
          {alert.severity}
        </span>
      </td>

      {/* Alert type */}
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType}
      </td>

      {/* Message */}
      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate">
        {alert.message ?? "—"}
      </td>

      {/* Zone */}
      <td className="px-4 py-3">
        {alert.zoneName ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-white/10 bg-white/5 text-foreground">
            <MapPin size={10} className="text-orange-400" />
            {alert.zoneName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLOR[alert.alertStatus] ?? ""}`}
        >
          {alert.alertStatus}
        </span>
      </td>

      {/* Time */}
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        <span title={fmtDateTime(alert.createdAt)}>{fmtRelative(alert.createdAt)}</span>
      </td>

      {/* Resolved by */}
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {alert.resolvedByUsername ?? "—"}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {alert.alertStatus === "PENDING" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              disabled={isActing}
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          )}
          {alert.alertStatus !== "RESOLVED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2 border-green-500/30 text-green-400 hover:bg-green-500/10"
              disabled={isActing}
              onClick={() => onResolve(alert.id)}
            >
              Resolve
            </Button>
          )}
          {alert.alertStatus === "RESOLVED" && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Resolved
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function AlertsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [zoneFilter, setZoneFilter]     = useState<string>("ALL");

  // Fetch all alerts (re-poll every 15 s so new alerts appear automatically)
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.alerts.all,
    queryFn:  () => api.getAlerts(),
    refetchInterval: 15_000,
  });

  // Fetch zones to populate the zone filter dropdown
  const { data: zones = [] } = useQuery({
    queryKey: QUERY_KEYS.zones.all,
    queryFn:  api.getZones,
  });

  // Acknowledge mutation
  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => api.acknowledgeAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.all }),
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.resolveAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.all }),
  });

  const isActing = acknowledgeMutation.isPending || resolveMutation.isPending;

  // ── Derived stats (always from the full list) ─────────────────────────────
  const total    = alerts.length;
  const pending  = alerts.filter(a => a.alertStatus === "PENDING").length;
  const critical = alerts.filter(a => a.severity === "CRITICAL" && a.alertStatus !== "RESOLVED").length;
  const resolved = alerts.filter(a => a.alertStatus === "RESOLVED").length;

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const filtered = alerts.filter(a => {
    if (statusFilter !== "ALL" && a.alertStatus !== statusFilter) return false;
    if (zoneFilter   !== "ALL" && a.zoneId !== zoneFilter)        return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
    const statusOrder   = ["PENDING", "ACKNOWLEDGED", "RESOLVED"];
    const sA = statusOrder.indexOf(a.alertStatus);
    const sB = statusOrder.indexOf(b.alertStatus);
    if (sA !== sB) return sA - sB;
    const svA = severityOrder.indexOf(a.severity);
    const svB = severityOrder.indexOf(b.severity);
    if (svA !== svB) return svA - svB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <PageHeader
        title="Alerts"
        subtitle={`${pending} pending · ${total} total`}
      >
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCcw size={16} style={{ marginRight: 6 }} />Refresh
        </Button>
      </PageHeader>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Total Alerts"
              value={total}
              icon={<Bell size={20} />}
              accentColor="#576A8F"
              subtitle="all time"
            />
            <StatCard
              label="Pending"
              value={pending}
              icon={<Clock size={20} />}
              accentColor={pending > 0 ? "#eab308" : "#10b981"}
              subtitle="awaiting action"
            />
            <StatCard
              label="Critical"
              value={critical}
              icon={<ShieldAlert size={20} />}
              accentColor={critical > 0 ? "#ef4444" : "#10b981"}
              subtitle="unresolved critical"
            />
            <StatCard
              label="Resolved"
              value={resolved}
              icon={<CheckCircle2 size={20} />}
              accentColor="#10b981"
              subtitle="handled"
            />
          </>
        )}
      </div>

      {/* ── Alert table ────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">

        {/* Table toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Status</span>
            <div className="flex items-center gap-1 ml-1">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === f
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "text-muted-foreground hover:bg-muted border border-transparent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Zone filter */}
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Zone</span>
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="ml-1 h-7 rounded-md border border-border bg-muted text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="ALL">All Zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Severity</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Zone</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resolved by</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                    No alerts found{statusFilter !== "ALL" || zoneFilter !== "ALL" ? " for the selected filters" : ""}.
                  </td>
                </tr>
              ) : (
                sorted.map(alert => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={id => acknowledgeMutation.mutate(id)}
                    onResolve={id => resolveMutation.mutate(id)}
                    isActing={isActing}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && sorted.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
            Showing {sorted.length} of {total} alert{total !== 1 ? "s" : ""}
            {(statusFilter !== "ALL" || zoneFilter !== "ALL") ? " · filtered" : ""}
          </div>
        )}
      </div>
    </>
  );
}
