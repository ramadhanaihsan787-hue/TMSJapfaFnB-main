/**
 * API-related types
 */

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
}

export interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
}

export interface ApiRequest<T = any> {
    method: string;
    url: string;
    data?: T;
    config?: Partial<RequestConfig>;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiFailureResponse {
    success: false;
    error: string;
    code?: string;
    details?: Record<string, any>;
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export interface ApiEndpoints {
    auth: {
        login: string;
        logout: string;
        refresh: string;
    };
    dashboard: {
        kpiSummary: string;
        liveTracking: string;
        hourlyVolume: string;
        rejections: string;
        alerts: string;
    };
    routes: {
        list: string;
        detail: string;
        optimize: string;
        confirm: string;
    };
    analytics: {
        kpiSummary: string;
        fleetUtilization: string;
        deliveryVolume: string;
        driverPerformance: string;
    };
    [key: string]: any;
}
