// ─────────────────────────────────────────────────────────────────────────────
// CREATE ZONE PAGE — Assigned to: Member 2 - Aatif
//
// TODO: Build the create zone form and handle submission.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <PageHeader title="Create Zone" subtitle="Add a new zone to the warehouse">
        <Button variant="outline" size="sm" onClick={() => navigate("/zones")}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} />
          Back
        </Button>
      </PageHeader>
    </>
  );

  <div>Create Zone Page</div>;
}