import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { LoginPage }      from "./pages/LoginPage";
import { DashboardPage }  from "./pages/DashboardPage";
import MovementsPage      from "./pages/MovementsPage";
// TODO: Add othrer pages and their routes here

export default function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* Wrap the app with React Query provider for data fetching/catch rules */}
      <BrowserRouter> {/* Wrap the app with React Router for URL management */}
        <Routes> {/* Define all routes in the app here. */}

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"          element={<DashboardPage />}  />
              <Route path="/movements" element={<MovementsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
