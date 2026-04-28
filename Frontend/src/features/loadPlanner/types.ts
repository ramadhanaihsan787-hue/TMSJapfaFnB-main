// src/features/loadPlanner/types.ts

export type TruckCapacityTier = '2T' | '2.7T' | '5T';

export interface ShipmentItem {
    type: 'egg' | 'nutrition' | string;
    count: number;
}

export interface Shipment {
    id: string;
    customer: string;
    block: string;
    weight: number;
    items: ShipmentItem[];
}

export interface ActivityLogEntry {
    label: string;
    sub: string;
    active: boolean;
}