import { QueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────────────────────
// REACT QUERY CLIENT
// Central configuration for all data fetching in the app.
//
// KEY SETTINGS:
// - staleTime: 30s — data is considered fresh for 30 seconds, won't refetch
// - retry: 1 — on failure, try once more before showing error
// - refetchOnWindowFocus: false — don't refetch when user switches tabs
// ─────────────────────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS
// Centralise all query keys here so invalidation is consistent.
// Usage: queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all })
// ─────────────────────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  dashboard:  ["dashboard"]                          as const,
  inventory: {
    all:      ["inventory"]                          as const,
    list:     (filters: object) => ["inventory", "list", filters] as const,
    item:     (id: string)      => ["inventory", "item", id]      as const,
    bySku:    (sku: string)     => ["inventory", "sku", sku]      as const,
    lowStock: (t: number)       => ["inventory", "low-stock", t]  as const,
  },
  zones: {
    all:  ["zones"]                       as const,
    item: (id: string) => ["zones", id]   as const,
  },
  movements: {
    recent: (limit: number) => ["movements", "recent", limit] as const,
  },
  alerts: {
    all:        ["alerts"]                               as const,
    filtered:   (status: string) => ["alerts", status]   as const,
    unresolved: ["alerts", "unresolved"]                 as const,
  },
};
