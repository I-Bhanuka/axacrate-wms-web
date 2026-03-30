import { useState, useEffect, useMemo, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { LayoutDashboard, Boxes, Plus, AlertTriangle, Bell, Grid, ArrowLeftRight, Radar, LogOut, Menu, PanelLeftClose, Users, FileText, Radio } from "lucide-react";
import logo from "../assets/logo.png";
import { LiveFeed } from "./LiveFeed";
import { api } from "../api/http";
import { QUERY_KEYS } from "../lib/queryClient";
import { fmtRelative } from "../lib/utils";

{/* The Navigation Items */ }
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/inventory", label: "Inventory", icon: <Boxes size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/createItem", label: "Create Item", icon: <Plus size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/movements", label: "Movements", icon: <ArrowLeftRight size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/zones", label: "Zones", icon: <Grid size={18}/>, roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/geofencing", label: "Geofencing", icon: <Radar size={18}/>, roles: ["ADMIN", "MANAGER"] },
  { to: "/tag-health", label: "Tag Health", icon: <Radio size={18}/>, roles: ["ADMIN", "MANAGER","WORKER"] },
  { to: "/low-stock", label: "Low Stock", icon: <AlertTriangle size={18}/> , roles: ["ADMIN", "MANAGER", "WORKER"] },
  { to: "/alerts", label: "Alerts", icon: <Bell size={18}/> , roles: ["ADMIN", "MANAGER", "WORKER"]},
  { to: "/users", label: "User Management", icon: <Users size={18}/>, roles: ["ADMIN"] },
  { to: "/reports", label: "Reports", icon: <FileText size={18} />, roles: ["ADMIN", "MANAGER"] },
];

const ALERT_TYPE_LABEL: Record<string, string> = {
  UNAUTHORIZED_MOVEMENT: "Unauthorized Movement",
  TAG_MISMATCH: "Tag Mismatch",
  OFFLINE_READ: "Offline Read",
  SYNC_FAILURE: "Sync Failure",
};

const ALERT_STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-300",
  ACKNOWLEDGED: "text-blue-300",
  RESOLVED: "text-green-400",
};

const ALERT_SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-blue-400",
};

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  {/* State to control the visibility of the sidebar on mobile devices. Initially set to false (hidden) */}
  const [sidebarOpen, setSidebarOpen] = useState(false);
  {/* State to control the visibility of the live feed sidebar. Initially set to false (hidden) */}
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsPanelRef = useRef<HTMLDivElement | null>(null);


  {/* State to track if the screen size is mobile or desktop. This is used to conditionally render certain elements and apply different styles based on the screen size. Initially set to false (not mobile) */}
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // mobile = width < 1024px
    };

    // Check on first render
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Clean up listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close the alert panel when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!alertsPanelRef.current) return;
      if (event.target instanceof Node && !alertsPanelRef.current.contains(event.target)) {
        setAlertsOpen(false);
      }
    };

    if (alertsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [alertsOpen]);

  const { data: alerts = [] } = useQuery({
    queryKey: QUERY_KEYS.alerts.all,
    queryFn: () => api.getAlerts(),
    refetchInterval: 15_000,
  });

  const pendingAlertCount = alerts.filter((alert) => alert.alertStatus === "PENDING").length;

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => {
          const statusOrder = ["PENDING", "ACKNOWLEDGED", "RESOLVED"];
          const aStatusIndex = statusOrder.indexOf(a.alertStatus);
          const bStatusIndex = statusOrder.indexOf(b.alertStatus);
          if (aStatusIndex !== bStatusIndex) return aStatusIndex - bStatusIndex;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 6),
    [alerts]
  );


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

      {/* Mobile overlay — Live Feed */}
      {liveFeedOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-[199] lg:hidden"
          onClick={() => setLiveFeedOpen(false)}
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
            !item.roles || item.roles.includes(user?.role ?? "") &&
            !(isMobile && item.to === "/createItem")  // hide on mobile          
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
      <main className="flex-1 flex flex-col lg:ml-[220px] lg:mr-[260px] min-w-0">

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

          {/* User avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">

            <div className="relative" ref={alertsPanelRef}>
              <button
                className="relative p-1.5 rounded-md text-muted-foreground hover:bg-muted"
                onClick={() => setAlertsOpen((open) => !open)}
                aria-label="Open notifications"
              >
                <Bell size={18} />
                {pendingAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-semibold text-center">
                    {pendingAlertCount > 99 ? "99+" : pendingAlertCount}
                  </span>
                )}
              </button>

              {alertsOpen && (
                <div className="absolute right-0 mt-2 w-[320px] max-w-[90vw] rounded-lg border border-border bg-neutral-950 shadow-xl z-30 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <button
                      className="text-xs text-orange-400 hover:text-orange-300"
                      onClick={() => {
                        setAlertsOpen(false);
                        navigate("/alerts");
                      }}
                    >
                      View all
                    </button>
                  </div>

                  {recentAlerts.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No alerts yet.
                    </div>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto">
                      {recentAlerts.map((alert) => (
                        <button
                          key={alert.id}
                          onClick={() => {
                            setAlertsOpen(false);
                            navigate("/alerts");
                          }}
                          className="w-full text-left px-3 py-2.5 border-b border-border/70 bg-neutral-950 hover:bg-neutral-900 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[11px] font-semibold ${ALERT_SEVERITY_COLOR[alert.severity] ?? "text-foreground"}`}>
                              {alert.severity}
                            </span>
                            <span className={`text-[11px] ${ALERT_STATUS_COLOR[alert.alertStatus] ?? "text-muted-foreground"}`}>
                              {alert.alertStatus}
                            </span>
                          </div>
                          <p className="text-xs text-foreground mt-1 truncate">
                            {ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1 truncate">
                            {alert.zoneName ?? "No zone"} • {fmtRelative(alert.createdAt)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Feed toggle — mobile only */}
            <button
              className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-muted"
              onClick={() => setLiveFeedOpen(o => !o)}
            >
              <Radio size={18} />
            </button>

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

      <LiveFeed
        user={user}
        isOpen={liveFeedOpen}
        onClose={() => setLiveFeedOpen(false)}
      />
          

    </div>
  );
}
