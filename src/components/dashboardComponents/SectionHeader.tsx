// ── Section header ────────────────────────────────────────────────────────────

export function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="px-4 py-[11px] border-b border-white/5 flex items-baseline gap-[10px]">
      <span className="text-[10px] font-bold tracking-[0.15em] text-gray-500">
        {label}
      </span>
      <span className="text-[9px] text-gray-700">
        {sub}
      </span>
    </div>
  );
}