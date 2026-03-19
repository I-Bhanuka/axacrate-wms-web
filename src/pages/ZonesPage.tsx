// ─────────────────────────────────────────────────────────────────────────────
// ZONES PAGE — Assigned to: Member 3 - Aatif
// 
// TODO: Implement the Zones page to display a list of warehouse zones, including their types, capacities, current item counts, and hardware status. Include functionality to add, edit, and delete zones.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Zone } from "../types";

export function ZonesPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [search,   setSearch]   = useState("");
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [editName, setEditName] = useState("");
  const [editCap,  setEditCap]  = useState("");

  return <div>Zones Page</div>;
}
