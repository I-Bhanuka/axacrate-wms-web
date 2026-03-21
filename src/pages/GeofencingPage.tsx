// ─────────────────────────────────────────────────────────────────────────────
// GEOFENCE PAGE
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import type { WorkflowRule } from "../api/http";
import type { Alert, ZoneStatus } from "../types";
import { QUERY_KEYS } from "../lib/queryClient";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { SectionHeader } from "../components/dashboardComponents/SectionHeader";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ZONE_ORDER = [
  "UNLOADING_ZONE",
  "WRITER_ZONE",
  "QC_ZONE",
  "STORAGE_ZONE",
  "DISPATCH_ZONE",
] as const;

const ZONE_LABELS: Record<string, string> = {
  UNLOADING_ZONE: "Unloading",
  WRITER_ZONE:    "Tag Writing",
  QC_ZONE:        "QC",
  STORAGE_ZONE:   "Storage",
  DISPATCH_ZONE:  "Dispatch",
};

const GEOFENCE_ALERT_TYPES = new Set([
  "UNAUTHORIZED_MOVEMENT",
  "WORKFLOW_VIOLATION",
  "BLOCKED_MOVEMENT",
  "UNKNOWN_TAG",
  "TAG_STATUS_ISSUE",
  "ZONE_CAPACITY_EXCEEDED",
  "ZONE_CAPACITY_WARNING",
  "HARDWARE_OFFLINE",
]);

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH:     "bg-orange-400",
  MEDIUM:   "bg-yellow-400",
  LOW:      "bg-blue-400",
};

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: "bg-red-500/15 text-red-400 border-red-500/30",
  HIGH:     "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MEDIUM:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  LOW:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING:      "bg-red-500/15 text-red-400 border-red-500/30",
  ACKNOWLEDGED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  RESOLVED:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

// ─── Capacity Bar ─────────────────────────────────────────────────────────────

