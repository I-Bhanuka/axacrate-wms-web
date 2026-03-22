import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/http";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/dashboardComponents/SectionHeader";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Package,
  Hash,
  AlertTriangle,
  Warehouse,
  ArrowRight,
  FileText,
  Download,
  TrendingDown,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Color-codes movement event types so the table is scannable at a glance
const EVENT_STYLE: Record<string, string> = {
  MOVEMENT:         "bg-blue-500/15 text-blue-400 border-blue-500/30",
  TAG_REGISTERED:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ASSIGNED:         "bg-orange-500/15 text-orange-400 border-orange-500/30",
  UNASSIGNED:       "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  TAG_WRITE_SUCCESS:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  TAG_WRITE_FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
};

function EventBadge({ type }: { type: string }) {
  const style = EVENT_STYLE[type] ?? "bg-white/10 text-white/50 border-white/10";
  const label = type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${style}`}>
      {label}
    </span>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    + " · "
    + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// Shared panel style matching the rest of the app
const PANEL: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginTop: 20,
};

// ─── Stat card (matches dashboard StatCard visually) ─────────────────────────

function ReportStatCard({
  label, value, icon, accentColor, subtitle,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  subtitle: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-foreground" style={{ color: accentColor }}>
          {value.toLocaleString()}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
      {/* Accent bar at the bottom */}
      <div className="h-[2px] rounded-full" style={{ background: `${accentColor}40` }} />
    </div>
  );
}

// ─── Toggle checkbox styled to match the dark theme ─────────────────────────

function DarkCheckbox({
  label, checked, onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
        checked
          ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
          : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/10 hover:text-white/60"
      }`}
    >
      {/* Custom checkbox box */}
      <div className={`h-4 w-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
        checked
          ? "bg-orange-500 border-orange-500"
          : "bg-transparent border-white/20"
      }`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-[12px] font-medium leading-tight">{label}</span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  // ── State — identical to original ─────────────────────────────────────────
  const [recentMovementLimit, setRecentMovementLimit]     = useState(10);
  const [includeLowStock, setIncludeLowStock]             = useState(true);
  const [includeRecentMovements, setIncludeRecentMovements] = useState(true);
  const [report, setReport]                               = useState<any | null>(null);

  // ── Mutations — identical to original ─────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: () =>
      api.getDashboardReport({ recentMovementLimit, includeLowStock, includeRecentMovements }),
    onSuccess: (data) => setReport(data),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      api.exportDashboardReportCsv({ recentMovementLimit, includeLowStock, includeRecentMovements }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = "dashboard-report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate dashboard analytics and compliance reports"
      >
        <Button
          variant="outline"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          <FileText size={15} style={{ marginRight: 6 }} />
          {generateMutation.isPending ? "Generating..." : "Generate Report"}
        </Button>

        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
        >
          <Download size={15} style={{ marginRight: 6 }} />
          {exportMutation.isPending ? "Exporting..." : "Download CSV"}
        </Button>
      </PageHeader>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div style={PANEL}>
        <SectionHeader label="REPORT OPTIONS" sub="Configure what to include in the report" />
        <div className="p-4 grid gap-3 md:grid-cols-3">

          {/* Movement limit select */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Movement Limit
            </label>
            <Select
              value={String(recentMovementLimit)}
              onValueChange={(v) => setRecentMovementLimit(Number(v))}
            >
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white/70 hover:border-white/20 transition-colors">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {[10, 20, 50, 100].map(n => (
                  <SelectItem key={n} value={String(n)} className="text-white/70 focus:bg-white/10 focus:text-white">
                    Last {n} movements
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <DarkCheckbox
            label="Include Low Stock Section"
            checked={includeLowStock}
            onChange={setIncludeLowStock}
          />
          <DarkCheckbox
            label="Include Recent Movements Section"
            checked={includeRecentMovements}
            onChange={setIncludeRecentMovements}
          />
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!report && !generateMutation.isPending && (
        <div className="flex flex-col items-center gap-3 py-20 text-white/20">
          <FileText className="h-10 w-10 text-white/10" />
          <p className="text-sm font-medium">No report generated yet</p>
          <p className="text-xs">Configure your options above and click Generate Report</p>
        </div>
      )}

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {generateMutation.isPending && (
        <div className="flex flex-col items-center gap-3 py-20 text-white/30">
          <div className="h-8 w-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
          <p className="text-sm">Generating report...</p>
        </div>
      )}

      {/* ── Report output ─────────────────────────────────────────────────── */}
      {report && (
        <div>

          {/* Stat cards — identical layout to dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
            <ReportStatCard
              label="Total Items"
              value={report.totalItems}
              icon={<Package size={18} />}
              accentColor="#576A8F"
              subtitle="unique SKUs"
            />
            <ReportStatCard
              label="Total Quantity"
              value={report.totalQuantity}
              icon={<Hash size={18} />}
              accentColor="#B7BDF7"
              subtitle="units tracked"
            />
            <ReportStatCard
              label="Low Stock"
              value={report.lowStockCount}
              icon={<AlertTriangle size={18} />}
              accentColor={report.lowStockCount > 0 ? "#ef4444" : "#10b981"}
              subtitle="below threshold"
            />
            <ReportStatCard
              label="Active Zones"
              value={report.activeZones}
              icon={<Warehouse size={18} />}
              accentColor="#f97316"
              subtitle="operational"
            />
          </div>

          {/* Low stock table */}
          {report.lowStockItems?.length > 0 && (
            <div style={PANEL}>
              <SectionHeader
                label="LOW STOCK ITEMS"
                sub={`${report.lowStockItems.length} items need restocking`}
              />
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    {["SKU", "Name", "Qty", "Threshold", "Zone"].map(h => (
                      <TableHead key={h} className="text-white/30 text-[11px] font-semibold uppercase tracking-wider">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.lowStockItems.map((item: any) => {
                    // How close to zero? Drives the row urgency color
                    const ratio = item.reorderThreshold > 0
                      ? item.quantity / item.reorderThreshold
                      : 1;
                    const urgency =
                      ratio <= 0    ? "border-l-red-500 bg-red-500/5"
                      : ratio < 0.5 ? "border-l-orange-400 bg-orange-500/5"
                      :               "border-l-yellow-400";

                    return (
                      <TableRow
                        key={item.sku}
                        className={`border-white/[0.04] border-l-2 ${urgency} hover:bg-white/[0.02] transition-colors`}
                      >
                        <TableCell className="py-3">
                          <span className="font-mono text-[11px] text-white/50">{item.sku}</span>
                        </TableCell>
                        <TableCell className="py-3 text-[12px] font-medium text-white/80">
                          {item.name}
                        </TableCell>
                        <TableCell className="py-3">
                          {/* Quantity shown with color */}
                          <span className={`text-[13px] font-bold ${
                            item.quantity === 0 ? "text-red-400"
                            : item.quantity < item.reorderThreshold / 2 ? "text-orange-400"
                            : "text-yellow-400"
                          }`}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-[12px] text-white/40">
                          {item.reorderThreshold}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-[11px] font-mono bg-white/[0.06] px-2 py-0.5 rounded text-white/50">
                            {item.zoneName ?? "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Low stock empty state */}
          {includeLowStock && report.lowStockItems?.length === 0 && (
            <div style={PANEL}>
              <SectionHeader label="LOW STOCK ITEMS" sub="Stock levels" />
              <div className="flex flex-col items-center gap-2 py-10 text-white/20">
                <TrendingDown className="h-8 w-8 text-emerald-500/40" />
                <p className="text-xs font-medium text-emerald-400/60">All items are well stocked</p>
              </div>
            </div>
          )}

          {/* Movements table */}
          {report.recentMovements?.length > 0 && (
            <div style={{ ...PANEL, marginBottom: 24 }}>
              <SectionHeader
                label="RECENT MOVEMENTS"
                sub={`Last ${report.recentMovements.length} movement events`}
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      {["Item", "SKU", "Route", "Event", "Time"].map(h => (
                        <TableHead key={h} className="text-white/30 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.recentMovements.map((m: any) => (
                      <TableRow
                        key={m.id}
                        className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Item name */}
                        <TableCell className="py-3 text-[12px] font-medium text-white/75 max-w-[140px]">
                          <span className="truncate block">{m.itemName ?? "—"}</span>
                        </TableCell>

                        {/* SKU */}
                        <TableCell className="py-3">
                          <span className="font-mono text-[11px] text-white/40">{m.itemSku ?? "—"}</span>
                        </TableCell>

                        {/* Route: from → to (visual arrow) */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-[11px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-white/45">
                              {m.fromZoneName ?? "—"}
                            </span>
                            <ArrowRight className="h-3 w-3 text-white/20 flex-shrink-0" />
                            <span className="text-[11px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-white/45">
                              {m.toZoneName ?? "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Event type badge */}
                        <TableCell className="py-3">
                          <EventBadge type={m.eventType} />
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell className="py-3 text-[11px] text-white/30 whitespace-nowrap">
                          {fmtTime(m.occurredAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
