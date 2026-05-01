import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
// 🌟 FIX CTO
import { useDriverappFlow } from '../hooks/useDriverappFlow';

const NavigationPage: React.FC = () => {
    const navigate = useNavigate();
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    const { activeStop, arriveAtLocation } = useDriverappFlow();

    // 🌟 Destinasi Dinamis
    const destination = {
        longitude: activeStop ? Number(activeStop.longitude) : 107.144415,
        latitude: activeStop ? Number(activeStop.latitude) : -6.326354,
        name: activeStop ? activeStop.customerName : "Memuat Lokasi..."
    };

    const defaultStart = { longitude: 107.1350, latitude: -6.3350 }; // Depo JAPFA Dummy

    const [viewState, setViewState] = useState({
        longitude: destination.longitude,
        latitude: destination.latitude,
        zoom: 13,
        pitch: 45,
        bearing: 0
    });

    const [userLocation, setUserLocation] = useState<{ longitude: number, latitude: number } | null>(null);
    const [routeData, setRouteData] = useState<any>(null);
    const [journeyInfo, setJourneyInfo] = useState({ distance: "0", duration: "0", arrivalTime: "00:00" });

    const fetchRoute = async (start: { longitude: number, latitude: number }, end: { longitude: number, latitude: number }) => {
        try {
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?steps=true&geometries=geojson&access_token=${mapboxToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry;

            setRouteData({ type: 'Feature', properties: {}, geometry: route });

            const distKm = (data.distance / 1000).toFixed(1);
            const durationMin = Math.floor(data.duration / 60);

            const now = new Date();
            now.setMinutes(now.getMinutes() + durationMin);
            const arrivalStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            setJourneyInfo({ distance: distKm, duration: durationMin.toString(), arrivalTime: arrivalStr });
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { longitude, latitude } = position.coords;
                setUserLocation({ longitude, latitude });
                setViewState(prev => ({ ...prev, longitude, latitude }));
                fetchRoute({ longitude, latitude }, destination);
            }, () => {
                setUserLocation(defaultStart);
                setViewState(prev => ({ ...prev, ...defaultStart }));
                fetchRoute(defaultStart, destination);
            });
        } else {
            setUserLocation(defaultStart);
            fetchRoute(defaultStart, destination);
        }
    }, [activeStop]); // Re-run if activeStop changes

    const routeLayer: any = {
        id: 'route', type: 'line', layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#0ea5e9', 'line-width': 8, 'line-opacity': 0.6 }
    };

    return (
        <div className="relative h-screen w-screen bg-[#0a0a0a]">
            <Map
                {...viewState}
                onMove={(evt: any) => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/navigation-night-v1"
                mapboxAccessToken={mapboxToken}
            >
                <GeolocateControl position="top-right" trackUserLocation showUserHeading />
                <NavigationControl position="top-right" />

                {routeData && (
                    <Source id="route-source" type="geojson" data={routeData}>
                        <Layer {...routeLayer} />
                    </Source>
                )}

                <Marker longitude={destination.longitude} latitude={destination.latitude}>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary text-white p-2 rounded-lg shadow-lg mb-1 animate-bounce">
                            <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-full whitespace-nowrap font-bold border border-slate-700">
                            {destination.name}
                        </div>
                    </div>
                </Marker>

                {userLocation && (
                    <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
                        <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg ring-4 ring-blue-500/30"></div>
                    </Marker>
                )}
            </Map>

            {/* Header info (Back button & Destinasi) */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="pointer-events-auto h-12 w-12 bg-black/80 text-white rounded-full flex items-center justify-center border border-slate-800 shadow-xl backdrop-blur-md active:scale-95 transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="pointer-events-auto flex-1 bg-black/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Menuju Ke</p>
                        <p className="text-sm font-bold text-white truncate">{destination.name}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Info ETA & Arrive Button */}
            <div className="absolute bottom-8 left-0 right-0 px-4">
                <div className="bg-black/90 backdrop-blur-lg border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-w-md mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-3xl font-black text-white">{journeyInfo.duration} <span className="text-sm font-bold text-slate-500">min</span></p>
                            <p className="text-sm font-bold text-emerald-500">{journeyInfo.distance} km <span className="text-slate-400 font-normal">· Arrive {journeyInfo.arrivalTime}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            await arriveAtLocation(); // 🌟 Status API
                            navigate('/driver/pod');  // Lanjut foto
                        }}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-2xl">check_circle</span> SAYA SUDAH TIBA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavigationPage;