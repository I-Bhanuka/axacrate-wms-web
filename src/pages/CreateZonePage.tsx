// ─────────────────────────────────────────────────────────────────────────────
// CREATE ZONE PAGE — Assigned to: Member 2 - Aatif
//
// TODO: Build the create zone form and handle submission.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function CreateZonePage() {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:          "",
    zoneType:      "",
    warehouseName: "",
    capacity:      "",
    status:        "ACTIVE", // default to ACTIVE
  });

  return <div>Create Zone Page</div>;
}