import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/http";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
    onSuccess: (data) => {
      setReport(data);
    },
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
          {generateMutation.isPending ? "Generating..." : "Generate Report"}
        </Button>

        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? "Exporting..." : "Download CSV"}
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        
        {/* Custom Select */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-sm font-medium text-foreground">
            Recent Movements Limit
          </label>

          <Select
            value={String(recentMovementLimit)}
            onValueChange={(value) => setRecentMovementLimit(Number(value))}
          >
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Select limit" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Checkbox 1 */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={includeLowStock}
              onChange={(e) => setIncludeLowStock(e.target.checked)}
            />
            Include Low Stock Section
          </label>
        </div>

        {/* Checkbox 2 */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={includeRecentMovements}
              onChange={(e) => setIncludeRecentMovements(e.target.checked)}
            />
            Include Recent Movements Section
          </label>
        </div>
      </div>

      {/* Report Output */}
      {report && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-bold">{report.totalItems}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Quantity</div>
              <div className="text-2xl font-bold">{report.totalQuantity}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Low Stock Count</div>
              <div className="text-2xl font-bold">{report.lowStockCount}</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Active Zones</div>
              <div className="text-2xl font-bold">{report.activeZones}</div>
            </div>
          </div>

          {/* Low Stock Table */}
          {report.lowStockItems?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-lg font-semibold">Low Stock Items</h2>
              <div className="overflow-x-auto">
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
                      <tr key={item.sku} className="border-t">
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

          {/* Movements Table */}
          {report.recentMovements?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-lg font-semibold">Recent Movements</h2>
              <div className="overflow-x-auto">
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
                      <tr key={m.id} className="border-t">
                        <td className="px-3 py-2">{m.itemName ?? "-"}</td>
                        <td className="px-3 py-2">{m.itemSku ?? "-"}</td>
                        <td className="px-3 py-2">{m.fromZoneName ?? "-"}</td>
                        <td className="px-3 py-2">{m.toZoneName ?? "-"}</td>
                        <td className="px-3 py-2">{m.eventType}</td>
                        <td className="px-3 py-2">
                          {new Date(m.occurredAt).toLocaleString()}
                        </td>
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