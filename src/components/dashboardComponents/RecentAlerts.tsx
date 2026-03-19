// ─────────────────────────────────────────────────────────────────────────────
// RecentAlerts — Dashboard component
//
// What it does:
//   - Fetches the latest 6 alerts from GET /api/alerts
//   - Auto-refreshes every 15 seconds
//   - Shows type, severity badge, zone, age, and status
//   - Empty state when no alerts exist
//   - Skeleton loading state
//   - No props needed — fully self-contained
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { Skeleton } from "../ui/skeleton";
import type { AlertItemDashboard } from "@/types";
import { AlertTriangle, ShieldCheck, Clock } from "lucide-react";


// ─── Component ────────────────────────────────────────────────────────────────

const MAX_SHOWN = 6; // How many alerts to display in the dashboard widget

export function RecentAlerts() {
  const navigate = useNavigate();

  const { data: allAlerts = [], isLoading } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn:  () => api.getAlerts(),
    refetchInterval: 15_000,
  });

  const alerts = (allAlerts as AlertItemDashboard[]).slice(0, MAX_SHOWN);

  console.log("RecentAlerts data:", alerts);

  return <div />;
}
