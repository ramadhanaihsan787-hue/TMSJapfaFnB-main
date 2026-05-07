// ===== INTERFACES =====
export interface CustomerDrop {
    name: string;
    lat: number;
    lon: number;
    weightKg: number;
    timeWindow: string;
    delivered: boolean;
}

export interface TruckTracking {
    id: string;
    driver: string;
    plate: string;
    zone: string;
    status: 'in-transit' | 'delayed' | 'idle';
    lat: number;
    lon: number;
    speed: number;
    heading: number;
    loadKg: number;
    capacityKg: number;
    eta: string;
    color: string;
    customers: CustomerDrop[];
}

export interface ZonePolygon {
    name: string;
    color: string;
    coordinates: [number, number][]; // [lon, lat] for Mapbox
}

// ===== CONSTANTS =====
export const DEPO_LON = 106.479163;
export const DEPO_LAT = -6.207356;

// ===== HELPER: Generate circle polygon coordinates =====
export const generateCircleCoords = (
    centerLon: number,
    centerLat: number,
    radiusKm: number,
    points: number = 64
): [number, number][] => {
    const coords: [number, number][] = [];
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const dx = (radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))) * Math.cos(angle);
        const dy = (radiusKm / 110.574) * Math.sin(angle);
        coords.push([centerLon + dx, centerLat + dy]);
    }
    return coords;
};

// ===== ZONE POLYGONS (Mapbox [lon, lat] format) =====
export const zonePolygons: ZonePolygon[] = [
    {
        name: 'Kelapa Gading',
        color: '#FF7A00',
        coordinates: [[106.89, -6.14], [106.92, -6.14], [106.92, -6.17], [106.89, -6.17], [106.89, -6.14]]
    },
    {
        name: 'Bekasi / Cikarang',
        color: '#3B82F6',
        coordinates: [[107.00, -6.23], [107.15, -6.23], [107.15, -6.35], [107.00, -6.35], [107.00, -6.23]]
    },
    {
        name: 'Serpong / Tangerang',
        color: '#64748B',
        coordinates: [[106.60, -6.20], [106.70, -6.20], [106.70, -6.30], [106.60, -6.30], [106.60, -6.20]]
    }
];

