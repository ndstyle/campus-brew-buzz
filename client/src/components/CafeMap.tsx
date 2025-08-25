import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Clean marker without clutter
const createCafeMarker = (rating?: number) => {
  const color = rating && rating >= 8 ? '#22c55e' : rating && rating >= 6 ? '#f59e0b' : '#8B5FBF';
  const displayText = rating ? rating.toFixed(1) : '•';
  
  return L.divIcon({
    html: `
      <div class="w-8 h-8 bg-white rounded-full shadow-lg border-2 flex items-center justify-center" style="border-color: ${color};">
        <span class="text-xs font-bold" style="color: ${color};">${displayText}</span>
      </div>
    `,
    className: 'custom-cafe-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

interface Cafe {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  avgrating?: number;
  ratingcount?: number;
  address: string;
  cuisine?: string;
  priceLevel?: number;
  photos?: string[];
}

interface CafeMapProps {
  cafes: Cafe[];
  center: [number, number];
  onCafeClick: (cafe: Cafe) => void;
  className?: string;
}

export const CafeMap: React.FC<CafeMapProps> = ({ cafes, center, onCafeClick, className = "w-full h-full" }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // Remove default zoom controls
      scrollWheelZoom: true,
      touchZoom: true,
    }).setView(center, 15);

    mapRef.current = map;

    // Use lighter map tiles for better contrast
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CartoDB',
      maxZoom: 19,
    }).addTo(map);

    // Add custom zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add cafe markers with Beli styling
    cafes.forEach((cafe) => {
      const marker = L.marker([cafe.latitude, cafe.longitude], {
        icon: createCafeMarker(cafe.avgrating)
      });
      
      // Remove popup, handle click directly
      marker.on('click', () => onCafeClick(cafe));
      marker.addTo(map);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [cafes, center, onCafeClick]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`${className} relative`}
      style={{ minHeight: '100vh' }}
    />
  );
};