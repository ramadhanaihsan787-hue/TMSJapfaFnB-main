export type StopStatus = 'completed' | 'active' | 'pending';

export interface RouteStop {
    id: number;
    sequence: number;
    customerName: string;
    timeWindow: string;
    weight: string;
    status: StopStatus;
}