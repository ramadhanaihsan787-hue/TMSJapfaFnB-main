export const mockTruck = {
    id: "TRK-001",
    plate: "B 1234 CD",
    capacity: 2000 
};

// 🌟 SCENARIO 1: OVERLOAD (Total berat 3000kg, padahal kapasitas truk cuma 2000kg)
export const mockOverloadOrders = [
    { id: "ORD-01", lat: -6.2, lng: 106.8, weight: 1500, customer: "Toko A" },
    { id: "ORD-02", lat: -6.3, lng: 106.9, weight: 1500, customer: "Toko B" },
];

// 🌟 SCENARIO 2: KOORDINAT NULL / KOSONG (GPS Rusak/Data Kotor)
export const mockNullCoordsOrders = [
    { id: "ORD-03", lat: null, lng: null, weight: 50, customer: "Toko Hantu" },
    { id: "ORD-04", lat: -6.1, lng: 106.7, weight: 100, customer: "Toko C" },
];

// 🌟 SCENARIO 3: UNROUTABLE (Jalan buntu / diseberang pulau)
export const mockUnroutableOrders = [
    { id: "ORD-05", lat: -6.0000, lng: 106.0000, weight: 100, customer: "Toko Segitiga Bermuda" }
];