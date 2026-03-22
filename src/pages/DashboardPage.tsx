// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAGE — Assigned to: Member 1 - Bhanuka
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { fmtNum } from "../lib/utils";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Package, Hash, AlertTriangle, Warehouse, RotateCcw } from "lucide-react";
import { SectionHeader } from "../components/dashboardComponents/SectionHeader";
import { MovementTimeline } from "../components/dashboardComponents/MovementTimeline";
import { ZoneOccupationCard } from "../components/dashboardComponents/ZoneOccupationCard";
import { RecentAlerts } from "../components/dashboardComponents/RecentAlerts";


export function DashboardPage() {

  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn:  api.getDashboard,
  });

  {/* Movement timeline data */}
  const { data: movements = [] } = useQuery({
    queryKey: ["movements-recent"],
    queryFn:  () => api.getMovements(12),
    refetchInterval: 3_000,
  });

  {/* Zone Occupation data */}
  const { data: zones = [] } = useQuery({
    queryKey: QUERY_KEYS.zones.all,
    queryFn:  api.getZones,
    refetchInterval: 10_000,
  });

  {/* Calculate overall warehouse utilization for the zone occupation section */}
  const pct  = (a: number, b: number) => b > 0 ? Math.round((a / b) * 100) : 0;
  const totalCapacity = zones.reduce((s, z) => s + (z.capacity ?? 0), 0);
  const totalItems    = zones.reduce((s, z) => s + (z.currentItemCount ?? 0), 0);
  const overallUtil   = pct(totalItems, totalCapacity);

  const pieData = Object.entries(data?.itemsByZone ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      >
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <><RotateCcw size={16} style={{ marginRight: 6 }} />Refresh</>
        </Button>
      </PageHeader>

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
            accentColor="#576A8F"
            subtitle="unique SKUs"
          />

          <StatCard
            label="Total Quantity"
            value={fmtNum(data?.totalQuantity)}
            icon={<Hash size={20} />}
            accentColor="#B7BDF7"
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
            accentColor="#FFF8DE"
            subtitle="operational"
          />
        </>
        )}
      </div>

      {/* ── Alerts ────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, overflow: "hidden",
        marginTop: 20,
      }}>
        <SectionHeader label="ALERTS" sub="Latest Alerts" />
        <RecentAlerts />
      </div>

      {/* ── MOVEMENT TIMELINE ────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, overflow: "hidden",
        marginTop: 20,
      }}>
        <SectionHeader label="MOVEMENT TIMELINE" sub="Last 12 events" />
        <MovementTimeline movements={movements} />
      </div>


      {/* ── Bottom: Zone Ocuupation cards ───────────────────────────────── */}
      <div className="mt-[20px] overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.02]">
        
        <SectionHeader
          label="ZONE OCCUPATION"
          sub={`${overallUtil}% overall utilization`}
        />

        <div className="grid gap-[10px] p-[16px] [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
          
          {zones.length === 0 ? (
            <div className="col-[1/-1] p-[20px] text-center text-[11px] text-gray-700">
              No zones found
            </div>
          ) : (
            zones.map((z) => <ZoneOccupationCard key={z.id} zone={z} />)
          )}

        </div>
      </div>
      
    </>
  );
}
