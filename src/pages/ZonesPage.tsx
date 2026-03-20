// ─────────────────────────────────────────────────────────────────────────────
// ZONES PAGE — Assigned to: Member 3 - Aatif
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search, Warehouse, Power, PowerOff, Pencil } from "lucide-react";
import type { Zone } from "../types";
import { ZoneBadge } from "../components/ui/ZoneBadge";

export function ZonesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [search,   setSearch]   = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [editName, setEditName] = useState("");
  const [editCap,  setEditCap]  = useState("");

  // ── Fetch all zones ────────────────────────────────────────────────────────
  const { data: zones = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.zones.all,
    queryFn:  api.getZones,
  });

  // ── Disable zone mutation ──────────────────────────────────────────────────
  const disableMutation = useMutation({
    mutationFn: ({ warehouseName, name }: { warehouseName: string; name: string }) =>
      api.disableZone(warehouseName, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.zones.all }),
  });

  // ── Enable zone mutation ───────────────────────────────────────────────────
  const enableMutation = useMutation({
    mutationFn: ({ warehouseName, name }: { warehouseName: string; name: string }) =>
      api.enableZone(warehouseName, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.zones.all }),
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

  // ── Extract unique warehouse names from zones ──────────────────────────────
  const warehouses = ["ALL", ...Array.from(new Set(zones.map((z) => z.warehouseName)))];

  // ── Filter zones by search and warehouse ───────────────────────────────────
  const filtered = zones.filter((z) => {
    const matchesSearch    = z.name.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = selectedWarehouse === "ALL" || z.warehouseName === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (zone: Zone) => {
    setEditZone(zone);
    setEditName(zone.name);
    setEditCap(String(zone.capacity));
  };

  // ── Submit edit ────────────────────────────────────────────────────────────
  const submitEdit = () => {
    if (!editZone) return;
    updateMutation.mutate({
      warehouseName: editZone.warehouseName,
      name:          editZone.name,
      data: {
        name:     editName !== editZone.name            ? editName          : undefined,
        capacity: Number(editCap) !== editZone.capacity ? Number(editCap)   : undefined,
      },
    });
  };

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

      {/* ── Table with filter bar ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">

        {/* Filter bar */}
        <div className="p-4 border-b border-border flex gap-3 items-center">

          {/* Warehouse dropdown */}
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border border-border">
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>
                  {w === "ALL" ? "All Warehouses" : w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by zone name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-white">ZONE NAME</TableHead>
              <TableHead className="text-center text-white">WAREHOUSE</TableHead>
              <TableHead className="text-center text-white">TYPE</TableHead>
              <TableHead className="text-center text-white">CAPACITY</TableHead>
              <TableHead className="text-center text-white">STATUS</TableHead>
              <TableHead className="text-center text-white">HARDWARE</TableHead>
              <TableHead className="text-center text-white">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading skeletons */}
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Empty state */}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Warehouse size={32} className="opacity-30" />
                    <p className="text-xs text-white font-medium">No zones found</p>
                    {search && <p className="text-[11px] text-white font-medium">Try a different search term</p>}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Zone rows */}
            {!isLoading && filtered.map((zone) => {
              const utilPct = zone.capacity > 0
                ? Math.min(Math.round((zone.currentItemCount / zone.capacity) * 100), 100)
                : 0;

              return (
                <TableRow key={zone.id}>

                  {/* Zone name */}
                  <TableCell>
                    <ZoneBadge zone={zone.name} className="!text-orange-400 !bg-orange-500/10 !border-orange-500/20" />
                  </TableCell>

                  {/* Warehouse */}
                  <TableCell className="text-gray-400 font-medium">{zone.warehouseName}</TableCell>

                  {/* Zone type */}
                  <TableCell className="text-gray-400 font-medium">
                    {zone.zoneType.replace(/_/g, " ")}
                  </TableCell>

                  {/* Capacity with progress bar */}
                  <TableCell>
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
                  </TableCell>

                  {/* Status badge */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={zone.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    >
                      {zone.status}
                    </Badge>
                  </TableCell>

                  {/* Hardware */}
                  <TableCell className="text-xs text-gray-400 font-medium">
                    {zone.hasHardware ? (zone.hardwareName ?? "Connected") : "None"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">

                      {/* Edit button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(zone)}
                      >
                        <Pencil size={11} />
                        Edit
                      </Button>

                      {/* Enable / Disable button */}
                      {zone.status === "ACTIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disableMutation.mutate({ warehouseName: zone.warehouseName, name: zone.name })}
                          disabled={disableMutation.isPending}
                          className="border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <PowerOff size={11} />
                          Disable
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => enableMutation.mutate({ warehouseName: zone.warehouseName, name: zone.name })}
                          disabled={enableMutation.isPending}
                          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400"
                        >
                          <Power size={11} />
                          Enable
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Row count footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <p className="text-[11px] text-white font-medium">
              Showing {filtered.length} of {zones.length} zones
            </p>
          </div>
        )}
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────────────── */}
      {editZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-white mb-4">Edit Zone — {editZone.name}</h2>

            {/* Zone name field */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">Zone Name</label>
              <Input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            {/* Capacity field */}
            <div className="mb-5">
              <label className="text-xs text-gray-400 mb-1 block">Capacity</label>
              <Input type="number" value={editCap} onChange={(e) => setEditCap(e.target.value)} />
            </div>

            {/* Error message */}
            {updateMutation.isError && (
              <p className="mt-3 text-xs text-red-400 text-center">
                Failed to update zone. Please try again.
              </p>
            )}

            {/* Modal action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditZone(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={submitEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
