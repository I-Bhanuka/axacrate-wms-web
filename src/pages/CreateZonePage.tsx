// ─────────────────────────────────────────────────────────────────────────────
// CREATE ZONE PAGE — Assigned to: Member 3 - Aatif
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowLeft } from "lucide-react";
import type { Warehouse } from "../types";

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

  // ── Fetch warehouses for dropdown ─────────────────────────────────────────
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn:  api.getWarehouses,
  });

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
      qc.invalidateQueries({ queryKey: QUERY_KEYS.zones.all });
      navigate("/zones");
    },
  });

  // ── Handle input changes ───────────────────────────────────────────────────
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
          <ArrowLeft size={16} className="mr-1.5" />
          Back
        </Button>
      </PageHeader>

      {/* ── Form card ───────────────────────────────────────────────────────── */}
      <div className="max-w-lg rounded-xl border border-border bg-card p-6">

        {/* Zone Name */}
        <div className="mb-4">
          <Label className="mb-1.5 block">Zone Name</Label>
          <Input
            type="text"
            placeholder="e.g. StorageZone1"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Zone Type dropdown */}
        <div className="mb-4">
          <Label className="mb-1.5 block">Zone Type</Label>
          <Select value={form.zoneType} onValueChange={(val) => handleChange("zoneType", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select zone type" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border border-border" position="popper">
              {ZONE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.zoneType && <p className="mt-1 text-xs text-red-400">{errors.zoneType}</p>}
        </div>

        {/* Warehouse Name dropdown */}
        <div className="mb-4">
        <Label className="mb-1.5 block">Warehouse</Label>
        <Select value={form.warehouseName} onValueChange={(val) => handleChange("warehouseName", val)}>
            <SelectTrigger className="w-full">
            <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border border-border" position="popper">
            {warehouses.map((w: Warehouse) => (
                <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
            ))}
            </SelectContent>
        </Select>
        {errors.warehouseName && <p className="mt-1 text-xs text-red-400">{errors.warehouseName}</p>}
        </div>

        {/* Capacity */}
        <div className="mb-4">
          <Label className="mb-1.5 block">Capacity</Label>
          <Input
            type="number"
            placeholder="e.g. 100"
            value={form.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
            className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          {errors.capacity && <p className="mt-1 text-xs text-red-400">{errors.capacity}</p>}
        </div>

        {/* Status dropdown */}
        <div className="mb-6">
          <Label className="mb-1.5 block">Status</Label>
          <Select value={form.status} onValueChange={(val) => handleChange("status", val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border border-border" position="popper">
              {ZONE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className="mt-1 text-xs text-red-400">{errors.status}</p>}
        </div>

        {/* API error message */}
        {createMutation.isError && (
          <p className="mb-4 text-xs text-red-400 text-center">
            Failed to create zone. Please check your inputs and try again.
          </p>
        )}

        {/* Submit button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create Zone"}
        </Button>
      </div>
    </>
  );
}
