import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";  
import { Toaster } from "sonner";

// Pages
import { LoginPage }      from "./pages/LoginPage";
import { DashboardPage }  from "./pages/DashboardPage";
import MovementsPage      from "./pages/MovementsPage";
import { CreateItemPage } from "./pages/CreateItemPage";
import { AlertsPage }     from "./pages/AlertsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { ZonesPage }       from "./pages/ZonesPage";
import ReportsPage from "./pages/ReportsPage.tsx";
import LowStockPage from "./pages/LowStockPage";
import { CreateZonePage }  from "./pages/CreateZonePage";
import { EditZonePage } from "./pages/EditZonePage";
import { ViewItemPage } from "./pages/ViewItemPage";

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
              <Route path="/createItem"      element={<CreateItemPage />} />
              <Route path="/alerts"             element={<AlertsPage />}     />
              <Route path="/inventory"          element={<InventoryPage />}  />
              <Route path="/zones"        element={<ZonesPage />} />
              <Route path="/low-stock" element={<LowStockPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/zones/create" element={<CreateZonePage />} />
              <Route path="/zones/edit/:warehouseName/:name" element={<EditZonePage />} />
              <Route path="/items/:id" element={<ViewItemPage />} />

              {/* Admin-only routes */}
              {/* AdminRoute checks role. Non-admins are redirected to /dashboard. */}
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UserManagementPage />} />
              </Route>
            
            </Route>
            
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: "#131720",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#ffffff",
          },
        }}
      />
    </QueryClientProvider>
  );
}
