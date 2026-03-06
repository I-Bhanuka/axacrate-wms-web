import { getZoneColor } from "../../api/zoneColors";
import { cn } from "../../lib/utils";

interface ZoneBadgeProps {
  zone: string | null | undefined;
  className?: string;
}

export function ZoneBadge({ zone, className }: ZoneBadgeProps) {
  if (!zone) return <span className="text-muted-foreground text-xs">—</span>;

  const color = getZoneColor(zone);

  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono", className)}
      style={{
        color,
        background: `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {zone}
    </span>
  );
}
