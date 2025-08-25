import { useState, useCallback } from 'react';
import { geoapifyService, type GeoapifyPlace } from '@/services/geoapifyService';
import { useToast } from '@/hooks/use-toast';

export const useGeoapify = () => {
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const { toast } = useToast();

  // Debug log helper
  const debugLog = (message: string, data: any = null) => {
    console.log(`🌍 [GEOAPIFY DEBUG] ${message}`, data || '');
  };

  // Search for cafes using Geoapify
  const searchNearbyCafes = useCallback(async (center: { lat: number; lng: number }, radius: number = 3000) => {
    setPlacesLoading(true);
    setPlacesError(null);
    
    try {
      debugLog('🚀 Starting Geoapify cafe search', { center, radius });
      
      const places = await geoapifyService.searchCafesNearCampus(center.lat, center.lng, radius);
      
      // Transform Geoapify results to match our expected format
      const transformedPlaces = places.map((place: GeoapifyPlace) => ({
        place_id: place.place_id,
        geoapify_place_id: place.place_id,
        name: place.properties.name,
        address: place.properties.formatted,
        vicinity: place.properties.formatted,
        rating: 0, // Geoapify doesn't provide ratings
        user_ratings_total: 0,
        price_level: undefined,
        lat: place.properties.lat,
        lng: place.properties.lon,
        latitude: place.properties.lat,
        longitude: place.properties.lon,
        photos: [],
        opening_hours: place.properties.opening_hours,
        types: place.properties.categories || [],
        source: 'geoapify',
        osm_id: place.properties.datasource?.raw?.osm_id || null,
        categories: place.properties.categories || [],
        website: place.properties.website,
        phone: place.properties.contact?.phone,
      }));

      debugLog('✅ Successfully processed Geoapify places:', transformedPlaces.length);
      
      if (transformedPlaces.length > 0) {
        debugLog('📍 First 3 places found:', 
          transformedPlaces.slice(0, 3).map(place => ({
            name: place.name,
            geoapify_place_id: place.geoapify_place_id,
            lat: place.lat,
            lng: place.lng
          }))
        );
      }

      setPlacesLoading(false);
      return transformedPlaces;

    } catch (err: any) {
      debugLog('❌ Geoapify search failed:', err);
      setPlacesError(err.message);
      setPlacesLoading(false);
      
      // Use toast if available
      if (toast) {
        toast({
          title: "Search Error",
          description: `Failed to load nearby cafes: ${err.message}`,
          variant: "destructive",
        });
      }
      
      return [];
    }
  }, [toast]);

  // Search cafes by name
  const searchCafesByName = useCallback(async (query: string, center?: { lat: number; lng: number }) => {
    setPlacesLoading(true);
    setPlacesError(null);
    
    try {
      debugLog('🔍 Starting Geoapify text search', { query, center });
      
      const places = await geoapifyService.searchCafesByName(query, center?.lat, center?.lng);
      
      // Transform results
      const transformedPlaces = places.map((place: GeoapifyPlace) => ({
        place_id: place.place_id,
        geoapify_place_id: place.place_id,
        name: place.properties.name,
        address: place.properties.formatted,
        vicinity: place.properties.formatted,
        rating: 0,
        user_ratings_total: 0,
        lat: place.properties.lat,
        lng: place.properties.lon,
        latitude: place.properties.lat,
        longitude: place.properties.lon,
        photos: [],
        opening_hours: place.properties.opening_hours,
        types: place.properties.categories || [],
        source: 'geoapify',
        osm_id: place.properties.datasource?.raw?.osm_id || null,
        categories: place.properties.categories || [],
        website: place.properties.website,
        phone: place.properties.contact?.phone,
      }));

      setPlacesLoading(false);
      return transformedPlaces;

    } catch (err: any) {
      debugLog('❌ Geoapify text search failed:', err);
      setPlacesError(err.message);
      setPlacesLoading(false);
      
      if (toast) {
        toast({
          title: "Search Error",
          description: `Failed to search cafes: ${err.message}`,
          variant: "destructive",
        });
      }
      
      return [];
    }
  }, [toast]);

  // Test the Geoapify API connection
  const testGeoapifyAPI = useCallback(async () => {
    debugLog('🧪 Testing Geoapify API...');
    
    try {
      // Test with a known location (UCLA)
      const testCenter = { lat: 34.0689, lng: -118.4452 };
      
      const places = await geoapifyService.searchCafesNearCampus(testCenter.lat, testCenter.lng, 1000);

      if (places.length > 0) {
        debugLog('✅ Geoapify API test successful:', `${places.length} places found`);
        if (toast) {
          toast({
            title: "Geoapify API Test Successful",
            description: `Found ${places.length} places near test location`,
          });
        }
        return true;
      } else {
        debugLog('⚠️ Geoapify API test returned no results');
        if (toast) {
          toast({
            title: "Geoapify API Test Warning",
            description: "API is working but no places found in test area",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (err: any) {
      debugLog('❌ Geoapify API test failed:', err);
      if (toast) {
        toast({
          title: "Geoapify API Test Failed",
          description: err.message,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [toast]);

  return {
    searchNearbyCafes,
    searchCafesByName,
    testGeoapifyAPI,
    placesLoading,
    placesError
  };
};