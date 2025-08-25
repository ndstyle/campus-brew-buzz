import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Clean marker design matching screenshots
const createCafeMarker = () => {
  return L.divIcon({
    html: `
      <div class="w-6 h-8 flex flex-col items-center">
        <div class="w-6 h-6 bg-black rounded-full border-2 border-white shadow-lg"></div>
        <div class="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
      </div>
    `,
    className: 'custom-cafe-marker',
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32]
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
  const markersRef = useRef<L.Marker[]>([]);

  const handleCafeClick = useCallback((cafe: Cafe) => {
    onCafeClick(cafe);
  }, [onCafeClick]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        dragging: true,
        tapTolerance: 15
      }).setView(center, 15);

      mapRef.current = map;

      // Add map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CartoDB',
        maxZoom: 19,
      }).addTo(map);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    cafes.forEach((cafe) => {
      if (mapRef.current && cafe.latitude && cafe.longitude) {
        const marker = L.marker([cafe.latitude, cafe.longitude], {
          icon: createCafeMarker()
        });
        
        marker.on('click', (e) => {
          console.log('🚀 Marker clicked:', cafe.name);
          e.originalEvent?.stopPropagation();
          handleCafeClick(cafe);
        });
        
        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    });

    // Update map center if needed
    if (mapRef.current) {
      mapRef.current.setView(center, 15);
    }

    return () => {
      // Clean up markers on unmount
      markersRef.current.forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [cafes, center, handleCafeClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className={`${className} relative`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};