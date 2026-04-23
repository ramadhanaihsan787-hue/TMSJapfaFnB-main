/**
 * Common types used across features
 */

export type UserRole = 'admin_distribusi' | 'manager_logistik' | 'admin_pod' | 'driver';

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface GeoPoint {
    lat: number;
    lon: number;
}
