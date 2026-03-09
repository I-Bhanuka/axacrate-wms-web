// Pulindu TOOD: Implement auth store with login/logout and token management

import { create } from "zustand";

import { persist } from "zustand/middleware";

import type { AuthUser } from "../types/index.ts";



// ─────────────────────────────────────────────────────────────────────────────

// AUTH STORE

// Persists to localStorage so the user stays logged in on page refresh.

// Access from any component: const { user, login, logout } = useAuthStore();

// ─────────────────────────────────────────────────────────────────────────────



interface AuthState {

  user: AuthUser | null;

  login:  (user: AuthUser) => void;

  logout: () => void;

}



export const useAuthStore = create<AuthState>()(

  persist(

    (set) => ({

      user: null,



      login: (user) => {

        // Also set the global token so the axios interceptor picks it up

        window.__authToken = user.token;

        set({ user });

      },



      logout: () => {

        window.__authToken = null;

        set({ user: null });

      },

    }),

    {

      name: "warp-auth", // localStorage key

      // Only persist the user object, not the functions

      partialize: (state) => ({ user: state.user }),

      // Restore token to window on page refresh

      onRehydrateStorage: () => (state) => {

        if (state?.user?.token) {

          window.__authToken = state.user.token;

        }

      },

    }

  )

);