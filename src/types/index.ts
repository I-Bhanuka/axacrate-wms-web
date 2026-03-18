// ─────────────────────────────────────────────────────────────────────────────
// API WRAPPER
// Every backend response is wrapped in ApiResponse<T>
// ─────────────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  status: string;
  message: string | null;
  data: T;
}


// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  totalItems: number;
  totalQuantity: number;
  lowStockCount: number;
  activeZones?: number;
  itemsByZone: Record<string, number>;
  // recentItems: InventoryItem[]; // Add later when have recentItems
}

// For the Life Feed component on the dashboard
export interface FeedEntry {
  id: string;
  itemName: string;
  fromZone: string | null;
  toZone: string;
  date: string;
  time: string;
  isNew: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (M4 - Pulindu)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: loginRequest, AuthUser

export interface LoginRequest {

  username: string;

  password: string;

}



export interface AuthUser {

  token: string;

  username: string;

  role: string;

}
// ─────────────────────────────────────────────────────────────────────────────
// ZONES  (M3)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: ZoneUpdateRequest

// Represents a zone as returned by the backend
export interface Zone {
  id: string;
  name: string;
  zoneType: string;
  capacity: number;
  currentItemCount: number;
  warehouseName: string;
  status: "ACTIVE" | "INACTIVE";
  hasHardware: boolean;
  hardwareName: string | null;
  hardwareType: string | null;
  hardwareStatus: string | null;
}

// Request payload for creating a new zone
export interface ZoneCreateRequest {
  name: string;
  zoneType: string;
  warehouseName: string;
  capacity: number;
  status: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY  (M2)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: InventoryItem, InventoryItemCreateRequest, InventoryItemUpdateRequest, PageResponse<T>, InventoryFilters

// Single inventory item (used in View Item page & Inventory list)
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  currentZoneName: string;
  currentZoneId: string;
  rfidTagUid: string | null;
  rfidTagStatus: string | null;
  createdAt: string;
  updatedAt?: string;
}


export interface InventoryItemCreateRequest {
  sku: string;
  name: string;
  quantity: number;
  rfidTag: string;
  zoneName: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// RFID  (M1 - Bhanuka)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: RfidScanResponse, RfidTagStatus
export type RfidTagStatus = "UNASSIGNED" | "ASSIGNED" | "NEW_TAG";


export interface RfidScanResponse {
  tagUid: string;
  status: RfidTagStatus;
  currentZone: string | null;
  itemName?: string;
  sku?: string;
  inventoryItemId?: string;
}


// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENT LOG  (M6 - Ahintha)
// ─────────────────────────────────────────────────────────────────────────────
export interface MovementLog {
  id: string;
  fromZoneName: string | null;
  toZoneName: string | null;
  eventType: string;
  occurredAt: string;
  hardwareType: string | null;
  synced: boolean;
  itemSku: string | null;
  itemName: string | null;
}


// ─────────────────────────────────────────────────────────────────────────────
// ALERTS  (M4 - Pulindu)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: Alert
export interface Alert {
  id: string;
  alertType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  alertStatus: "PENDING" | "ACKNOWLEDGED" | "RESOLVED";
  message: string | null;
  zoneId: string | null;
  zoneName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUsername: string | null;
}

export interface CreateAlertRequest {
  alertType: string;
  severity: string;
  message: string;
  zoneId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOFENCING  (M5 - Daniru)
// ─────────────────────────────────────────────────────────────────────────────
// TOOD: GeofencingRule

