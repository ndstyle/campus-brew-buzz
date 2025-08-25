import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Beli-style marker
const createCafeMarker = (rating?: number) => {
  const color = rating && rating >= 8 ? '#22c55e' : rating && rating >= 6 ? '#f59e0b' : '#6b7280';
  const ratingText = rating ? rating.toFixed(1) : 'NEW';
  
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-white rounded-full shadow-lg border-2 ${color === '#22c55e' ? 'border-green-500' : color === '#f59e0b' ? 'border-yellow-500' : 'border-gray-500'} flex items-center justify-center">
          <span class="text-xs font-bold text-gray-800">${ratingText}</span>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent ${color === '#22c55e' ? 'border-t-green-500' : color === '#f59e0b' ? 'border-t-yellow-500' : 'border-t-gray-500'}"></div>
      </div>
    `,
    className: 'custom-cafe-marker',
    iconSize: [40, 45],
    iconAnchor: [20, 45]
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