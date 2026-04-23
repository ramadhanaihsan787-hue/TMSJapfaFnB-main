/**
 * Common/Shared Types
 * General types used throughout the application
 */

// ============= UI STATE TYPES =============
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export interface NotificationState {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============= SIDEBAR STATE TYPES =============
export interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

// ============= PAGINATION TYPES =============
export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: "asc" | "desc";
}

// ============= FILTER TYPES =============
export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ============= COORDINATE TYPES =============
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

// ============= TIME & DURATION TYPES =============
export interface TimeWindow {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface DateRange {
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
}

// ============= FORM TYPES =============
export interface FormError {
  field: string;
  message: string;
}

export interface FormSubmitResult {
  success: boolean;
  message?: string;
  errors?: FormError[];
}

// ============= EXPORT TYPES =============
export type ExportFormat = "csv" | "excel" | "pdf" | "json";

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  columns?: string[];
  dateRange?: DateRange;
}

// ============= RESPONSE WRAPPER =============
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponseWrapper {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type ApiResponseWrapper<T> = ApiSuccessResponse<T> | ApiErrorResponseWrapper;

// ============= BATCH OPERATION TYPES =============
export interface BatchOperationRequest<T> {
  operation: "create" | "update" | "delete";
  items: T[];
}

export interface BatchOperationResult {
  successful: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// ============= MAP TYPES =============
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type: "origin" | "destination" | "waypoint" | "poi";
  icon?: string;
  color?: string;
}

export interface MapRoute {
  id: string;
  points: Coordinates[];
  distance: number;
  duration: number;
  polyline?: string;
}

// ============= FILE UPLOAD TYPES =============
export interface FileUploadRequest {
  file: File;
  category: "photo" | "document" | "report";
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// ============= CACHE TYPES =============
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

// ============= THEME TYPES =============
export type Theme = "light" | "dark" | "auto";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  dangerColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
}

// ============= TABLE TYPES =============
export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableState<T> {
  data: T[];
  selectedRows: string[];
  sortField: keyof T | null;
  sortDirection: "asc" | "desc";
  page: number;
  perPage: number;
}

// ============= MODAL TYPES =============
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  actions?: ModalAction[];
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
}

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}
