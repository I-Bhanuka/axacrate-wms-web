// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — Assigned to: Member 4 - Pulindu
//
// TODO: Implement the login page with form validation and authentication logic.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/http";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import logo from "../assets/logo.png";

export function LoginPage() {
  const navigate      = useNavigate();
  const { login }     = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => api.login({ username, password }),
    onSuccess: (data) => {
      login(data);
      navigate("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-5"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(124,92,252,0.06) 0%, transparent 60%)
        `
      }}
    >
      <div className="w-full max-w-[420px] bg-card border border-border rounded-2xl p-10 shadow-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            <div className="login-logo-icon"><img src={logo} alt="AxaCrate" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "contain" }} /></div>
          </div>
          <div>
            <div className="font-mono font-bold text-lg">AxaCrate</div>
            <div className="text-xs text-muted-foreground">Warehouse Platform</div>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-7">Sign in to access the warehouse dashboard</p>

        {loginMutation.isError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3.5 py-2.5 rounded-lg mb-4">
            ⚠ {getErrorMessage(loginMutation.error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign In →"}
          </Button>
        </form>

      </div>
    </div>
  );
}