import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Wrap any route with this to require login.
// If not logged in, redirects to /login automatically.

export function ProtectedRoute() {
  const { user } = useAuthStore();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
