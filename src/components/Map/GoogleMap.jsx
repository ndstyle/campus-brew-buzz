import { useEffect, useRef, useState } from 'react';
import { Coffee } from 'lucide-react';
import CafeInfoCard from './CafeInfoCard';
import { supabase } from '@/integrations/supabase/client';

const GoogleMap = ({ center, zoom = 15, cafes = [], onAddReview, loading: cafesLoading }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Comprehensive map styles focusing on cafes only
  const mapStyles = [
    // Hide all POIs except food and drink
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.government",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.school",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.medical",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.place_of_worship",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.sports_complex",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.park",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.attraction",
      stylers: [{ visibility: "off" }]
    },
    // Keep only food and drink POIs but make them subtle
    {
      featureType: "poi.food_and_drink",
      stylers: [
        { visibility: "simplified" },
        { saturation: -50 },
        { lightness: 20 }
      ]
    },
    // Simplify road styling
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "road.local",
      elementType: "labels.text",
      stylers: [{ visibility: "simplified" }]
    },
    // Simplify transit and administrative labels
    {
      featureType: "transit",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text",
      stylers: [{ visibility: "on" }]
    },
    // Reduce water and landscape visual noise
    {
      featureType: "water",
      stylers: [
        { saturation: -20 },
        { lightness: 10 }
      ]
    },
    {
      featureType: "landscape",
      stylers: [
        { saturation: -30 },
        { lightness: 15 }
      ]
    }
  ];

  // Fetch API key from Supabase Edge Function
  const fetchApiKey = async () => {
    console.log('🔑 [STEP 1] Fetching API key...');
    try {
      const { data, error } = await supabase.functions.invoke('google-maps-config');
      
      if (error) {
        console.error('❌ [STEP 1] API key fetch error:', error);
        throw error;
      }
      
      if (!data?.apiKey) {
        console.error('❌ [STEP 1] No API key in response:', data);
        throw new Error('No API key returned from server');
      }
      
      console.log('✅ [STEP 1] API key fetched, length:', data.apiKey.length);
      return data.apiKey;
    } catch (err) {
      console.error('❌ [STEP 1] Failed to fetch API key:', err);
      throw err;
    }
  };

  // Simple Google Maps initialization
  useEffect(() => {
    if (!mapRef.current || !center) {
      console.log('❌ [INIT] Missing requirements:', {
        mapRef: !!mapRef.current,
        center: !!center
      });
      return;
    }

    console.log('🚀 [INIT] Starting simple map initialization...');
    console.log('🚀 [INIT] Center:', center, 'Zoom:', zoom);

    let timeoutId = null;
    let isTimedOut = false;

    const initMap = async () => {
      try {
        // Set 10 second timeout
        timeoutId = setTimeout(() => {
          isTimedOut = true;
          console.error('⏰ [TIMEOUT] Map initialization timeout after 10 seconds');
          setError('Map loading timed out. Please refresh the page.');
          setIsInitializing(false);
        }, 10000);

        // Step 1: Get API key
        console.log('🔑 [STEP 2] Getting API key...');
        const apiKey = await fetchApiKey();
        
        if (isTimedOut) return;

        // Step 2: Load Google Maps script directly
        console.log('📡 [STEP 3] Loading Google Maps script...');
        if (!window.google || !window.google.maps) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
              console.log('✅ [STEP 3] Google Maps script loaded');
              resolve();
            };
            script.onerror = () => {
              console.error('❌ [STEP 3] Failed to load Google Maps script');
              reject(new Error('Failed to load Google Maps script'));
            };
            document.head.appendChild(script);
          });
        } else {
          console.log('✅ [STEP 3] Google Maps already loaded');
        }

        if (isTimedOut) return;

        // Step 3: Create map
        console.log('🗺️ [STEP 4] Creating map instance...');
        if (!mapRef.current) {
          throw new Error('Map container not available');
        }

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false, // Disable clicking on Google's default POIs
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        console.log('✅ [STEP 4] Map created successfully');
        mapInstanceRef.current = map;

        // Step 4: Add click listener
        map.addListener('click', () => setSelectedCafe(null));
        console.log('✅ [STEP 5] Event listeners added');

        // Clear timeout and finish
        clearTimeout(timeoutId);
        setIsInitializing(false);
        console.log('🎉 [COMPLETE] Map initialization finished!');

      } catch (err) {
        if (!isTimedOut) {
          console.error('❌ [ERROR] Map initialization failed:', err);
          clearTimeout(timeoutId);
          setError(`Failed to initialize map: ${err.message}`);
          setIsInitializing(false);
        }
      }
    };

    initMap();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
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
    if (!mapInstanceRef.current || !window.google?.maps) {
      console.log('🔍 [MARKERS] Waiting for map or Google Maps API...');
      return;
    }

    console.log('📍 [MARKERS] Updating markers for', cafes.length, 'cafes');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    cafes.forEach(cafe => {
      if (!cafe.lat || !cafe.lng) {
        console.log('⚠️ [MARKERS] Skipping cafe without coordinates:', cafe.name);
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat: cafe.lat, lng: cafe.lng },
        map: mapInstanceRef.current,
        icon: createMarkerIcon(false, cafe.hasUserReview),
        title: cafe.name
      });

      // Add click listener
      marker.addListener('click', () => {
        console.log('📍 [MARKERS] Marker clicked:', cafe.name);
        setSelectedCafe(cafe);
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

      markersRef.current.push(marker);
    });

    console.log('✅ [MARKERS] Created', markersRef.current.length, 'markers');
  }, [cafes, selectedCafe]);


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
      {/* Map container - always visible */}
      <div ref={mapRef} className="w-full h-full bg-muted/10" />
      
      {/* Initialization overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="text-center space-y-2">
            <Coffee className="h-8 w-8 text-primary mx-auto animate-pulse" />
            <p className="text-sm text-muted-foreground">Initializing map...</p>
          </div>
        </div>
      )}
      
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