export interface PodVerificationData {
    id: string;
    resi: string;
    driverName: string;
    timeUploaded: string;
    status: 'success' | 'failed' | 'pending';
    flagReason?: string;
}