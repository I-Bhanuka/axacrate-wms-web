import { useState } from "react";
import type { CSSProperties } from "react";
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
  Package,
  Hash,
  AlertTriangle,
  Warehouse,
  FileText,
  Download,
} from "lucide-react";

const EVENT_STYLE: Record<string, string> = {
  MOVEMENT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  TAG_REGISTERED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ASSIGNED: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  UNASSIGNED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  TAG_WRITE_SUCCESS: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  TAG_WRITE_FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
};

function EventBadge({ type }: { type: string }) {
  const style = EVENT_STYLE[type] ?? "bg-white/10 text-white/50 border-white/10";
  const label = type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

const PANEL: CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginTop: 20,
};

function ReportStatCard({
  label,
  value,
  icon,
  accentColor,
  subtitle,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div className="text-3xl font-bold text-foreground" style={{ color: accentColor }}>
          {value.toLocaleString()}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</div>
      </div>

      <div className="h-[2px] rounded-full" style={{ background: `${accentColor}40` }} />
    </div>
  );
}

function DarkCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        checked
          ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
          : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all ${
            checked ? "border-orange-500 bg-orange-500" : "border-white/20 bg-transparent"
          }`}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="text-[12px] font-medium leading-tight">{label}</span>
      </div>
    </button>
  );
}

export default function ReportsPage() {
  const [recentMovementLimit, setRecentMovementLimit] = useState(10);
  const [includeLowStock, setIncludeLowStock] = useState(true);
  const [includeRecentMovements, setIncludeRecentMovements] = useState(true);
  const [report, setReport] = useState<any | null>(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      api.getDashboardReport({
        recentMovementLimit,
        includeLowStock,
        includeRecentMovements,
      }),
    onSuccess: (data) => setReport(data),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      api.exportDashboardReportCsv({
        recentMovementLimit,
        includeLowStock,
        includeRecentMovements,
      }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dashboard-report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

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

      <div style={PANEL}>
        <SectionHeader label="REPORT OPTIONS" sub="Configure what to include in the report" />
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Movement Limit
            </label>

            <Select
              value={String(recentMovementLimit)}
              onValueChange={(value) => setRecentMovementLimit(Number(value))}
            >
              <SelectTrigger className="border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-white/20">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900">
                <SelectItem value="10" className="text-white/70 focus:bg-white/10 focus:text-white">
                  Last 10 movements
                </SelectItem>
                <SelectItem value="20" className="text-white/70 focus:bg-white/10 focus:text-white">
                  Last 20 movements
                </SelectItem>
                <SelectItem value="50" className="text-white/70 focus:bg-white/10 focus:text-white">
                  Last 50 movements
                </SelectItem>
                <SelectItem value="100" className="text-white/70 focus:bg-white/10 focus:text-white">
                  Last 100 movements
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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

      {report && (
        <div>
          <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
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

          {report.lowStockItems?.length > 0 && (
            <div style={PANEL}>
              <SectionHeader
                label="LOW STOCK ITEMS"
                sub={`${report.lowStockItems.length} items need restocking`}
              />
              <div className="overflow-x-auto p-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Quantity</th>
                      <th className="px-3 py-2 text-left">Threshold</th>
                      <th className="px-3 py-2 text-left">Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.lowStockItems.map((item: any) => (
                      <tr key={item.sku} className="border-t border-white/[0.04]">
                        <td className="px-3 py-2">{item.sku}</td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">{item.reorderThreshold}</td>
                        <td className="px-3 py-2">{item.zoneName ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.recentMovements?.length > 0 && (
            <div style={{ ...PANEL, marginBottom: 24 }}>
              <SectionHeader
                label="RECENT MOVEMENTS"
                sub={`Last ${report.recentMovements.length} movement events`}
              />
              <div className="overflow-x-auto p-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">From</th>
                      <th className="px-3 py-2 text-left">To</th>
                      <th className="px-3 py-2 text-left">Event</th>
                      <th className="px-3 py-2 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.recentMovements.map((m: any) => (
                      <tr key={m.id} className="border-t border-white/[0.04]">
                        <td className="px-3 py-2">{m.itemName ?? "-"}</td>
                        <td className="px-3 py-2">{m.itemSku ?? "-"}</td>
                        <td className="px-3 py-2">{m.fromZoneName ?? "-"}</td>
                        <td className="px-3 py-2">{m.toZoneName ?? "-"}</td>
                        <td className="px-3 py-2">
                          <EventBadge type={m.eventType} />
                        </td>
                        <td className="px-3 py-2">{fmtTime(m.occurredAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}