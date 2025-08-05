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
  const [detailedError, setDetailedError] = useState(null);

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
        console.log('🗺️ Component state check:', {
          isMounted,
          mapRefExists: !!mapRef.current,
          mapRefElement: mapRef.current,
          centerCoords: center,
          zoomLevel: zoom
        });
        
        setLoadingStatus('Fetching API configuration...');
        setDetailedError(null);
        
        let googleApiKey = apiKey;
        if (!googleApiKey) {
          console.log('🔑 No cached API key, fetching from server...');
          googleApiKey = await fetchApiKey();
        } else {
          console.log('🔑 Using cached API key, length:', googleApiKey.length);
        }
        
        if (!googleApiKey) {
          const keyError = 'Google Maps API key not available from server';
          console.error('❌', keyError);
          setDetailedError(keyError);
          throw new Error(keyError);
        }
        
        console.log('✅ API key validated, creating loader...');
        setLoadingStatus('Creating Google Maps loader...');
        
        let loader;
        try {
          loader = new Loader({
            apiKey: googleApiKey,
            version: "weekly",
            libraries: ["places", "marker"]
          });
          console.log('✅ Loader created successfully:', loader);
        } catch (loaderError) {
          console.error('❌ Failed to create loader:', loaderError);
          setDetailedError(`Loader creation failed: ${loaderError.message}`);
          throw loaderError;
        }

        console.log('📡 Loading Google Maps API...');
        setLoadingStatus('Loading Google Maps API...');
        
        // Add network error handling for googleapis.com
        const startTime = Date.now();
        
        try {
          console.log('📡 Initiating API load request...');
          await Promise.race([
            loader.load(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Google Maps API request timeout')), 15000)
            )
          ]);
          console.log('✅ API load request completed successfully');
        } catch (networkError) {
          console.error('🚫 Network error loading Google Maps API:', networkError);
          const networkMsg = networkError.message.includes('timeout') 
            ? 'Network timeout: Unable to reach googleapis.com. Check your internet connection.'
            : `Network error: ${networkError.message}`;
          setDetailedError(networkMsg);
          throw new Error(networkMsg);
        }
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Google Maps API loaded successfully in ${loadTime}ms`);
        
        // Verify Google Maps global is available
        if (typeof google === 'undefined' || !google.maps) {
          const globalError = 'Google Maps global object not available after API load';
          console.error('❌', globalError);
          setDetailedError(globalError);
          throw new Error(globalError);
        }
        console.log('✅ Google Maps global object verified:', {
          google: typeof google,
          maps: typeof google.maps,
          Map: typeof google.maps.Map
        });
        
        setLoadingStatus('Checking map container...');
        
        if (!mapRef.current) {
          const containerError = 'Map container element not available';
          console.error('🚫', containerError);
          setDetailedError(containerError);
          throw new Error(containerError);
        }
        
        console.log('✅ Map container verified:', {
          element: mapRef.current,
          tagName: mapRef.current.tagName,
          className: mapRef.current.className,
          dimensions: {
            width: mapRef.current.offsetWidth,
            height: mapRef.current.offsetHeight
          }
        });
        
        setLoadingStatus('Creating map instance...');

        let map;
        try {
          console.log('🗺️ Creating new Google Map instance with config:', {
            center,
            zoom,
            stylesCount: mapStyles.length,
            container: mapRef.current
          });
          
          map = new google.maps.Map(mapRef.current, {
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
          
          console.log('✅ Map instance created:', map);
          console.log('✅ Map properties:', {
            center: map.getCenter(),
            zoom: map.getZoom(),
            div: map.getDiv()
          });
        } catch (mapError) {
          console.error('❌ Failed to create map instance:', mapError);
          setDetailedError(`Map creation failed: ${mapError.message}`);
          throw mapError;
        }

        mapInstanceRef.current = map;
        
        setLoadingStatus('Setting up map listeners...');
        
        try {
          // Add click listener to close info card
          map.addListener('click', () => {
            console.log('🖱️ Map clicked');
            setSelectedCafe(null);
          });
          console.log('✅ Map event listeners added');
        } catch (listenerError) {
          console.error('❌ Failed to add event listeners:', listenerError);
          setDetailedError(`Event listener setup failed: ${listenerError.message}`);
          throw listenerError;
        }
        
        console.log('✅ Map initialization complete!');
        setMapLoading(false);
        setLoadingStatus('');
        setDetailedError(null);

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
          {detailedError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mt-2 max-w-md">
              <strong>Error:</strong> {detailedError}
            </div>
          )}
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