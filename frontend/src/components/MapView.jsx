import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ChevronRight, Car, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Custom emerald marker icon
const createMarkerIcon = (color = '#059669') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

const startIcon = createMarkerIcon('#6366f1'); // Indigo for start
const endIcon = createMarkerIcon('#059669');   // Emerald for end

// Auto-fit bounds to show all markers
function FitBounds({ rides }) {
  const map = useMap();

  useMemo(() => {
    const points = [];
    rides.forEach(ride => {
      if (ride.start_lat && ride.start_lng) points.push([ride.start_lat, ride.start_lng]);
      if (ride.end_lat && ride.end_lng) points.push([ride.end_lat, ride.end_lng]);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [rides, map]);

  return null;
}

export default function MapView({ rides, user, onRequestSeat }) {
  const { theme } = useApp();
  // Filter rides with valid coordinates
  const mappableRides = rides.filter(r => r.start_lat && r.start_lng && r.end_lat && r.end_lng);

  // Default center (India) if no rides
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  if (mappableRides.length === 0) {
    return (
      <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-md">
        <div className="text-5xl mb-4">🗺️</div>
        <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">No rides with location data yet</p>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1">Rides created with the location picker will appear on the map.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-slate-700 overflow-hidden shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full z-0"
        style={{ height: '500px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
          maxZoom={19}
        />

        <FitBounds rides={mappableRides} />

        {mappableRides.map(ride => {
          const isOwner = user?.email === ride.driver_email;
          const date = new Date(ride.start_time);

          return (
            <React.Fragment key={ride.ride_id}>
              {/* Start marker */}
              <Marker position={[ride.start_lat, ride.start_lng]} icon={startIcon}>
                <Popup>
                  <div className="min-w-[200px] font-sans">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">START</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{ride.start_location}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="font-semibold text-slate-700">{ride.driver_name}</span> • {ride.vehicle_model}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        → {ride.end_location}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-emerald-700 font-bold text-sm">₹{Math.round(ride.calculated_cost_per_seat)}</span>
                        <span className="text-xs text-slate-400">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!isOwner && (
                        <button
                          onClick={() => onRequestSeat(ride.ride_id, user)}
                          className="w-full mt-2 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Request Seat →
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* End marker */}
              <Marker position={[ride.end_lat, ride.end_lng]} icon={endIcon}>
                <Popup>
                  <div className="min-w-[180px] font-sans">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">DESTINATION</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{ride.end_location}</p>
                    <p className="text-xs text-slate-400 mt-1">{ride.distance_km} km from {ride.start_location}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Route line */}
              <Polyline
                positions={[[ride.start_lat, ride.start_lng], [ride.end_lat, ride.end_lng]]}
                pathOptions={{
                  color: '#059669',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '8, 8'
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
