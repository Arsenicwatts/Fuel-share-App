import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * RoutePreview — Mini-map component showing route between origin and destination.
 * Uses ResizeObserver and multi-pass invalidateSize to ensure 100% full tile coverage.
 */
export default function RoutePreview({ startLat, startLng, endLat, endLng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!startLat || !startLng || !endLat || !endLng) return;

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false
    });

    // Multi-subdomain OpenStreetMap CDN tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const smallDot = (color) => L.divIcon({
      className: 'route-dot',
      html: `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const startPoint = [startLat, startLng];
    const endPoint = [endLat, endLng];

    L.marker(startPoint, { icon: smallDot('#6366f1') }).addTo(map);
    L.marker(endPoint, { icon: smallDot('#059669') }).addTo(map);

    L.polyline([startPoint, endPoint], {
      color: '#059669',
      weight: 3,
      opacity: 0.8,
      dashArray: '6, 6'
    }).addTo(map);

    const bounds = L.latLngBounds([startPoint, endPoint]);
    map.fitBounds(bounds, { padding: [20, 20] });

    mapInstanceRef.current = map;

    // ResizeObserver to continuously invalidate map size as container expands
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    // Additional timed invalidations for card transitions
    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }, 100);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }, 300);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [startLat, startLng, endLat, endLng]);

  if (!startLat || !startLng || !endLat || !endLng) return null;

  return (
    <div
      ref={mapRef}
      className="w-full h-[115px] min-h-[115px] max-h-[115px] rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-sm relative z-0"
      style={{ cursor: 'default' }}
    />
  );
}
