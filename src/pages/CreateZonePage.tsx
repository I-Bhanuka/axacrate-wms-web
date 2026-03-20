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

// ── Zone type and status options (matching backend enums) ──────────────────
const ZONE_TYPES = [
  { value: "UNLOADING_ZONE", label: "Unloading Zone" },
  { value: "WRITER_ZONE",    label: "Writer Zone"    },
  { value: "QC_ZONE",        label: "QC Zone"        },
  { value: "STORAGE_ZONE",   label: "Storage Zone"   },
  { value: "DISPATCH_ZONE",  label: "Dispatch Zone"  },
];

const ZONE_STATUSES = [
  { value: "ACTIVE",   label: "Active"   },
  { value: "INACTIVE", label: "Inactive" },
];

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

  // ── Field error state ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Handle input changes ───────────────────────────────────────────────────
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for field when user starts typing
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

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
}