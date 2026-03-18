import axios from "axios";
import type {
  ApiResponse,
  DashboardSummary,
  InventoryItem,
  Alert,
  CreateAlertRequest,
  InventoryItemCreateRequest,
  MovementLog,
  Zone,
  ZoneCreateRequest,
  RfidScanResponse,
} from "../types";
import type { AuthUser, LoginRequest } from "@/types/index";

// Base URL comes from .env file
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const http = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request automatically
http.interceptors.request.use((config) => {
  const token = window.__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, fire the logout callback registered by the auth store
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.__authToken = null;
      window.__onAuthExpired?.();
    }
    return Promise.reject(err);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API CALLS
// Add your new endpoint here. Keep them grouped by feature.
// ─────────────────────────────────────────────────────────────────────────────

export const api = {

  // ── Auth (M4 - Pulindu) ──────────────────────────────────────────────────────────────
  // TODO: login
  login: async (data: LoginRequest): Promise<AuthUser> => {

    const res = await http.post<AuthUser>("/api/auth/login", data);

    return res.data;

  },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<DashboardSummary> => {
    const res = await http.get<ApiResponse<DashboardSummary>>("/api/inventory/dashboard");
    return res.data.data;
  },

  // ── Inventory (M2 - Sheshan) ────────────────────────────────────────────────────────
  // TODO: getItems with filters, getItem by id/sku, create/update/delete item, getLowStock

  createItem: async (data: InventoryItemCreateRequest): Promise<InventoryItem> => {
    const res = await http.post<ApiResponse<InventoryItem>>("/api/inventory/create", data);
    return res.data.data;
  },
  

  // ── Zones (M3 - Aatif) ────────────────────────────────────────────────────────────
  // TODO: getZones, getZone by id, create/update zone, getWarehouses for dropdown

  // Getting all the zones from the database
  getZones: async (): Promise<Zone[]> => {
    const res = await http.get<ApiResponse<Zone[]>>("/api/zones");
    return res.data.data;
  },

  // Getting a specific zone by its name
  getZoneByName: async (name: string): Promise<Zone> => {
    const res = await http.get<ApiResponse<Zone>>(`/api/zones/name/${name}`);
    return res.data.data;
  },

  // Create a new zone in the system
  createZone: async (data: ZoneCreateRequest): Promise<Zone> => {
    const res = await http.post<ApiResponse<Zone>>("/api/zones", data);
    return res.data.data;
  },
  
  // ── RFID (M1 - Bhanuka) ─────────────────────────────────────────────────────────────
  // TODO: pollRfid
    pollRfid: async (): Promise<RfidScanResponse | null> => {
    const res = await http.get<ApiResponse<RfidScanResponse | null>>("/api/rfid/write-latest");
    return res.data.data;
  },


  // ── Movement Log (M6 - Ahintha) ─────────────────────────────────────────────────────
    getMovements: async (limit = 20): Promise<MovementLog[]> => {
        const res = await http.get<ApiResponse<MovementLog[]>>("/api/movements/recent", {
          params: { limit },
        });
        return res.data.data;
      },
  


  // ── Warehouses (M3 - Aatif) ────────────────────────────────────────────────────────────
  // TODO: getWarehouses for dropdown
  

  // ── Alerts (M4 - Pulindu) ──────────────────────────────────────────────────────────────
  getAlerts: async (status?: string): Promise<Alert[]> => {
    const res = await http.get<ApiResponse<Alert[]>>("/api/alerts", { params: status ? { status } : {} });
    return res.data.data;
  },

  getAlertsByZone: async (zoneId: string): Promise<Alert[]> => {
    const res = await http.get<ApiResponse<Alert[]>>(`/api/zones/${zoneId}/alerts`);
    return res.data.data;
  },

  getUnresolvedAlerts: async (): Promise<Alert[]> => {
    const res = await http.get<ApiResponse<Alert[]>>("/api/alerts/unresolved");
    return res.data.data;
  },

  acknowledgeAlert: async (id: string): Promise<Alert> => {
    const res = await http.put<ApiResponse<Alert>>(`/api/alerts/${id}/acknowledge`);
    return res.data.data;
  },

  resolveAlert: async (id: string): Promise<Alert> => {
    const res = await http.put<ApiResponse<Alert>>(`/api/alerts/${id}/resolve`);
    return res.data.data;
  },

  createAlert: async (data: CreateAlertRequest): Promise<Alert> => {
    const res = await http.post<ApiResponse<Alert>>("/api/alerts", data);
    return res.data.data;
  },
};



// Extend window type for global token storage
declare global {
  interface Window {
    __authToken: string | null;
    __onAuthExpired?: () => void;
  }
}