// ===== 7 TRUCKS WITH CUSTOMER DROP POINTS =====
export const dummyFleet: TruckTracking[] = [
    {
        id: 'TRK-001', driver: 'Pak Ahmad', plate: 'B 9513 JXS', zone: 'Kelapa Gading',
        status: 'in-transit', lat: -6.1680, lon: 106.9050, speed: 35, heading: 145,
        loadKg: 2400, capacityKg: 3000, eta: '14:30', color: '#10b981',
        customers: [
            { name: 'Toko Ayam Mas KG', lat: -6.1500, lon: 106.9100, weightKg: 450, timeWindow: '08:00 - 10:00', delivered: true },
            { name: 'RM Padang Sederhana', lat: -6.1580, lon: 106.9160, weightKg: 380, timeWindow: '09:00 - 11:00', delivered: true },
            { name: 'Warung Nasi Bu Eni', lat: -6.1650, lon: 106.9080, weightKg: 520, timeWindow: '10:00 - 12:00', delivered: true },
            { name: 'Restoran Cakwe Jaya', lat: -6.1750, lon: 106.8950, weightKg: 600, timeWindow: '11:00 - 13:00', delivered: false },
            { name: 'Kedai Sop Buntut', lat: -6.1830, lon: 106.8880, weightKg: 450, timeWindow: '12:00 - 14:00', delivered: false },
        ]
    },
    {
        id: 'TRK-002', driver: 'Pak Budi', plate: 'B 9514 JXS', zone: 'Bekasi',
        status: 'in-transit', lat: -6.2450, lon: 107.0010, speed: 28, heading: 90,
        loadKg: 1800, capacityKg: 3000, eta: '15:10', color: '#3b82f6',
        customers: [
            { name: 'Bakso Lapangan Tembak', lat: -6.2200, lon: 106.9900, weightKg: 500, timeWindow: '08:30 - 10:30', delivered: true },
            { name: 'Ayam Goreng Fatmawati', lat: -6.2350, lon: 107.0050, weightKg: 420, timeWindow: '09:30 - 11:30', delivered: true },
            { name: 'RM Sari Rasa Bekasi', lat: -6.2550, lon: 107.0200, weightKg: 480, timeWindow: '11:00 - 13:00', delivered: false },
            { name: 'Toko Daging Segar', lat: -6.2700, lon: 107.0350, weightKg: 400, timeWindow: '12:00 - 14:30', delivered: false },
        ]
    },
    {
        id: 'TRK-003', driver: 'Pak Cahyo', plate: 'B 9517 JXS', zone: 'Serpong',
        status: 'delayed', lat: -6.3100, lon: 106.6700, speed: 0, heading: 0,
        loadKg: 1200, capacityKg: 2500, eta: '16:45', color: '#f59e0b',
        customers: [
            { name: 'Warung Steak BSD', lat: -6.2800, lon: 106.6550, weightKg: 350, timeWindow: '08:00 - 10:00', delivered: true },
            { name: 'RM Padang Minang Asli', lat: -6.2950, lon: 106.6620, weightKg: 420, timeWindow: '09:30 - 11:30', delivered: true },
            { name: 'Kedai Chicken Serpong', lat: -6.3200, lon: 106.6800, weightKg: 430, timeWindow: '11:00 - 13:00', delivered: false },
        ]
    },
    {
        id: 'TRK-004', driver: 'Pak Dedi', plate: 'B 9518 JXS', zone: 'Tangerang',
        status: 'in-transit', lat: -6.1780, lon: 106.6300, speed: 42, heading: 220,
        loadKg: 2100, capacityKg: 3000, eta: '13:50', color: '#8b5cf6',
        customers: [
            { name: 'RM Betawi Asli', lat: -6.1600, lon: 106.6100, weightKg: 300, timeWindow: '07:30 - 09:30', delivered: true },
            { name: 'Toko Ayam Kampung', lat: -6.1700, lon: 106.6200, weightKg: 480, timeWindow: '09:00 - 11:00', delivered: true },
            { name: 'Warung Makan Sunda', lat: -6.1850, lon: 106.6350, weightKg: 520, timeWindow: '10:30 - 12:30', delivered: false },
            { name: 'Restoran Sea Food TNG', lat: -6.1950, lon: 106.6450, weightKg: 400, timeWindow: '12:00 - 14:00', delivered: false },
            { name: 'Kedai Bakmi Jawa', lat: -6.2050, lon: 106.6500, weightKg: 400, timeWindow: '13:00 - 15:00', delivered: false },
        ]
    },
    {
        id: 'TRK-005', driver: 'Pak Eko', plate: 'B 9522 JXS', zone: 'Cikupa',
        status: 'idle', lat: -6.2300, lon: 106.5100, speed: 0, heading: 0,
        loadKg: 2800, capacityKg: 3000, eta: '-', color: '#64748b',
        customers: [
            { name: 'Toko Sumber Frozen', lat: -6.2400, lon: 106.5200, weightKg: 900, timeWindow: '10:00 - 12:00', delivered: false },
            { name: 'Gudang Ayam Cikupa', lat: -6.2500, lon: 106.5300, weightKg: 1000, timeWindow: '11:00 - 13:00', delivered: false },
            { name: 'Pasar Cikupa Center', lat: -6.2550, lon: 106.5150, weightKg: 900, timeWindow: '13:00 - 15:00', delivered: false },
        ]
    },
    {
        id: 'TRK-006', driver: 'Pak Farid', plate: 'ON CALL 1', zone: 'Cikarang',
        status: 'in-transit', lat: -6.3000, lon: 107.1400, speed: 30, heading: 110,
        loadKg: 1600, capacityKg: 2500, eta: '15:30', color: '#0891b2',
        customers: [
            { name: 'Pabrik Makanan Cikarang', lat: -6.2800, lon: 107.1200, weightKg: 600, timeWindow: '08:00 - 10:00', delivered: true },
            { name: 'RM Pondok Indah CKR', lat: -6.2900, lon: 107.1300, weightKg: 350, timeWindow: '09:30 - 11:30', delivered: true },
            { name: 'Toko Daging Prima', lat: -6.3100, lon: 107.1500, weightKg: 350, timeWindow: '11:00 - 13:00', delivered: false },
            { name: 'Warung Ayam Bakar CKR', lat: -6.3200, lon: 107.1600, weightKg: 300, timeWindow: '12:30 - 14:30', delivered: false },
        ]
    },
    {
        id: 'TRK-007', driver: 'Pak Gunawan', plate: 'ON CALL 2', zone: 'BSD / Alam Sutera',
        status: 'delayed', lat: -6.2950, lon: 106.6550, speed: 0, heading: 0,
        loadKg: 1400, capacityKg: 2500, eta: '17:00', color: '#e11d48',
        customers: [
            { name: 'Kedai Mie Kocok BSD', lat: -6.2700, lon: 106.6400, weightKg: 280, timeWindow: '08:00 - 10:00', delivered: true },
            { name: 'Toko Frozen Food AS', lat: -6.2800, lon: 106.6480, weightKg: 350, timeWindow: '09:30 - 11:30', delivered: true },
            { name: 'Restoran Alam Sutera', lat: -6.3050, lon: 106.6620, weightKg: 420, timeWindow: '11:00 - 13:00', delivered: false },
            { name: 'Warung Nasi Padang AS', lat: -6.3150, lon: 106.6700, weightKg: 350, timeWindow: '12:30 - 14:30', delivered: false },
        ]
    }
];

// ===== BUILD GEOJSON HELPERS =====
export const buildRoutesGeoJSON = (fleet: TruckTracking[], selectedTruckId: string | null) => ({
    type: 'FeatureCollection' as const,
    features: fleet.map(truck => ({
        type: 'Feature' as const,
        properties: {
            color: truck.color,
            opacity: selectedTruckId && selectedTruckId !== truck.id ? 0.1 : 0.85,
            width: selectedTruckId === truck.id ? 5 : 3
        },
        geometry: {
            type: 'LineString' as const,
            coordinates: [
                [DEPO_LON, DEPO_LAT],
                ...truck.customers.map(c => [c.lon, c.lat])
            ]
        }
    }))
});

export const buildGeofencesGeoJSON = (fleet: TruckTracking[], selectedTruckId: string | null) => ({
    type: 'FeatureCollection' as const,
    features: [
        {
            type: 'Feature' as const,
            properties: { color: '#e11d48', opacity: 0.06, strokeOpacity: 0.3 },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [generateCircleCoords(DEPO_LON, DEPO_LAT, 5)]
            }
        },
        ...fleet.map(truck => ({
            type: 'Feature' as const,
            properties: {
                color: truck.color,
                opacity: selectedTruckId && selectedTruckId !== truck.id ? 0.01 : 0.08,
                strokeOpacity: selectedTruckId && selectedTruckId !== truck.id ? 0.05 : 0.4
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [generateCircleCoords(truck.lon, truck.lat, 2)]
            }
        }))
    ]
});

export const buildZonesGeoJSON = () => ({
    type: 'FeatureCollection' as const,
    features: zonePolygons.map(zone => ({
        type: 'Feature' as const,
        properties: { color: zone.color, name: zone.name },
        geometry: {
            type: 'Polygon' as const,
            coordinates: [zone.coordinates]
        }
    }))
});