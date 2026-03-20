// ─────────────────────────────────────────────────────────────────────────────
// CREATE ZONE PAGE — Assigned to: Member 2 - Aatif
//
// TODO: Build the create zone form and handle submission.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
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
  const qc       = useQueryClient();

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

  // ── Create zone mutation ───────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () =>
      api.createZone({
        name:          form.name.trim(),
        zoneType:      form.zoneType,
        warehouseName: form.warehouseName.trim(),
        capacity:      Number(form.capacity),
        status:        form.status,
      }),
    onSuccess: () => {
      // Invalidate zones cache so ZonesPage refreshes
      qc.invalidateQueries({ queryKey: QUERY_KEYS.zones.all });
      navigate("/zones");
    },
  });

  // ── Handle input changes ───────────────────────────────────────────────────
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for field when user starts typing
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Validate form before submitting ───────────────────────────────────────
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim())          newErrors.name          = "Zone name is required";
    if (!form.zoneType)             newErrors.zoneType      = "Zone type is required";
    if (!form.warehouseName.trim()) newErrors.warehouseName = "Warehouse name is required";
    if (!form.capacity)             newErrors.capacity      = "Capacity is required";
    else if (Number(form.capacity) <= 0) newErrors.capacity = "Capacity must be greater than 0";
    if (!form.status)               newErrors.status        = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;
    createMutation.mutate();
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

      {/* ── Form card ───────────────────────────────────────────────────────── */}
      <div className="max-w-lg rounded-xl border border-border bg-card p-6">

        {/* Zone Name */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">Zone Name</label>
          <input
            type="text"
            placeholder="e.g. StorageZone1"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Zone Type dropdown */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">Zone Type</label>
          <select
            value={form.zoneType}
            onChange={(e) => handleChange("zoneType", e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <option value="" disabled>Select zone type</option>
            {ZONE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.zoneType && <p className="mt-1 text-xs text-red-400">{errors.zoneType}</p>}
        </div>

        {/* Warehouse Name */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">Warehouse Name</label>
          <input
            type="text"
            placeholder="e.g. WarehouseA"
            value={form.warehouseName}
            onChange={(e) => handleChange("warehouseName", e.target.value)}
            className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          {errors.warehouseName && <p className="mt-1 text-xs text-red-400">{errors.warehouseName}</p>}
        </div>

        {/* Capacity */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">Capacity</label>
          <input
            type="number"
            placeholder="e.g. 100"
            value={form.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
            className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          {errors.capacity && <p className="mt-1 text-xs text-red-400">{errors.capacity}</p>}
        </div>

        {/* Status dropdown */}
        <div className="mb-6">
          <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            {ZONE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-400">{errors.status}</p>}
        </div>

        {/* API error message */}
        {createMutation.isError && (
          <p className="mb-4 text-xs text-red-400 text-center">
            Failed to create zone. Please check your inputs and try again.
          </p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition disabled:opacity-50"
        >
          {createMutation.isPending ? "Creating..." : "Create Zone"}
        </button>
      </div>
    </>
  );
}