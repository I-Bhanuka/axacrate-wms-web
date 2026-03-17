// ── Mini utilization dial (SVG arc) ─────────────────────────────────

export function UtilDial({ pct: p, color }: { pct: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (p / 100) * circ * 0.75;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[56px] w-[56px]">
        
        <svg
          width="56"
          height="56"
          className="rotate-[135deg]"
        >
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
            strokeLinecap="round"
          />

          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${fill} ${circ - fill}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        </svg>

        <div
          className="absolute inset-0 flex items-center justify-center text-[12px] font-bold"
          style={{ color }}
        >
          {p}%
        </div>
      </div>
    </div>
  );
}