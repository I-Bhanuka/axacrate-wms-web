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


// ─────────────────────────────────────────────────────────────────────────────
// ZONES  (M3)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: ZoneCreateRequest, ZoneUpdateRequest
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


// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENT LOG  (M6 - Ahintha)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: MovementLog


// ─────────────────────────────────────────────────────────────────────────────
// ALERTS  (M4 - Pulindu)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: Alert


// ─────────────────────────────────────────────────────────────────────────────
// GEOFENCING  (M5 - Daniru)
// ─────────────────────────────────────────────────────────────────────────────
// TOOD: GeofencingRule

