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

export interface AlertItemDashboard {
  id: string;
  alertType: string;      // e.g. "UNAUTHORIZED_MOVEMENT"
  severity: string;       // "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  alertStatus: string;    // "PENDING" | "ACKNOWLEDGED" | "RESOLVED"
  message: string | null;
  zoneName: string | null;
  createdAt: string;      // ISO timestamp
}


// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (M4 - Pulindu)
// ─────────────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}



export interface AuthUser {
  token: string;
  username: string;
  role: string;
  id: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONES  (M3)
// ─────────────────────────────────────────────────────────────────────────────

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

// Request payload for updating an existing zone (All fields when updating are optional)
export interface ZoneUpdateRequest {
  name?: string;
  capacity?: number;
  status?: string;
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


export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}


export interface InventoryFilters {
  page?: number;
  size?: number;
  sort?: string;
  zoneId?: string;
  minQuantity?: number | string;
  maxQuantity?: number | string;
  query?: string;
}

export interface InventoryItemUpdateRequest {
  name?: string;
  quantity?: number;
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
//Low stock item (used in Low Stock Alerts page)

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  zoneName?: string | null;
}

export interface LowStockReportItem {
  sku: string;
  name: string;
  quantity: number;
  reorderThreshold: number;
  zoneName: string | null;
}
export interface DashboardReportRequest {
  recentMovementLimit: number;
  includeLowStock: boolean;
  includeRecentMovements: boolean;
}

export interface DashboardReport {
  generatedAt: string;
  totalItems: number;
  totalQuantity: number;
  lowStockCount: number;
  activeZones: number;
  lowStockItems: LowStockReportItem[];
  recentMovements: MovementLog[];
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
// User management (M1 - Bhanuka)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  role: string;
}

export interface CreateUserForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  password: string;
  role: string;
}

export interface UserResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  role: string;       // "ADMIN" | "MANAGER" | "WORKER"
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  username: string;
  password: string;
  role: string;
}

// Geofence
export interface GeofenceRule {
  from: string;   // e.g. "UNLOADING_ZONE"
  to: string;     // e.g. "WRITER_ZONE"
  label: string;  // e.g. "Standard inbound"
}

// ─────────────────────────────────────────────────────────────────────────────
// WAREHOUSE
// ─────────────────────────────────────────────────────────────────────────────

// Represents a warehouse as returned by the backend
export interface Warehouse {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOFENCING  (M5 - Daniru)
// ─────────────────────────────────────────────────────────────────────────────
// TOOD: GeofencingRule
// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkflowRule {
  from: string;
  to: string;
  label: string;
}

// Re-uses the existing ZoneResponseDTO shape from the backend
export interface ZoneStatus {
  id: string;
  name: string;
  zoneType: string;
  capacity: number;
  currentItemCount: number;
  status: string;
  hasHardware: boolean;
  hardwareName: string | null;
  hardwareType: string | null;
  hardwareStatus: string | null;
}

// Re-uses AlertResponseDTO
export interface AlertItem {
  id: string;
  alertType: string;
  severity: string;
  alertStatus: string;
  message: string | null;
  zoneId: string | null;
  zoneName: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUsername: string | null;
}

// ── Add these interfaces to src/types/index.ts ────────────────────────────────
 
// Replace the existing TagHealth interface in src/types/index.ts with this:

export interface TagHealth {
  tagId: string;
  tagUid: string;
  tagStatus: string;
  healthStatus: string;
  readsInWindow: number;        // reads in the last 60 seconds
  windowSeconds: number;        // measurement window (60)
  readsPerSecond: number;       // calculated frequency
  minReadsPerSecond: number;    // minimum standard
  inventoryItemId: string | null;
  inventoryItemName: string | null;
  lastSeenZone: string | null;
  lastSeenAt: string | null;
  alertRaised: boolean;
}

export interface ReplaceTagRequest {
  unhealthyTagUid: string;
  newTagUid: string;
  alertId: string;
}
 
