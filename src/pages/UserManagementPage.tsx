// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT PAGE — Admin only
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/http";
import { useAuthStore } from "../store/authStore";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/dashboardComponents/SectionHeader";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Shield, UserPlus, Trash2, RefreshCw,
  User, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  role: string;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  password: string;
  role: string;
}

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

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_BADGE[role] ?? "bg-white/10 text-white/50 border-white/10"}`}>
      <Shield className="h-2.5 w-2.5" />
      {role}
    </span>
  );
}

// ─── Create User Form ─────────────────────────────────────────────────────────

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<CreateUserForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: (dto: CreateUserForm) => api.createUser(dto),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setError(null);
      onSuccess();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Failed to create user. Please try again.");
    },
  });

  const field = (
    key: keyof CreateUserForm,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-colors"
      />
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Two-column grid for the short fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("firstName",   "First name",   "text", "Jane")}
        {field("lastName",    "Last name",    "text", "Smith")}
        {field("phoneNumber", "Phone number", "text", "0771234567")}
        {field("username",    "Username",     "text", "jsmith")}
        {field("password",    "Password",     "password", "Min. 6 characters")}

        {/* Role selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Role
          </label>
          <div className="relative">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full appearance-none bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          </div>
          {/* Role description hint */}
          <p className="text-[10px] text-white/25 leading-tight">
            {ROLE_DESCRIPTIONS[form.role]}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-1">
        <Button
          onClick={() => createUser(form)}
          disabled={isPending || !form.username || !form.password || !form.firstName || !form.lastName}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-40 transition-colors"
        >
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </div>
  );
}

// ─── User List ────────────────────────────────────────────────────────────────

function UserList({
  users,
  loading,
  currentUserId,
  onRoleChange,
  onDelete,
  isActing,
}: {
  users: UserItem[];
  loading: boolean;
  currentUserId: string;
  onRoleChange: (id: string, role: string) => void;
  onDelete: (id: string) => void;
  isActing: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-white/20">
        <User className="h-8 w-8" />
        <p className="text-xs">No users found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/[0.06] hover:bg-transparent">
          {["Name", "Username", "Phone", "Role", ""].map((h, i) => (
            <TableHead key={i} className="text-white/30 text-[11px] font-semibold uppercase tracking-wider">
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isYou = user.id === currentUserId;
          return (
            <TableRow
              key={user.id}
              className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              {/* Name */}
              <TableCell className="py-3">
                <div className="flex items-center gap-2.5">
                  {/* Avatar initial */}
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-white/80">
                      {user.firstName} {user.lastName}
                      {isYou && (
                        <span className="ml-2 text-[10px] text-orange-400/70 font-normal">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Username */}
              <TableCell className="py-3">
                <span className="text-[11px] font-mono text-white/50">{user.username}</span>
              </TableCell>

              {/* Phone */}
              <TableCell className="py-3">
                <span className="text-[11px] text-white/40">{user.phoneNumber}</span>
              </TableCell>

              {/* Role — inline selector for non-self users */}
              <TableCell className="py-3">
                {isYou ? (
                  <RoleBadge role={user.role} />
                ) : (
                  <div className="relative inline-block">
                    <select
                      value={user.role}
                      disabled={isActing}
                      onChange={(e) => onRoleChange(user.id, e.target.value)}
                      className="appearance-none bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white/70 focus:outline-none focus:border-orange-500/50 cursor-pointer disabled:opacity-50 pr-6 transition-colors"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-zinc-900 text-sm">
                          {r}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30 pointer-events-none" />
                  </div>
                )}
              </TableCell>

              {/* Delete */}
              <TableCell className="py-3 text-right">
                {!isYou && (
                  <button
                    disabled={isActing}
                    onClick={() => {
                      if (confirm(`Delete user "${user.username}"? This cannot be undone.`)) {
                        onDelete(user.id);
                      }
                    }}
                    className="p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UserManagementPage() {
  const { user: currentUser } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn:  () => api.getUsers(),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const { mutate: updateRole, isPending: rolePending } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.updateUserRole(id, { role }),
    onSuccess: invalidate,
  });

  const { mutate: deleteUser, isPending: deletePending } = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: invalidate,
  });

  const isActing = rolePending || deletePending;

  // ── Summary counts ─────────────────────────────────────────────────────────

  const counts = (users as UserItem[]).reduce(
    (acc, u) => ({ ...acc, [u.role]: (acc[u.role] ?? 0) + 1 }),
    {} as Record<string, number>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader title="User Management" subtitle="Create and manage warehouse staff access">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <UserPlus size={16} style={{ marginRight: 6 }} />
          {showForm ? "Cancel" : "New User"}
        </Button>
        <Button variant="outline" size="sm" onClick={invalidate}>
          <RefreshCw size={16} style={{ marginRight: 6 }} />
          Refresh
        </Button>
      </PageHeader>

      {/* Role reference cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-2">
        {ROLES.map((role) => (
          <div
            key={role}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-start gap-3"
          >
            <div className={`mt-0.5 flex-shrink-0 h-2 w-2 rounded-full ${
              role === "ADMIN" ? "bg-orange-400" : role === "MANAGER" ? "bg-blue-400" : "bg-emerald-400"
            }`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-white/80">{role}</span>
                <span className="text-[11px] text-white/30 font-mono">
                  {counts[role] ?? 0} {(counts[role] ?? 0) === 1 ? "user" : "users"}
                </span>
              </div>
              <p className="text-[11px] text-white/30 leading-tight">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create user form — shown/hidden by the button */}
      {showForm && (
        <div style={PANEL}>
          <SectionHeader label="CREATE USER" sub="New user will be able to log in immediately" />
          <CreateUserForm onSuccess={() => { setShowForm(false); invalidate(); }} />
        </div>
      )}

      {/* User list */}
      <div style={PANEL}>
        <SectionHeader
          label="ALL USERS"
          sub={`${(users as UserItem[]).length} accounts · change role inline`}
        />
        <UserList
          users={users as UserItem[]}
          loading={isLoading}
          currentUserId={currentUser?.id ?? ""}
          onRoleChange={(id, role) => updateRole({ id, role })}
          onDelete={(id) => deleteUser(id)}
          isActing={isActing}
        />
      </div>
    </>
  );
}
