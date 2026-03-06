// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAGE — Assigned to: Member 1, 2, 3, 6 - Bhanuka, Sheshan, Aatif, Ahintha
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { fmtNum, fmtDate, fmtTime } from "../lib/utils";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Package, Hash, AlertTriangle, Warehouse } from "lucide-react";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn:  api.getDashboard,
  });

  const pieData = Object.entries(data?.itemsByZone ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      >
        <Button variant="outline" size="sm" onClick={() => refetch()}>↻ Refresh</Button>
      </PageHeader>

      {/* Ahintha TODO: Low stock alert */}

      {/*M1-B*/}
      {/* Stat cards */}
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
            label="Total Items"
            value={fmtNum(data?.totalItems)}
            icon={<Package size={20} />}
            accentColor="#4f8ef7"
            subtitle="unique SKUs"
          />

          <StatCard
            label="Total Quantity"
            value={fmtNum(data?.totalQuantity)}
            icon={<Hash size={20} />}
            accentColor="#7c5cfc"
            subtitle="units tracked"
          />

          <StatCard
            label="Low Stock"
            value={fmtNum(data?.lowStockCount)}
            icon={<AlertTriangle size={20} />}
            accentColor={(data?.lowStockCount ?? 0) > 0 ? "#ef4444" : "#10b981"}
            subtitle="below threshold"
          />

          <StatCard
            label="Active Zones"
            value={data?.activeZones ?? pieData.length}
            icon={<Warehouse size={20} />}
            accentColor="#10b981"
            subtitle="operational"
          />
        </>
        )}
      </div>


      {/* Aatif TODO: Zone Charts*/}

      {/* Ahintha TODO: Recent Movements Table */}

      {/* Sheshan TODO: Recent Items Table */}

    </>
  );
}
