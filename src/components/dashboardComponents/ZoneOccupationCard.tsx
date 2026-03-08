import type { Zone } from "@/types";
import { UtilDial } from "./UtilDial";
import { Dot  } from "lucide-react"

// ── Zone utilization color ─────────────────────────────────────────
function utilColor(p: number) {
  if (p >= 90) return "#ef4444";
  if (p >= 70) return "#f59e0b";
  return "#22c55e";
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

export function ZoneOccupationCard({ zone }: { zone: Zone }) {
  const u = pct(zone.currentItemCount, zone.capacity);
  const col = utilColor(u);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] px-[14px] py-[12px]">
      
      {/* background fill glow */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-in-out"
        style={{
          height: `${u}%`,
          background: `${col}08`,
        }}
      />

      <div className="relative">
        
        {/* header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="max-w-[80px] text-[10px] font-bold uppercase tracking-[0.1em] leading-[1.3] text-gray">
            {zone.name}
          </div>

          <div
            className="h-[6px] w-[6px] rounded-full"
            style={{
              background: zone.status === "ACTIVE" ? "#22c55e" : "#374151",
              boxShadow:
                zone.status === "ACTIVE" ? "0 0 5px #22c55e" : "none",
            }}
          />
        </div>

        {/* arc / dial */}
        <UtilDial pct={u} color={col} />

        {/* stats */}
        <div className="mt-[6px] flex justify-between text-[11px] text-gray">
          <span>{zone.currentItemCount} items</span>
          <span>cap {zone.capacity}</span>
        </div>

        {/* hardware */}
        {zone.hasHardware && (
          <div
            className="mt-[10px] text-[10px] tracking-[0.08em]"
            style={{
              color:
                zone.hardwareStatus === "ONLINE"
                  ? "#22c55e"
                  : "#BFC9D1",
            }}
          >
             <Dot size={25}/> Hardware Status - {zone.hardwareStatus ?? "UNKNOWN"}
          </div>
        )}
      </div>
    </div>
  );
}

