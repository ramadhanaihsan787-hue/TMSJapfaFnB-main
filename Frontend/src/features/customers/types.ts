// src/features/customers/types.ts

export type ViewMode = 'list' | 'add' | 'edit';

export interface Customer {
    code: string;
    name: string;
    admin: string;
    lat: number | string;
    lon: number | string;
    address: string;
    district: string;
    city: string;
    status: string;
    tier?: string;
}

export interface CustomerFormData {
    code: string;
    name: string;
    status: string;
    admin: string;
    address: string;
    district: string;
    city: string;
    lat: string;
    lon: string;
}