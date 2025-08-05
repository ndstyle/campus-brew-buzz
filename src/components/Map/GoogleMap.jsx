import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Coffee } from 'lucide-react';
import CafeInfoCard from './CafeInfoCard';

const GoogleMap = ({ center, zoom = 15, cafes = [], onAddReview, loading: cafesLoading }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const markerClusterRef = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [error, setError] = useState(null);

  // Custom map styles with purple theme and minimal POIs
  const mapStyles = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f5f5f5" }]
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }]
    },
    // Hide unwanted POIs
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.place_of_worship",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.medical",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.government",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.attraction",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }]
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }]
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }]
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9c9c9" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }]
    }
  ];

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: "GOOGLE_PLACES_API_KEY",
          version: "weekly",
          libraries: ["places", "marker"]
        });

        await loader.load();

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
            style: google.maps.ZoomControlStyle.SMALL
          },
          gestureHandling: 'greedy',
          backgroundColor: '#f5f5f5'
        });

        mapInstanceRef.current = map;
        setMapLoading(false);

        // Add click listener to close info card
        map.addListener('click', () => {
          setSelectedCafe(null);
        });

      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your internet connection.');
        setMapLoading(false);
      }
    };

    initializeMap();
  }, [center, zoom]);

  // Create custom marker icon
  const createMarkerIcon = (isSelected = false, hasUserReview = false) => {
    const size = isSelected ? 40 : 32;
    const color = hasUserReview ? '#8B5CF6' : '#000000'; // Purple for user's reviews, black for others
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: size / 2,
      anchor: new google.maps.Point(0, 0)
    };
  };

  // Update markers when cafes change
  useEffect(() => {
    if (!mapInstanceRef.current || !google.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    cafes.forEach(cafe => {
      if (!cafe.lat || !cafe.lng) return;

      const marker = new google.maps.Marker({
        position: { lat: cafe.lat, lng: cafe.lng },
        map: mapInstanceRef.current,
        icon: createMarkerIcon(false, cafe.hasUserReview),
        title: cafe.name,
        animation: google.maps.Animation.DROP
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedCafe(cafe);
        // Update marker appearance
        marker.setIcon(createMarkerIcon(true, cafe.hasUserReview));
        
        // Reset other markers
        markersRef.current.forEach(otherMarker => {
          if (otherMarker !== marker) {
            const otherCafe = cafes.find(c => 
              c.lat === otherMarker.getPosition().lat() && 
              c.lng === otherMarker.getPosition().lng()
            );
            otherMarker.setIcon(createMarkerIcon(false, otherCafe?.hasUserReview));
          }
        });
      });

      // Add hover effects
      marker.addListener('mouseover', () => {
        if (selectedCafe?.id !== cafe.id) {
          marker.setIcon(createMarkerIcon(false, cafe.hasUserReview));
        }
      });

      markersRef.current.push(marker);
    });
  }, [cafes, selectedCafe]);

  // Loading skeleton
  if (mapLoading) {
    return (
      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-bounce">
            <Coffee className="h-12 w-12 text-primary mx-auto" />
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded animate-pulse w-32 mx-auto"></div>
            <div className="h-2 bg-muted rounded animate-pulse w-24 mx-auto"></div>
          </div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <Coffee className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-medium text-foreground">Map unavailable</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Cafe Info Card */}
      {selectedCafe && (
        <CafeInfoCard
          cafe={selectedCafe}
          onClose={() => setSelectedCafe(null)}
          onAddReview={onAddReview}
        />
      )}
    </div>
  );
};

export default GoogleMap;