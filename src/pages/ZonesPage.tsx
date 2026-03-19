// ─────────────────────────────────────────────────────────────────────────────
// ZONES PAGE — Assigned to: Member 3 - Aatif
// 
// TODO: Implement the Zones page to display a list of warehouse zones, including their types, capacities, current item counts, and hardware status. Include functionality to add, edit, and delete zones.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Plus, Search, Warehouse } from "lucide-react";
import type { Zone } from "../types";
import { ZoneBadge } from "../components/ui/ZoneBadge";

export function ZonesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [editName, setEditName] = useState("");
  const [editCap,  setEditCap]  = useState("");

  // ── Fetch all zones ────────────────────────────────────────────────────────
  const { data: zones = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.zones.all,
    queryFn:  api.getZones,
  });

  // ── Update zone mutation ───────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ warehouseName, name, data }: { warehouseName: string; name: string; data: { name?: string; capacity?: number } }) =>
      api.updateZone(warehouseName, name, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.zones.all });
      setEditZone(null);
    },
  });

  // ── Filter zones by search ─────────────────────────────────────────────────
  const filtered = zones.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.warehouseName.toLowerCase().includes(search.toLowerCase())
  );
  
  // ── Status badge style ─────────────────────────────────────────────────────
  const statusBadge = (status: string) =>
    status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : "bg-red-500/10 text-red-400 border border-red-500/20";

  // ── Capacity bar color based on utilization ────────────────────────────────
  const utilizationColor = (current: number, capacity: number) => {
    const pct = capacity > 0 ? (current / capacity) * 100 : 0;
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return "bg-indigo-500";
  };

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <PageHeader title="Zones" subtitle="Manage warehouse zones">
        <Button size="sm" onClick={() => navigate("/zones/create")}>
          <Plus size={16} className="mr-1.5" />
          New Zone
        </Button>
      </PageHeader>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by zone or warehouse name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">

          {/* Table header */}
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Zone Name</th>
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Warehouse</th>
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Type</th>
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Capacity</th>
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Status</th>
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Hardware</th>
              <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading skeletons */}
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border/50">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-3 py-2">
                    <Skeleton className="h-3 w-24" />
                  </td>
                ))}
              </tr>
            ))}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Warehouse size={32} className="opacity-30" />
                    <p className="text-xs text-white font-medium">No zones found</p>
                    {search && <p className="text-[11px] text-white font-medium">Try a different search term</p>}
                  </div>
                </td>
              </tr>
            )}

            {/* Zone rows */}
            {!isLoading && filtered.map((zone, idx) => {
              const utilPct = zone.capacity > 0
                ? Math.min(Math.round((zone.currentItemCount / zone.capacity) * 100), 100)
                : 0;

              return (
                <tr
                  key={zone.id}
                  className={`border-b border-border/50 hover:bg-white/[0.02] transition ${idx === filtered.length - 1 ? "border-b-0" : ""}`}
                >
                  {/* Zone name */}
                  <td className="px-3 py-2">
                    <ZoneBadge zone={zone.name} />
                  </td>

                  {/* Warehouse */}
                  <td className="px-3 py-2 text-gray-400 font-medium">{zone.warehouseName}</td>

                  {/* Zone type */}
                  <td className="px-3 py-2 text-gray-400 font-medium">
                    {zone.zoneType.replace(/_/g, " ")}
                  </td>

                  {/* Capacity with progress bar */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/5 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${utilizationColor(zone.currentItemCount, zone.capacity)}`}
                          style={{ width: `${utilPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        {zone.currentItemCount} / {zone.capacity}
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(zone.status)}`}>
                      {zone.status}
                    </span>
                  </td>

                  {/* Hardware */}
                  <td className="px-3 py-2 text-xs text-gray-400 font-medium">
                    {zone.hasHardware ? (zone.hardwareName ?? "Connected") : "None"}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
