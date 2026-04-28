// src/features/manager/types.ts

export type ManagerTabId = "overview" | "return" | "efficiency";

export interface KPICardData {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'flat';
    icon: string;
    bgColor: string;
    iconColor: string;
    subtext: string;
}