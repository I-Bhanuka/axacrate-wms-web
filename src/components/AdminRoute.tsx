// ─────────────────────────────────────────────────────────────────────────────
// A route wrapper that only lets ADMIN users through.
// If a non-admin tries to visit /users directly in the URL bar,
// they get redirected to /dashboard immediately.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function AdminRoute() {
  const { user } = useAuthStore();

  // If the user is not an admin, redirect them to dashboard silently.
  // They won't see an error — they just end up on the dashboard.
  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin confirmed — render the child route normally
  return <Outlet />;
}

