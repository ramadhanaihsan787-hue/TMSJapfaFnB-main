/**
 * API Response and Request Types
 * Centralized type definitions for all API communication
 */

// ============= AUTH TYPES =============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type UserRole = "admin_distribusi" | "manager_logistik" | "admin_pod" | "driver";

// ============= ORDER TYPES =============
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  latitude: number;
  longitude: number;
  status: OrderStatus;
  weight: number;
  volume: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "arrived"
  | "delivered"
  | "failed"
  | "cancelled";

export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  latitude: number;
  longitude: number;
  weight: number;
  volume: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

// ============= ROUTE TYPES =============
export interface Route {
  id: string;
  route_code: string;
  vehicle_id: string;
  driver_id: string;
  status: RouteStatus;
  orders: Order[];
  total_distance: number;
  estimated_duration: number;
  actual_duration?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export type RouteStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface CreateRouteRequest {
  vehicle_id: string;
  driver_id: string;
  order_ids: string[];
}

// ============= VEHICLE TYPES =============
export interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type: string;
  capacity_weight: number;
  capacity_volume: number;
  status: VehicleStatus;
  driver_id?: string;
  created_at: string;
  updated_at: string;
}

export type VehicleStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "retired";

export interface CreateVehicleRequest {
  plate_number: string;
  vehicle_type: string;
  capacity_weight: number;
  capacity_volume: number;
}

// ============= DRIVER TYPES =============
export interface Driver {
  id: string;
  name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  vehicle_id?: string;
  status: DriverStatus;
  rating: number;
  completed_deliveries: number;
  created_at: string;
  updated_at: string;
}

export type DriverStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "terminated";

export interface CreateDriverRequest {
  name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
}

// ============= POD (PROOF OF DELIVERY) TYPES =============
export interface POD {
  id: string;
  order_id: string;
  driver_id: string;
  photo_url: string;
  signature_url?: string;
  recipient_name: string;
  delivery_time: string;
  status: PODStatus;
  notes?: string;
  created_at: string;
}

export type PODStatus =
  | "pending"
  | "captured"
  | "verified"
  | "rejected";

export interface CreatePODRequest {
  order_id: string;
  driver_id: string;
  recipient_name: string;
  photo: File;
  signature?: File;
  notes?: string;
}

// ============= ANALYTICS TYPES =============
export interface AnalyticsSummary {
  total_orders: number;
  delivered_orders: number;
  failed_orders: number;
  average_delivery_time: number;
  total_distance: number;
  fuel_cost: number;
  driver_performance: DriverPerformance[];
  route_efficiency: RouteEfficiency[];
}

export interface DriverPerformance {
  driver_id: string;
  driver_name: string;
  deliveries_completed: number;
  on_time_rate: number;
  safety_rating: number;
  average_speed: number;
  total_distance: number;
}

export interface RouteEfficiency {
  route_id: string;
  planned_distance: number;
  actual_distance: number;
  efficiency_rate: number;
  time_saved: number;
}

// ============= LOAD PLANNER TYPES =============
export interface LoadPlannerShipment {
  id: string;
  order_id: string;
  weight: number;
  volume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  fragile: boolean;
  priority: "low" | "medium" | "high";
}

export interface TruckSlotAssignment {
  shipment_id: string;
  slot_id: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
}

// ============= API ERROR RESPONSE =============
export interface ApiErrorResponse {
  detail: string | Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
  status: number;
}

// ============= PAGINATION =============
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  skip?: number;
  limit?: number;
}

// ============= COMMON API RESPONSE =============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiErrorResponse;
}
