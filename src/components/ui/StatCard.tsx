import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  highlight?: boolean;
  accentColor?: string;
  className?: string;
}

// Usage:
// <StatCard label="Total Items" value={142} subtitle="unique SKUs" icon="📦" accentColor="#4f8ef7" />

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  accentColor = "#4f8ef7",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card border border-border rounded-xl p-4 overflow-hidden transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: accentColor }}
      />
      
      {icon && (
        <div className="absolute right-4 top-4 text-2xl opacity-25 text-[#576A8F]">
          {icon}
        </div>
      )}
      
      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </div>
      
      <div className="text-2xl font-bold font-mono text-foreground leading-tight mb-1">
        {value}
      </div>
      
      {subtitle && (
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}