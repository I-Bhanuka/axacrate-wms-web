// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT PAGE — Admin only
// ─────────────────────────────────────────────────────────────────────────────

import type { CreateUserForm } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["ADMIN", "MANAGER", "WORKER"] as const;

// What each role can do — displayed as a quick reference in the UI
const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN:   "Full access — can manage users, all zones, all items, and all alerts",
  MANAGER: "Can view all data, acknowledge alerts, and manage inventory",
  WORKER:  "Can view inventory and zones, scan RFID tags, log movements",
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  MANAGER: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  WORKER:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const PANEL: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginTop: 20,
};

const EMPTY_FORM: CreateUserForm = {
  firstName: "", lastName: "", phoneNumber: "",
  username: "", password: "", role: "WORKER",
};