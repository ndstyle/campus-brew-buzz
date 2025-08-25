import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (required for Replit/Webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Cafe {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageRating?: number;
  reviewCount?: number;
  address: string;
  campus?: string;
  hasUserReview?: boolean;
}

interface CafeMapProps {
  cafes: Cafe[];
  center: [number, number];
  onCafeClick: (cafe: Cafe) => void;
  className?: string;
  zoom?: number;
}

export const CafeMap: React.FC<CafeMapProps> = ({ 
  cafes, 
  center, 
  onCafeClick, 
  className = "w-full h-96",
  zoom = 14 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      touchZoom: true,
    }).setView(center, zoom);

    mapRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
    }).addTo(map);

    // Add cafe markers
    cafes.forEach((cafe) => {
      const ratingDisplay = cafe.averageRating 
        ? `${cafe.averageRating.toFixed(1)}/10 (${cafe.reviewCount || 0} reviews)`
        : 'No reviews yet';

      const marker = L.marker([cafe.latitude, cafe.longitude])
        .bindPopup(`
          <div class="p-3 min-w-48 max-w-64">
            <h3 class="font-bold text-purple-800 text-base mb-1">${cafe.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${cafe.address}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-purple-600">${ratingDisplay}</span>
              <button class="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">
                View Details
              </button>
            </div>
          </div>
        `, {
          maxWidth: 280,
          className: 'custom-popup'
        })
        .on('click', () => onCafeClick(cafe));
      
      marker.addTo(map);
    });

    // Add user location marker if provided
    if (center) {
      L.circleMarker(center, {
        color: '#8B5FBF',
        fillColor: '#8B5FBF',
        fillOpacity: 0.3,
        radius: 8,
      }).bindPopup('Your Location').addTo(map);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [cafes, center, onCafeClick, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`${className} rounded-lg border border-gray-200 z-0`}
      style={{ minHeight: '350px' }}
    />
  );
};