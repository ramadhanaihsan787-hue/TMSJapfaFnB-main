// src/features/analytics/types.ts

export interface KPISummary {
    otifRate: string;
    fillRate: string; 
    loadFactor: string;
    totalShipments: number;
    avgLoadingTime: string; 
}

export interface FleetUtilization {
    totalTrucks: number;
    activeTrucks: number;
    utilizationRate: string;
}

export interface DeliveryVolume {
    time: string;
    count: number;
    hour?: string;
    orders?: number;
}

export interface DriverPerformance {
    driver_name: string;
    total_trips: number;
    on_time_rate: number;
    fuel_rating: string;
}