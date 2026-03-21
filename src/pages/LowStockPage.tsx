// ─────────────────────────────────────────────────────────────────────────────
// Low Stock PAGE — Assigned to: Member 6 - Ahintha
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { api } from "../api/http";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/skeleton";
import type { LowStockItem } from "../types";

export default function LowStockPage() {
  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["low-stock-items"],
    queryFn: api.getLowStockItems,
  });

  const getShortage = (item: LowStockItem) => {
    return Math.max(item.reorderLevel - item.quantity, 0);
  };

  return (
    <>
      <PageHeader
        title="Low Stock"
        subtitle="Items below their reorder threshold"
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-500">
            Failed to load low stock items.
            <button onClick={() => refetch()} className="ml-3 underline">
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No low stock items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Item Name</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Current Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Reorder Level</th>
                  <th className="px-4 py-3 text-left font-medium">Shortage</th>
                  <th className="px-4 py-3 text-left font-medium">Zone</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.sku}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.reorderLevel}</td>
                    <td className="px-4 py-3">{getShortage(item)}</td>
                    <td className="px-4 py-3">{item.zoneName ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                        <AlertTriangle size={14} />
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}