/**
 * Authentication Types
 * Centralized types for authentication and authorization
 */

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export type UserRole = "admin_distribusi" | "manager_logistik" | "admin_pod" | "driver";

export interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

export interface PermissionConfig {
  role: UserRole;
  allowedRoutes: string[];
  allowedFeatures: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionConfig> = {
  admin_distribusi: {
    role: "admin_distribusi",
    allowedRoutes: ["/logistik", "/dashboard", "/analytics", "/fleet", "/drivers"],
    allowedFeatures: ["route_planning", "fleet_management", "driver_management", "analytics"]
  },
  manager_logistik: {
    role: "manager_logistik",
    allowedRoutes: ["/manager-logistik", "/dashboard"],
    allowedFeatures: ["view_dashboard", "view_reports"]
  },
  admin_pod: {
    role: "admin_pod",
    allowedRoutes: ["/pod", "/dashboard", "/monitoring"],
    allowedFeatures: ["pod_verification", "pod_monitoring", "pod_history"]
  },
  driver: {
    role: "driver",
    allowedRoutes: ["/driver", "/dashboard", "/routes", "/delivery"],
    allowedFeatures: ["view_routes", "update_delivery", "capture_pod"]
  }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin_distribusi: "Admin Distribusi",
  manager_logistik: "Manager Logistik",
  admin_pod: "Admin POD",
  driver: "Driver"
};
