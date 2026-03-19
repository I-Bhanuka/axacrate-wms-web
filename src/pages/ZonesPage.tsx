// ─────────────────────────────────────────────────────────────────────────────
// ZONES PAGE — Assigned to: Member 3 - Aatif
// 
// TODO: Implement the Zones page to display a list of warehouse zones, including their types, capacities, current item counts, and hardware status. Include functionality to add, edit, and delete zones.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Plus, Search } from "lucide-react";
import type { Zone } from "../types";

export function ZonesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [search,   setSearch]   = useState("");
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [editName, setEditName] = useState("");
  const [editCap,  setEditCap]  = useState("");

  // ── Fetch all zones ────────────────────────────────────────────────────────
  const { data: _zones = [], isLoading: _isLoading } = useQuery({
    queryKey: QUERY_KEYS.zones.all,
    queryFn:  api.getZones,
  });

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

      <div>Zones Page</div>
    </>
  );
}
