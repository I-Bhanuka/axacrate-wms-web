import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/http";
import { LayoutDashboard, Boxes, Plus, AlertTriangle, Bell, Grid, ArrowLeftRight, Radar, LogOut, Menu, PanelLeftClose, Users ,FileText } from "lucide-react";
import logo from "../assets/logo.png";
import { LiveFeed } from "./LiveFeed";

{/* The Navigation Items */ }
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/inventory", label: "Inventory", icon: <Boxes size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/createItem", label: "Create Item", icon: <Plus size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/movements", label: "Movements", icon: <ArrowLeftRight size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/zones", label: "Zones", icon: <Grid size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/geofencing", label: "Geofencing", icon: <Radar size={18}/>, roles: ["ADMIN", "MANAGER"] },
  { to: "/low-stock", label: "Low Stock", icon: <AlertTriangle size={18}/> , roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/alerts", label: "Alerts", icon: <Bell size={18}/> , roles: ["ADMIN", "MANAGER", "WORKER"]},
  { to: "/users", label: "User Management", icon: <Users size={18}/>, roles: ["ADMIN"] },
  { to: "/reports", label: "Reports", icon: <FileText size={18} /> },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN"; {/* true if the user is an admin, false if not */}

  {/* Get the user's initials for the avatar in the header. If the username is not available, default to "WH" for Warehouse */}
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "WH";

  {/* Page title management */}
  const location = useLocation();

  const currentNav = NAV_ITEMS.find(items => 
    location.pathname.startsWith(items.to)
  );

  const pageTitle = currentNav?.label || "";

  {/* --- Helper methods --- */}

  {/* Helper method to handle logout, which calls the logout function from the auth store and navigates the user to the login page */}
  const handleLogout = () => {
    logout();
    navigate("/login");
  };


  return (
    <div className="flex h-screen w-screen overflow-x-hidden bg-background text-foreground">

      {/* Mobile overlay */}
      {/* When screen >= 1024px,  hide this element */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-[199] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-screen w-[220px] bg-background border-r border-border
        flex flex-col z-[200] transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        <button
        className="lg:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        onClick={() => setSidebarOpen(false)}
      >
        <PanelLeftClose  size={18} />
      </button>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-base flex-shrink-0">
            <div className="login-logo-icon"><img src={logo} alt="AxaCrate" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "contain" }} /></div>
          </div>
          <div>
            <div className="font-mono font-bold text-sm leading-tight">AxaCrate</div>
            <div className="text-[11px]  text-orange-500 font-light">Warehouse Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-2 pt-3">
            Navigation
          </div>

          {/*
          Items with no restriction → visible to all
          Items with restriction → visible only if allowed
          The condition has to return true for the item to be visible.
          */}
          {NAV_ITEMS.filter(item => 
            !item.roles || item.roles.includes(user?.role)          
          ).map(item  => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                }
              `}
            >
              <span className="w-5 text-center text-[15px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Side bar Footer */}
        <div className="p-3.5 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-foreground font-medium truncate">{user?.username}</span>
            <span className="ml-auto text-orange-200 text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col lg:ml-[220px] min-w-0">

        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-10 gap-3">
          <div className="flex items-center gap-3 min-w-0">

            {/* When screen >= 1024px,  hide this element */}
            <button
              className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setSidebarOpen(o => !o)}>
                <Menu />
            </button>

            {/* Page title */}
            <span className="text-xs text-muted-foreground truncate">
              AxaCrate / {pageTitle}
            </span>

          </div>
          <div className="flex items-center gap-2 flex-shrink-0">

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content — each page renders here */}
        <div className="flex-1 overflow-y-auto p-5">

          {/*  Outlet is where child routes render. */}
          <Outlet />
          
        </div>
      </main>

      {/* Live feed sidebar */}
      <LiveFeed user={user} />
    

    </div>
  );
}
