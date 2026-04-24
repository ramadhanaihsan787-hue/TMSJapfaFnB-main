// ================= CORE DOMAIN =================

export interface RouteProduct {
  name: string;
  quantity: number;
}

export interface RouteDetail {
  sequence: number;
  storeName: string;
  latitude: number;
  longitude: number;
  weightKg: number;
  arrivalTime: string;
  distanceFromPrevKm: number;
  items: RouteProduct[];
}

export type RouteStatus = "draft" | "optimized" | "confirmed";

export interface RouteItem {
  routeId: string;
  date: string;
  driverName: string;
  vehicle: string;
  vehicleType: string;
  destinationCount: number;
  totalWeight: number;
  totalDistanceKm: number;
  status: RouteStatus;
  zone: string;
  details: RouteDetail[];
  polyline?: [number, number][];
}

// ================= UPLOAD =================

export interface UploadResult {
  orderId?: string;
  customerCode?: string;
  storeName: string;
  weight?: number;
  coordinates?: string;
  reason?: string;
  items?: RouteProduct[];
  maxTime?: string;
}

// ================= DROPPED =================

export interface DroppedNode {
  storeName: string;
  weightKg: number;
  reason: string;
  lat?: number;
  lon?: number;
}