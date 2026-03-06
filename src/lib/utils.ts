import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// cn() — merge Tailwind classes safely (required by shadcn)
// Usage: cn("px-4 py-2", isActive && "bg-blue-500", className)
// ─────────────────────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────
export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function fmtDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "MMM d, yyyy HH:mm");
}

export function fmtTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "HH:mm");
}

export function fmtRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────
export function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HELPER
// Extracts a readable message from an axios error
// ─────────────────────────────────────────────────────────────────────────────
export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    const msg = response?.data?.message;
    if (typeof msg === "string") return msg;
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
