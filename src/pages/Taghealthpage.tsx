import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Activity, AlertTriangle, CheckCircle2, RefreshCw, ArrowLeftRight, X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TagHealth {
  tagId: string;
  tagUid: string;
  tagStatus: string;           // ACTIVE, INACTIVE, LOST
  healthStatus: string;        // HEALTHY, UNHEALTHY
  readsInWindow: number;       // reads in the last 60 seconds
  windowSeconds: number;       // measurement window (60)
  readsPerSecond: number;      // calculated frequency
  minReadsPerSecond: number;   // minimum standard (0.1)
  inventoryItemId: string | null;
  inventoryItemName: string | null;
  lastSeenZone: string | null;
  lastSeenAt: string | null;
  alertRaised: boolean;
}

// ─── Replace Tag Modal ────────────────────────────────────────────────────────

function ReplaceTagModal({
  tag, onClose, onSuccess,
}: {
  tag: TagHealth;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newTagUid, setNewTagUid] = useState("");
  const [error, setError]         = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.replaceTag({ unhealthyTagUid: tag.tagUid, newTagUid: newTagUid.trim(), alertId: "" }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError:   () => setError("Failed to replace tag. Check the new tag UID."),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl p-6" style={{ background: "#0f1318", border: "1px solid rgba(255,255,255,0.1)" }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Replace Tag</h2>
            <p className="text-[11px] text-white/40 mt-0.5">
              Transfer inventory from <span className="font-mono text-orange-400">{tag.tagUid}</span> to a new tag
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Unhealthy tag info */}
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 mb-4">
          <p className="text-[11px] text-orange-400 font-medium mb-1">Unhealthy Tag</p>
          <p className="font-mono text-sm text-white">{tag.tagUid}</p>
          <p className="text-[11px] text-white/50 mt-1">
            Read frequency: <span className="text-orange-400">{tag.readsPerSecond} reads/sec</span>
            {" "}(min: {tag.minReadsPerSecond} reads/sec)
          </p>
          {tag.inventoryItemName && (
            <p className="text-[11px] text-white/50 mt-0.5">Assigned to: {tag.inventoryItemName}</p>
          )}
          {tag.lastSeenZone && (
            <p className="text-[11px] text-white/50">Last zone: {tag.lastSeenZone}</p>
          )}
        </div>

        {/* New tag UID */}
        <div className="mb-5">
          <label className="text-[11px] text-white/50 uppercase tracking-wider font-medium block mb-1.5">
            New Tag UID
          </label>
          <input
            type="text"
            value={newTagUid}
            onChange={(e) => setNewTagUid(e.target.value)}
            placeholder="e.g. 04:A3:22:1B"
            className="w-full rounded-lg px-3 py-2 text-sm text-white bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none font-mono"
          />
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 border-white/10 text-white/50">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={!newTagUid || mutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
          >
            {mutation.isPending ? "Replacing..." : "Replace & Transfer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TagHealthPage() {
  const queryClient = useQueryClient();
  const [replacingTag, setReplacingTag] = useState<TagHealth | null>(null);
  const [filterHealth, setFilterHealth] = useState<"ALL" | "HEALTHY" | "UNHEALTHY">("ALL");

  const { data: tags = [], isLoading } = useQuery<TagHealth[]>({
    queryKey: ["tag-health"],
    queryFn:  () => api.getTagHealth(),
    refetchInterval: 30000,
  });

  const healthyCount   = tags.filter((t) => t.healthStatus === "HEALTHY").length;
  const unhealthyCount = tags.filter((t) => t.healthStatus === "UNHEALTHY").length;
  const inactiveCount  = tags.filter((t) => t.tagStatus === "INACTIVE").length;

  const filtered = tags.filter((t) =>
    filterHealth === "ALL" ? true : t.healthStatus === filterHealth
  );

  function fmtTs(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
           " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      {replacingTag && (
        <ReplaceTagModal
          tag={replacingTag}
          onClose={() => setReplacingTag(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tag-health"] })}
        />
      )}

      <PageHeader title="Tag Health" subtitle="Monitor RFID tag read frequency and replace underperforming tags">
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["tag-health"] })}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <StatCard label="Total Tags"  value={tags.length}    icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Healthy"     value={healthyCount}   icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Unhealthy"   value={unhealthyCount} icon={<AlertTriangle className="h-4 w-4" />} highlight={unhealthyCount > 0} />
        <StatCard label="Inactive"    value={inactiveCount}  icon={<AlertTriangle className="h-4 w-4" />} highlight={inactiveCount > 0} />
      </div>

      {/* Table panel */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>

        {/* Filter bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <p className="text-[11px] text-white/40 font-medium uppercase tracking-wider">All Tags</p>
          <div className="flex gap-1">
            {(["ALL", "HEALTHY", "UNHEALTHY"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterHealth(f)}
                className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
                  filterHealth === f ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-white/25">
            <CheckCircle2 className="h-9 w-9 text-emerald-500/40" />
            <p className="text-xs font-medium">No tags found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  {["Tag UID", "Health", "Status", "Reads/sec", "Reads (60s)", "Assigned Item", "Zone", "Last Seen", "Actions"].map((h) => (
                    <TableHead key={h} className="text-white/30 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tag) => {
                  const isUnhealthy = tag.healthStatus === "UNHEALTHY";
                  const belowThreshold = tag.readsPerSecond < tag.minReadsPerSecond;

                  return (
                    <TableRow
                      key={tag.tagId}
                      className={`border-white/[0.04] transition-colors ${
                        isUnhealthy ? "bg-orange-500/5 hover:bg-orange-500/10" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Tag UID */}
                      <TableCell className="py-3 font-mono text-[11px] text-white/70">
                        {tag.tagUid}
                      </TableCell>

                      {/* Health */}
                      <TableCell className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          isUnhealthy
                            ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}>
                          {isUnhealthy ? <AlertTriangle className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5" />}
                          {tag.healthStatus}
                        </span>
                      </TableCell>

                      {/* Tag Status */}
                      <TableCell className="py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          tag.tagStatus === "ACTIVE"   ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : tag.tagStatus === "INACTIVE" ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-white/10 text-white/40 border-white/10"
                        }`}>
                          {tag.tagStatus}
                        </span>
                      </TableCell>

                      {/* Reads/sec */}
                      <TableCell className="py-3">
                        <span className={`text-sm font-bold ${belowThreshold ? "text-orange-400" : "text-emerald-400"}`}>
                          {tag.readsPerSecond.toFixed(3)}
                        </span>
                        <span className="text-[10px] text-white/25 ml-1">
                          / min {tag.minReadsPerSecond}
                        </span>
                      </TableCell>

                      {/* Reads in window */}
                      <TableCell className="py-3 text-[11px] text-white/40">
                        {tag.readsInWindow} in {tag.windowSeconds}s
                      </TableCell>

                      {/* Assigned Item */}
                      <TableCell className="py-3 text-[11px] text-white/50">
                        {tag.inventoryItemName ?? <span className="text-white/20 italic">Unassigned</span>}
                      </TableCell>

                      {/* Zone */}
                      <TableCell className="py-3 text-[11px] text-white/50">
                        {tag.lastSeenZone ?? "—"}
                      </TableCell>

                      {/* Last Seen */}
                      <TableCell className="py-3 text-[11px] text-white/35 whitespace-nowrap">
                        {fmtTs(tag.lastSeenAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3">
                        {isUnhealthy && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplacingTag(tag)}
                            className="h-6 px-2 text-[10px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10 whitespace-nowrap"
                          >
                            <ArrowLeftRight className="h-3 w-3 mr-1" />
                            Replace
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}