function CapacityBar({ current, max }: { current: number; max: number }) {
  if (max <= 0) return null;
  const pct = Math.min(100, Math.round((current / max) * 100));
  const color =
    pct >= 100 ? "bg-red-500"
    : pct >= 80 ? "bg-yellow-400"
    : "bg-emerald-500";

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-white/35 mb-1">
        <span>{current}/{max}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-[3px] w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Zone Flow Diagram ────────────────────────────────────────────────────────

function ZoneFlowDiagram({
  zones,
  rules,
  loading,
}: {
  zones: ZoneStatus[];
  rules: WorkflowRule[];
  loading: boolean;
}) {
  const byType = Object.fromEntries(zones.map((z) => [z.zoneType, z]));
  const transitions = new Set(rules.map((r) => `${r.fromZone}->${r.toZone}`));

  if (loading) {
    return (
      <div className="flex gap-2 p-4">
        {ZONE_ORDER.map((z) => (
          <Skeleton key={z} className="h-[100px] flex-1 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex items-stretch p-4 gap-0" style={{ minWidth: 0 }}>
        {ZONE_ORDER.map((zoneType, idx) => {
          const zone = byType[zoneType];
          const nextType = ZONE_ORDER[idx + 1] as string | undefined;
          const hasArrow = nextType && transitions.has(`${zoneType}->${nextType}`);

          const pct =
            zone && zone.capacity > 0
              ? zone.currentItemCount / zone.capacity
              : 0;

          const borderColor =
            !zone || zone.status !== "ACTIVE" ? "border-white/10"
            : pct >= 1   ? "border-red-500/50"
            : pct >= 0.8 ? "border-yellow-400/40"
            :              "border-emerald-500/25";

          const isOffline =
            zone?.hasHardware && zone?.hardwareStatus !== "ACTIVE";

          return (
            <div key={zoneType} className="flex items-center flex-1 min-w-0">
              <div
                className={`flex-1 min-w-0 rounded-xl border p-3 self-stretch flex flex-col justify-between ${borderColor} bg-white/[0.03]`}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-1 truncate">
                    {ZONE_LABELS[zoneType] ?? zoneType}
                  </p>
                  <p className="text-xs font-medium text-white/75 leading-tight truncate">
                    {zone?.name ?? (
                      <span className="text-white/20 italic">Not configured</span>
                    )}
                  </p>
                </div>

                {zone ? (
                  <div>
                    <CapacityBar
                      current={zone.currentItemCount}
                      max={zone.capacity}
                    />
                    {zone.hasHardware && (
                      <div className="mt-2 flex items-center gap-1">
                        {isOffline ? (
                          <WifiOff className="h-3 w-3 text-red-400 flex-shrink-0" />
                        ) : (
                          <Wifi className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-[10px] truncate ${
                            isOffline ? "text-red-400" : "text-white/30"
                          }`}
                        >
                          {isOffline ? "Offline" : "Reader OK"}
                        </span>
                      </div>
                    )}
                    {zone.status !== "ACTIVE" && (
                      <span className="mt-1 inline-block text-[10px] text-white/25 uppercase tracking-wide">
                        Inactive
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-white/20 italic mt-2">
                    Not configured
                  </p>
                )}
              </div>

              {idx < ZONE_ORDER.length - 1 && (
                <div className="flex flex-col items-center px-1.5 flex-shrink-0 gap-0.5">
                  <ArrowRight
                    className={`h-3.5 w-3.5 ${
                      hasArrow ? "text-emerald-500" : "text-white/10"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Violation Log ────────────────────────────────────────────────────────────

type ViolationTab = "pending" | "all" | "resolved";

function ViolationLog({
  alerts,
  loading,
  onAcknowledge,
  onResolve,
  isActing,
}: {
  alerts: Alert[];
  loading: boolean;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  isActing: boolean;
}) {
  const [tab, setTab] = useState<ViolationTab>("pending");

  const visible = alerts.filter((a) => {
    if (tab === "pending")  return a.alertStatus !== "RESOLVED";
    if (tab === "resolved") return a.alertStatus === "RESOLVED";
    return true;
  });

  function friendlyType(t: string) {
    return t
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function fmtTs(iso: string) {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  }

  const pendingCount  = alerts.filter((a) => a.alertStatus !== "RESOLVED").length;
  const resolvedCount = alerts.filter((a) => a.alertStatus === "RESOLVED").length;

  const tabBtn = (t: ViolationTab, label: string, count: number) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
        tab === t
          ? "bg-white/10 text-white"
          : "text-white/30 hover:text-white/60"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold ${
            t === "pending"
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white/50"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-1 pb-3 border-b border-white/[0.06]">
        {tabBtn("pending",  "Active",   pendingCount)}
        {tabBtn("all",      "All",      alerts.length)}
        {tabBtn("resolved", "Resolved", resolvedCount)}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-14 text-white/25">
          <ShieldCheck className="h-9 w-9 text-emerald-500/40" />
          <p className="text-xs font-medium">
            {tab === "pending"
              ? "No active violations"
              : "No violations in this view"}
          </p>
        </div>
      )}

      {/* Table */}
      {visible.length > 0 && (
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                {["Time", "Type", "Severity", "Zone", "Message", "Status", ""].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-white/30 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((alert) => (
                <TableRow
                  key={alert.id}
                  className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  {/* Time */}
                  <TableCell className="text-[11px] text-white/35 whitespace-nowrap py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                          SEVERITY_DOT[alert.severity] ?? "bg-white/20"
                        }`}
                      />
                      {fmtTs(alert.createdAt)}
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-3 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-white/70">
                      {friendlyType(alert.alertType)}
                    </span>
                  </TableCell>

                  {/* Severity */}
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        SEVERITY_BADGE[alert.severity] ??
                        "bg-white/10 text-white/50 border-white/10"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </TableCell>

                  {/* Zone */}
                  <TableCell className="text-[11px] text-white/40 py-3 whitespace-nowrap">
                    {alert.zoneName ?? "—"}
                  </TableCell>

                  {/* Message */}
                  <TableCell className="py-3" style={{ maxWidth: 200 }}>
                    <span
                      className="text-[11px] text-white/40 truncate block cursor-help"
                      title={alert.message ?? ""}
                    >
                      {alert.message ?? "—"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        STATUS_BADGE[alert.alertStatus] ??
                        "bg-white/10 text-white/50 border-white/10"
                      }`}
                    >
                      {alert.alertStatus}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      {alert.alertStatus === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActing}
                          onClick={() => onAcknowledge(alert.id)}
                          className="h-6 px-2 text-[10px] border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Ack
                        </Button>
                      )}
                      {alert.alertStatus !== "RESOLVED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActing}
                          onClick={() => onResolve(alert.id)}
                          className="h-6 px-2 text-[10px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                      {alert.alertStatus === "RESOLVED" && (
                        <span className="text-[11px] text-white/20">Done</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GeofencingPage() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading: rulesLoading } = useQuery<WorkflowRule[]>({
    queryKey: QUERY_KEYS.geofence.rules,
    queryFn: () => api.getGeofenceRules(),
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery<ZoneStatus[]>({
    queryKey: QUERY_KEYS.zones.all,
    queryFn: () => api.getZones(),
  });

  const { data: allAlerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: QUERY_KEYS.alerts.unresolved,
    queryFn: () => api.getUnresolvedAlerts(),
    refetchInterval: 15000,
  });

  const geofenceAlerts = allAlerts.filter((a) =>
    GEOFENCE_ALERT_TYPES.has(a.alertType)
  );

  const pendingCount  = geofenceAlerts.filter((a) => a.alertStatus === "PENDING").length;
  const criticalCount = geofenceAlerts.filter((a) => a.severity === "CRITICAL").length;
  const resolvedCount = geofenceAlerts.filter((a) => a.alertStatus === "RESOLVED").length;

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => api.acknowledgeAlert(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.unresolved }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.resolveAlert(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.unresolved }),
  });

  const isActing = acknowledgeMutation.isPending || resolveMutation.isPending;

  return (
    <>
      <PageHeader
        title="Geofencing"
        subtitle="Zone movement rules and unauthorized access detection"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts.unresolved });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.zones.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.geofence.rules });
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <StatCard
          label="Total Violations"
          value={geofenceAlerts.length}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={<Clock className="h-4 w-4" />}
          accentColor={pendingCount > 0 ? "#ef4444" : undefined}
        />
        <StatCard
          label="Critical"
          value={criticalCount}
          icon={<AlertTriangle className="h-4 w-4" />}
          accentColor={criticalCount > 0 ? "#f97316" : undefined}
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      {/* Zone Flow Diagram */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <SectionHeader label="Zone Flow" sub="" />
        <ZoneFlowDiagram
          zones={zones}
          rules={rules}
          loading={rulesLoading || zonesLoading}
        />
      </div>

      {/* Violation Log */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <SectionHeader label="Violation Log" sub="" />
        <ViolationLog
          alerts={geofenceAlerts}
          loading={alertsLoading}
          onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
          onResolve={(id) => resolveMutation.mutate(id)}
          isActing={isActing}
        />
      </div>
    </>
  );
}