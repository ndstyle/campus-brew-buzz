import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Coffee } from 'lucide-react';
import CafeInfoCard from './CafeInfoCard';
import { supabase } from '@/integrations/supabase/client';

const GoogleMap = ({ center, zoom = 15, cafes = [], onAddReview, loading: cafesLoading }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const markerClusterRef = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Initializing Google Maps...');
  const [apiKey, setApiKey] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

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

  // Fetch API key from Supabase Edge Function
  const fetchApiKey = async () => {
    try {
      console.log('🔑 Fetching Google Maps API key from edge function...');
      const { data, error } = await supabase.functions.invoke('google-maps-config');
      
      if (error) {
        console.error('❌ Error fetching API key:', error);
        throw error;
      }
      
      if (!data?.apiKey) {
        throw new Error('No API key returned from server');
      }
      
      console.log('✅ API key fetched successfully, length:', data.apiKey.length);
      setApiKey(data.apiKey);
      return data.apiKey;
    } catch (err) {
      console.error('❌ Failed to fetch API key:', err);
      throw new Error('Failed to fetch Google Maps configuration from server');
    }
  };

  // Track component mount state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    // Don't initialize until component is mounted and container is available
    if (!isMounted || !mapRef.current) {
      return;
    }

    const initializeMap = async () => {
      try {
        console.log('🗺️ Starting Google Maps initialization...');
        console.log('🗺️ Map center:', center);
        console.log('🗺️ Map zoom:', zoom);
        
        setLoadingStatus('Fetching API configuration...');
        
        let googleApiKey = apiKey;
        if (!googleApiKey) {
          googleApiKey = await fetchApiKey();
        }
        
        if (!googleApiKey) {
          throw new Error('Google Maps API key not available from server');
        }
        
        console.log('✅ API key obtained, creating loader...');
        setLoadingStatus('Creating Google Maps loader...');
        
        const loader = new Loader({
          apiKey: googleApiKey,
          version: "weekly",
          libraries: ["places", "marker"]
        });

        console.log('📡 Loading Google Maps API...');
        setLoadingStatus('Loading Google Maps API...');
        
        // Add network error handling for googleapis.com
        const startTime = Date.now();
        
        try {
          await Promise.race([
            loader.load(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Google Maps API request timeout')), 15000)
            )
          ]);
        } catch (networkError) {
          console.error('🚫 Network error loading Google Maps API:', networkError);
          if (networkError.message.includes('timeout')) {
            throw new Error('Network timeout: Unable to reach googleapis.com. Check your internet connection.');
          }
          throw new Error(`Network error: ${networkError.message}`);
        }
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Google Maps API loaded successfully in ${loadTime}ms`);
        
        setLoadingStatus('Checking map container...');
        
        if (!mapRef.current) {
          console.error('🚫 Map container not found');
          throw new Error('Map container element not available');
        }
        
        console.log('✅ Map container found, creating map instance...');
        setLoadingStatus('Creating map instance...');

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

        console.log('✅ Map instance created successfully');
        mapInstanceRef.current = map;
        
        setLoadingStatus('Setting up map listeners...');
        
        // Add click listener to close info card
        map.addListener('click', () => {
          setSelectedCafe(null);
        });
        
        console.log('✅ Map initialization complete!');
        setMapLoading(false);
        setLoadingStatus('');

      } catch (err) {
        console.error('❌ Error loading Google Maps:', err);
        console.error('❌ Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        
        let errorMessage = 'Failed to load map. ';
        
        if (err.message.includes('API key') || err.message.includes('configuration')) {
          errorMessage += 'API key configuration issue.';
        } else if (err.message.includes('Network') || err.message.includes('timeout')) {
          errorMessage += 'Network connectivity issue.';
        } else if (err.message.includes('container')) {
          errorMessage += 'Map container issue.';
        } else {
          errorMessage += 'Please try refreshing the page.';
        }
        
        setError(errorMessage);
        setMapLoading(false);
        setLoadingStatus('');
      }
    };

    initializeMap();
  }, [center, zoom, apiKey, isMounted]);

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

  // Loading skeleton with detailed status
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
          <p className="text-sm text-muted-foreground">
            {loadingStatus || 'Loading map...'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Check console for detailed logs
          </p>
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