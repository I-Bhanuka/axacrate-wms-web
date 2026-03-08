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
// TODO: Zone, ZoneCreateRequest, ZoneUpdateRequest


// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY  (M2)
// ─────────────────────────────────────────────────────────────────────────────
// TODO: InventoryItem, InventoryItemCreateRequest, InventoryItemUpdateRequest, PageResponse<T>, InventoryFilters


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

