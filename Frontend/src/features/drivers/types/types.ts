// src/features/drivers/types.ts

export type DriverStatus = 'On Route' | 'Resting' | 'Offline' | string;

export interface DriverData {
    id: string;
    name: string;
    avatar: string;
    status: DriverStatus;
    score: number;
    ontime: string;
    doSuccess: string;
    truck: string;
    distanceToday: number;
    doCompleted: number;
    doTotal: number;
    lastLocation: string;
    lastUpdate: string;
}