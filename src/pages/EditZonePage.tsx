// ─────────────────────────────────────────────────────────────────────────────
// EDIT ZONE PAGE — Assigned to: Member 3 - Aatif
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// ── Status options matching backend enums ──────────────────────────────────
const ZONE_STATUSES = [
  { value: "ACTIVE",   label: "Active"   },
  { value: "INACTIVE", label: "Inactive" },
];

export function EditZonePage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  // ── Get warehouse name and zone name from URL params ───────────────────────
  const { warehouseName, name } = useParams<{ warehouseName: string; name: string }>();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:     "",
    capacity: "",
    status:   "",
  });

  // ── Field error state ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Fetch current zone data to pre-fill the form ───────────────────────────
  const { data: zone, isLoading } = useQuery({
    queryKey: QUERY_KEYS.zones.item(name ?? ""),
    queryFn:  () => api.getZoneByName(name ?? ""),
    enabled:  !!name,
  });

  // ── Pre-fill form once zone data is loaded ─────────────────────────────────
  useEffect(() => {
    if (zone) {
      setForm({
        name:     zone.name,
        capacity: String(zone.capacity),
        status:   zone.status,
      });
    }
  }, [zone]);

  // ── Update zone mutation ───────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () =>
      api.updateZone(warehouseName ?? "", name ?? "", {
        name:     form.name.trim() !== name          ? form.name.trim()    : undefined,
        capacity: zone && Number(form.capacity) !== zone.capacity ? Number(form.capacity) : undefined,
        status:   form.status !== zone?.status       ? form.status         : undefined,
      }),
    onSuccess: () => {
      // Playing a subtle notification sound
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 520;
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
      
      qc.invalidateQueries({ queryKey: QUERY_KEYS.zones.all });
      toast.success("Zone edited successfully!");
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
    if (!form.name.trim()) newErrors.name = "Zone name is required";
    if (!form.capacity)    newErrors.capacity = "Capacity is required";
    else if (Number(form.capacity) <= 0) newErrors.capacity = "Capacity must be greater than 0";
    if (!form.status)      newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;
    updateMutation.mutate();
  };

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <PageHeader title="Edit Zone" subtitle={`Editing ${name} in ${warehouseName}`}>
        <Button variant="outline" size="sm" onClick={() => navigate("/zones")}>
          <ArrowLeft size={16} className="mr-1.5" />
          Back
        </Button>
      </PageHeader>

      {/* ── Form card ───────────────────────────────────────────────────────── */}
      <div className="max-w-lg rounded-xl border border-border bg-card p-6">

        {/* Loading state while fetching zone data */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <>
            {/* Zone Name */}
            <div className="mb-4">
              <Label className="mb-1.5 block">Zone Name</Label>
              <Input
                type="text"
                placeholder="Enter zone name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Capacity */}
            <div className="mb-4">
              <Label className="mb-1.5 block">Capacity</Label>
              <Input
                type="number"
                placeholder="Enter capacity"
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
            {updateMutation.isError && (
              <p className="mb-4 text-xs text-red-400 text-center">
                Failed to update zone. Please check your inputs and try again.
              </p>
            )}

            {/* Submit button */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        )}
      </div>
    </>
  );
}