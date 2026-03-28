// ─────────────────────────────────────────────────────────────────────────────
// Low Stock PAGE — Assigned to: Member 6 - Ahintha
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  Package,
  Boxes,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import { api } from "../api/http";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/dashboardComponents/SectionHeader";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import type { InventoryItem } from "../types";

const LOW_STOCK_LIMIT = 10;

const PANEL: CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginTop: 20,
};

function LowStockStatCard({
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
        <div className="text-3xl font-bold" style={{ color: accentColor }}>
          {value.toLocaleString()}
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</div>
      </div>

      <div className="h-[2px] rounded-full" style={{ background: `${accentColor}40` }} />
    </div>
  );
}

export default function LowStockPage() {
  const {
    data: pageData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["inventory-items-low-stock-page"],
    queryFn: () =>
      api.getItems({
        page: 0,
        size: 100,
        sort: "createdAt,desc",
      }),
  });

  const items = pageData?.content ?? [];
  const filteredItems = items.filter((item: InventoryItem) => item.quantity < LOW_STOCK_LIMIT);

  const getShortage = (item: InventoryItem) => {
    return Math.max(LOW_STOCK_LIMIT - item.quantity, 0);
  };

  const totalLowStockItems = filteredItems.length;
  const totalUnitsShort = filteredItems.reduce(
    (sum: number, item: InventoryItem) => sum + getShortage(item),
    0
  );
  const criticalItems = filteredItems.filter((item: InventoryItem) => item.quantity <= 3).length;
  const affectedZones = new Set(
    filteredItems.map((item: InventoryItem) => item.currentZoneName ?? "Unassigned")
  ).size;

  return (
    <>
      <PageHeader
        title="Low Stock"
        subtitle={`Items with quantity below ${LOW_STOCK_LIMIT}`}
      />

      {/* Loading state */}
      {isLoading ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="mb-3 h-3 w-20" />
                <Skeleton className="mb-1 h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          <div style={PANEL}>
            <SectionHeader label="LOW STOCK ITEMS" sub="Loading inventory status" />
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </>
      ) : isError ? (
        <div style={PANEL}>
          <SectionHeader label="LOW STOCK ITEMS" sub="Error loading data" />
          <div className="flex flex-col items-center gap-3 py-12 text-red-400">
            <AlertTriangle className="h-8 w-8" />
            <p className="text-sm font-medium">Failed to load inventory items</p>
            <button
              onClick={() => refetch()}
              className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mt-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <LowStockStatCard
              label="Low Stock Items"
              value={totalLowStockItems}
              icon={<Package size={18} />}
              accentColor="#ef4444"
              subtitle={`below threshold of ${LOW_STOCK_LIMIT}`}
            />
            <LowStockStatCard
              label="Units Short"
              value={totalUnitsShort}
              icon={<TrendingDown size={18} />}
              accentColor="#f97316"
              subtitle="needed to reach safe level"
            />
            <LowStockStatCard
              label="Critical Items"
              value={criticalItems}
              icon={<AlertTriangle size={18} />}
              accentColor="#dc2626"
              subtitle="quantity at or below 3"
            />
            <LowStockStatCard
              label="Affected Zones"
              value={affectedZones}
              icon={<Warehouse size={18} />}
              accentColor="#576A8F"
              subtitle="zones with low stock"
            />
          </div>

          {/* Table / Empty state */}
          {filteredItems.length === 0 ? (
            <div style={PANEL}>
              <SectionHeader label="LOW STOCK ITEMS" sub="Inventory health overview" />
              <div className="flex flex-col items-center gap-3 py-16 text-white/20">
                <Boxes className="h-10 w-10 text-emerald-500/40" />
                <p className="text-sm font-medium text-emerald-400/70">
                  No low stock items found
                </p>
                <p className="text-xs text-white/30">
                  All items are currently above the minimum threshold
                </p>
              </div>
            </div>
          ) : (
            <div style={PANEL}>
              <SectionHeader
                label="LOW STOCK ITEMS"
                sub={`${filteredItems.length} items require attention`}
              />

              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Item
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      SKU
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Current Qty
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Threshold
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Shortage
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Zone
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredItems.map((item: InventoryItem) => {
                    const shortage = getShortage(item);

                    const urgencyRowClass =
                      item.quantity <= 0
                        ? "border-l-red-500 bg-red-500/5"
                        : item.quantity <= 3
                        ? "border-l-orange-400 bg-orange-500/5"
                        : "border-l-yellow-400";

                    const qtyTextClass =
                      item.quantity <= 0
                        ? "text-red-400"
                        : item.quantity <= 3
                        ? "text-orange-400"
                        : "text-yellow-400";

                    const statusLabel =
                      item.quantity <= 0
                        ? "Out of Stock"
                        : item.quantity <= 3
                        ? "Critical"
                        : "Low Stock";

                    const statusClass =
                      item.quantity <= 0
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : item.quantity <= 3
                        ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                        : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

                    return (
                      <TableRow
                        key={item.id}
                        className={`border-l-2 border-white/[0.04] ${urgencyRowClass} transition-colors hover:bg-white/[0.02]`}
                      >
                        <TableCell className="py-3 text-[12px] font-medium text-white/80">
                          {item.name}
                        </TableCell>

                        <TableCell className="py-3">
                          <span className="font-mono text-[11px] text-white/45">
                            {item.sku}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <span className={`text-[13px] font-bold ${qtyTextClass}`}>
                            {item.quantity}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 text-[12px] text-white/40">
                          {LOW_STOCK_LIMIT}
                        </TableCell>

                        <TableCell className="py-3 text-[12px] font-medium text-white/70">
                          {shortage}
                        </TableCell>

                        <TableCell className="py-3">
                          <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-white/50">
                            {item.currentZoneName ?? "—"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
                          >
                            <AlertTriangle size={12} />
                            {statusLabel}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </>
  );
}