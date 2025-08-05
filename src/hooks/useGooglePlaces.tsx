import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGooglePlaces = () => {
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const { toast } = useToast();

  // Debug log helper
  const debugLog = (message, data = null) => {
    console.log(`🔍 [PLACES DEBUG] ${message}`, data || '');
  };

  // Fetch API key from Supabase Edge Function
  const getApiKey = useCallback(async () => {
    try {
      debugLog('Fetching Google Places API key...');
      const { data, error } = await supabase.functions.invoke('google-maps-config');
      
      if (error) {
        debugLog('❌ API key fetch error:', error);
        throw error;
      }
      
      if (!data?.apiKey) {
        debugLog('❌ No API key in response:', data);
        throw new Error('No API key returned from server');
      }
      
      debugLog('✅ API key fetched successfully, length:', data.apiKey.length);
      setApiKey(data.apiKey);
      return data.apiKey;
    } catch (err) {
      debugLog('❌ Failed to fetch API key:', err);
      throw err;
    }
  }, []);

  // Search for places using Google Places API
  const searchNearbyPlaces = useCallback(async (center, radius = 2000) => {
    setPlacesLoading(true);
    setPlacesError(null);
    
    try {
      debugLog('🚀 Starting Google Places search', { center, radius });
      
      // Get API key if not already available
      let currentApiKey = apiKey;
      if (!currentApiKey) {
        debugLog('🔑 Getting API key...');
        currentApiKey = await getApiKey();
      }

      // Multiple place types to try
      const placeTypes = ['cafe', 'restaurant', 'food', 'meal_takeaway'];
      let allPlaces = [];

      for (const placeType of placeTypes) {
        debugLog(`🔍 Searching for places of type: ${placeType}`);
        
        // Construct the Places API URL
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=${radius}&type=${placeType}&key=${currentApiKey}`;
        
        debugLog('📡 Places API Request URL:', placesUrl.replace(currentApiKey, '[API_KEY_HIDDEN]'));
        
        try {
          const response = await fetch(placesUrl);
          debugLog(`📥 Places API Response Status (${placeType}):`, response.status);
          
          if (!response.ok) {
            debugLog(`❌ Places API HTTP Error (${placeType}):`, response.statusText);
            continue;
          }
          
          const data = await response.json();
          debugLog(`📊 Places API Response Data (${placeType}):`, {
            status: data.status,
            resultsCount: data.results?.length || 0,
            nextPageToken: !!data.next_page_token
          });
          
          if (data.status !== 'OK') {
            debugLog(`⚠️ Places API Status Error (${placeType}):`, { status: data.status, error: data.error_message });
            continue;
          }
          
          // Log first few results for debugging
          if (data.results && data.results.length > 0) {
            debugLog(`📍 First 3 places found for ${placeType}:`, 
              data.results.slice(0, 3).map(place => ({
                name: place.name,
                place_id: place.place_id,
                types: place.types,
                rating: place.rating,
                lat: place.geometry?.location?.lat,
                lng: place.geometry?.location?.lng
              }))
            );
            
            // Transform and add to our results
            const transformedPlaces = data.results.map(place => ({
              id: place.place_id,
              name: place.name,
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
              address: place.vicinity || place.formatted_address,
              google_place_id: place.place_id,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              types: place.types || [],
              source: 'google_places',
              placeType: placeType,
              // Additional debug info
              price_level: place.price_level,
              permanently_closed: place.permanently_closed,
              opening_hours: place.opening_hours
            }));
            
            allPlaces.push(...transformedPlaces);
          } else {
            debugLog(`📭 No places found for type: ${placeType}`);
          }
          
        } catch (fetchError) {
          debugLog(`❌ Network error for ${placeType}:`, fetchError);
        }
      }
      
      // Remove duplicates based on place_id
      const uniquePlaces = allPlaces.reduce((unique, place) => {
        if (!unique.find(p => p.google_place_id === place.google_place_id)) {
          unique.push(place);
        }
        return unique;
      }, []);
      
      debugLog('🎯 Final results summary:', {
        totalPlacesFound: allPlaces.length,
        uniquePlacesFound: uniquePlaces.length,
        placeTypesSearched: placeTypes,
        searchRadius: radius,
        searchCenter: center
      });
      
      if (uniquePlaces.length === 0) {
        debugLog('⚠️ No places found - checking common issues:', {
          'API key valid': !!currentApiKey,
          'Center coordinates': center,
          'Radius': radius,
          'Place types': placeTypes,
          'Suggestion': 'Try increasing radius or checking if location has cafes nearby'
        });
      }
      
      return uniquePlaces;
      
    } catch (err) {
      debugLog('❌ Places search failed:', err);
      setPlacesError(err.message);
      toast({
        title: "Places Search Error",
        description: `Failed to search for places: ${err.message}`,
        variant: "destructive"
      });
      return [];
    } finally {
      setPlacesLoading(false);
    }
  }, [apiKey, getApiKey, toast]);

  // Test function to verify Places API is working
  const testPlacesAPI = useCallback(async (center) => {
    debugLog('🧪 Testing Places API with increased radius...');
    
    // Test with very large radius to ensure we get results
    const testRadii = [1000, 5000, 10000, 25000];
    
    for (const radius of testRadii) {
      debugLog(`🧪 Testing radius: ${radius}m`);
      const results = await searchNearbyPlaces(center, radius);
      if (results.length > 0) {
        debugLog(`✅ Success! Found ${results.length} places with ${radius}m radius`);
        break;
      }
    }
  }, [searchNearbyPlaces]);

  return {
    searchNearbyPlaces,
    testPlacesAPI,
    placesLoading,
    placesError,
    apiKey
  };
};