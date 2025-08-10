import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGooglePlaces = () => {
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const { toast } = useToast();

  // Debug log helper
  const debugLog = (message, data = null) => {
    console.log(`🔍 [PLACES DEBUG] ${message}`, data || '');
  };

  // Search for places using Supabase Edge Function (fixes CORS issue)
  const searchNearbyPlaces = useCallback(async (center, radius = 2000) => {
    setPlacesLoading(true);
    setPlacesError(null);
    
    try {
      debugLog('🚀 Starting Google Places search via Edge Function', { center, radius });
      
      // Call the Supabase Edge Function instead of direct API call
      const { data, error } = await supabase.functions.invoke('places-search', {
        body: {
          searchQuery: 'coffee cafe',
          location: {
            lat: center.lat,
            lng: center.lng
          },
          radius: radius
        }
      });

      if (error) {
        debugLog('❌ Edge Function error:', error);
        throw error;
      }

      debugLog('📊 Edge Function Response:', {
        status: data.status,
        resultsCount: data.results?.length || 0,
      });

      if (data.status !== 'OK') {
        debugLog('⚠️ Places API Status Error:', { status: data.status, error: data.error });
        throw new Error(`Places API error: ${data.status}`);
      }

      // Transform the results to match your expected format
      const places = (data.results || []).map(place => ({
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity || 'Address not available',
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        price_level: place.price_level,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        photos: place.photos || [],
        opening_hours: place.opening_hours,
        types: place.types || [],
        source: 'google'
      }));

      debugLog('✅ Successfully processed places:', places.length);
      
      if (places.length > 0) {
        debugLog('📍 First 3 places found:', 
          places.slice(0, 3).map(place => ({
            name: place.name,
            place_id: place.place_id,
            rating: place.rating,
            lat: place.lat,
            lng: place.lng
          }))
        );
      }

      setPlacesLoading(false);
      return places;

    } catch (err) {
      debugLog('❌ Places search failed:', err);
      setPlacesError(err.message);
      setPlacesLoading(false);
      
      toast({
        title: "Places Search Error",
        description: `Failed to load nearby cafes: ${err.message}`,
        variant: "destructive",
      });
      
      return [];
    }
  }, []);

  // Test the Places API connection
  const testPlacesAPI = useCallback(async () => {
    debugLog('🧪 Testing Places API via Edge Function...');
    
    try {
      // Test with a known location (San Francisco)
      const testCenter = { lat: 37.7749, lng: -122.4194 };
      const results = await searchNearbyPlaces(testCenter, 1000);
      
      if (results.length > 0) {
        debugLog('✅ Places API test successful:', `${results.length} places found`);
        toast({
          title: "Places API Test Successful",
          description: `Found ${results.length} places near test location`,
        });
        return true;
      } else {
        debugLog('⚠️ Places API test returned no results');
        toast({
          title: "Places API Test Warning",
          description: "API is working but no places found in test area",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      debugLog('❌ Places API test failed:', err);
      toast({
        title: "Places API Test Failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  }, [searchNearbyPlaces]);

  return {
    searchNearbyPlaces,
    testPlacesAPI,
    placesLoading,
    placesError
  };
};