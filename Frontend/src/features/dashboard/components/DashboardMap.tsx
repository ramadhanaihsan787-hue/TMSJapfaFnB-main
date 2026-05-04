// src/features/dashboard/components/DashboardMap.tsx

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface LiveTruck {
  id: string;
  driver: string;
  lat: number;
  lon: number;
  status: string;
  isDelayed: boolean;
}

interface Props {
  activeTrucks: LiveTruck[];
  isLoading: boolean;
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function DashboardMap({ activeTrucks, isLoading }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const gudangLatLon: [number, number] = [106.479163, -6.207356];
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

  // ===============================
  // INIT MAP
  // ===============================
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: gudangLatLon,
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    return () => map.remove();
  }, []);

  // ===============================
  // FLY TO
  // ===============================
  useEffect(() => {
    if (!flyToLocation || !mapRef.current) return;

    mapRef.current.flyTo({
      center: flyToLocation,
      zoom: 14,
      duration: 1500,
    });
  }, [flyToLocation]);

  // ===============================
  // RENDER MARKERS
  // ===============================
  useEffect(() => {
    if (!mapRef.current) return;

    // clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // depo marker
    const depoEl = document.createElement("div");
    depoEl.className = "depo-marker";
    depoEl.innerHTML = "🏢";

    const depoMarker = new mapboxgl.Marker(depoEl)
      .setLngLat(gudangLatLon)
      .addTo(mapRef.current);

    markersRef.current.push(depoMarker);

    // truck markers
    activeTrucks.forEach((truck) => {
      const el = document.createElement("div");
      el.className = truck.isDelayed ? "truck-marker warning" : "truck-marker";
      el.innerHTML = "🚚";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([truck.lon, truck.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setHTML(`
            <div style="font-size:12px">
              <b>${truck.id}</b><br/>
              Driver: ${truck.driver}<br/>
              Status: ${truck.status}
            </div>
          `)
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [activeTrucks]);

  const handleFlyTo = (lat: number, lon: number) => {
    setFlyToLocation([lon, lat]);
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="mt-4 bg-[#111] rounded-xl border border-slate-800 shadow overflow-hidden flex flex-col h-[85vh]">

      {/* HEADER */}
      <div className="p-4 flex justify-between items-center border-b border-slate-800 bg-[#1a1a1a]">
        <div>
          <h3 className="text-white font-bold text-lg">
            🚀 Live Fleet Tracking
          </h3>
          <p className="text-xs text-gray-400">
            Real-time GPS monitoring
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isLoading && activeTrucks.length === 0 ? (
            <span className="text-xs text-gray-400">Loading...</span>
          ) : (
            activeTrucks.map((truck, i) => (
              <button
                key={i}
                onClick={() => handleFlyTo(truck.lat, truck.lon)}
                className={`px-3 py-1 text-xs rounded-md font-bold transition ${
                  truck.isDelayed
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                🚚 {truck.id}
              </button>
            ))
          )}

          <button
            onClick={() => handleFlyTo(-6.207356, 106.479163)}
            className="px-3 py-1 text-xs rounded-md font-bold bg-rose-500/20 text-rose-400"
          >
            🏢 Depo
          </button>
        </div>
      </div>

      {/* MAP */}
      <div ref={mapContainer} className="flex-1" />

      {/* STYLE */}
      <style>{`
        .truck-marker {
          width: 26px;
          height: 26px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          box-shadow: 0 0 12px rgba(59,130,246,0.9);
          animation: pulse 2s infinite;
        }

        .truck-marker.warning {
          background: #f97316;
          box-shadow: 0 0 14px rgba(249,115,22,1);
        }

        .depo-marker {
          width: 34px;
          height: 34px;
          background: #e11d48;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 14px rgba(225,29,72,1);
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}