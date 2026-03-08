// MOVEMENT TIMELINE
import type { MovementLog } from "@/types";
import { MoveRight } from "lucide-react";

export function MovementTimeline({ movements }: { movements: MovementLog[] }) {
  {/* If there are no movements */}
  if (movements.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-[11px] text-gray-700">
        No movements recorded
      </div>
    );
  }

  return (
    <div className="py-3 px-4 overflow-y-auto max-h-[280px]">  {/* Scrollable container with vertical timeline - overflow-y-auto */}
      {movements.map((m, i) => (
        <div
          key={m.id}
          className="flex gap-3 items-start relative"
        > 
          {/* vertical line with a dot*/}
          <div className="flex flex-col items-center flex-shrink-0">

            {/* Highlight the most recent event with a dot */}
            {/* If the item is first in the list, it gets special styling. */}
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 
                ${
                  i === 0
                    ? "bg-[#FF6B00] border border-[#FF6B00] shadow-[0_0_6px_#FF6B00]"
                    : "bg-white/10 border border-white/15"
                }`} 
            />

            {/* Line connecting events, only for older events */}
            {i < movements.length - 1 && (
              <div className="w-[1px] flex-1 min-h-[20px] bg-white/5 my-[3px]" /> 
            )}

          </div>

          {/* content Area - Movement Information*/}
          <div className="flex-1 pb-3">

            {/* Item name with fallback and if item is new (indicated by a 0), it will change color */}
            <div
              className={`text-[11px] font-semibold mb-[2px] ${
                i === 0 ? "text-slate-200" : "text-slate-400"
              }`}
            >
              {m.itemName ?? "Unknown Item"}
            </div>

            {/* Movement details with from and to zones, and an arrow in between. If fromZoneName is null, it shows a dash. */}
            <div className="flex items-center gap-[5px] text-[10px]">
              <span className="text-gray-600">{m.fromZoneName ?? "—"}</span>
              <span className="text-[9px] text-[rgba(255,107,0,0.5)]">
                <MoveRight size={20} />
                </span>
              <span className="text-[#FF6B00]">{m.toZoneName}</span>
            </div>

            {/* Timestamp */}
            <div className="text-[9px] text-gray-700 mt-[2px]">
              {new Date(m.occurredAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}

              {" · "}

              {/* Event type */}
              {m.eventType}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}