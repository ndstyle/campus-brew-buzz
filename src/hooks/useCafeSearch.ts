import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Campus coordinates for Google Places search
const CAMPUS_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'UCLA': { lat: 34.0689, lng: -118.4452 },
  'University of California, Los Angeles': { lat: 34.0689, lng: -118.4452 },
  'USC': { lat: 34.0224, lng: -118.2851 },
  'Stanford': { lat: 37.4419, lng: -122.1430 },
  // Add more campuses as needed
};

export interface CafeResult {
  id: string;
  name: string;
  address?: string;
  campus?: string;
  google_place_id?: string;
}

export const useCafeSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CafeResult[]>([]);
  const { toast } = useToast();

  const searchCafes = useCallback(async (searchTerm: string, campus?: string) => {
    console.log("🔍 [CAFE SEARCH] Search triggered for:", searchTerm, "campus:", campus);
    
    if (!searchTerm.trim()) {
      console.log("🔍 [CAFE SEARCH] Empty search term, clearing results");
      setResults([]);
      return;
    }

    if (!campus) {
      console.error("🔍 [CAFE SEARCH] No campus provided - this is required for Supabase query");
      toast({
        title: "Campus Required",
        description: "Campus information is needed to search cafes.",
        variant: "destructive"
      });
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Build the query with search and optional campus filter
      let query = supabase
        .from('cafes')
        .select('id, name, address, campus, google_place_id')
        .ilike('name', `%${searchTerm}%`)
        .limit(5);

      if (campus) {
        query = query.eq('campus', campus);
      }

      console.log("🔍 [CAFE SEARCH] Executing Supabase query...");
      const { data, error } = await query.order('name');

      if (error) {
        console.error("🔍 [CAFE SEARCH] Supabase query error:", error);
        throw error;
      }

      console.log("🔍 [CAFE SEARCH] Supabase results:", data);
      console.log("🔍 [CAFE SEARCH] Results count:", data?.length || 0);

      // If no results from database, try to search Google Places
      if (!data || data.length === 0) {
        console.log("🔍 [CAFE SEARCH] No database results, searching Google Places...");
        
        const googlePlacesResults = await searchGooglePlaces(searchTerm, campus);
        if (googlePlacesResults.length > 0) {
          console.log("🔍 [CAFE SEARCH] Found", googlePlacesResults.length, "results from Google Places");
          setResults(googlePlacesResults);
          return;
        }
      }

      setResults(data || []);
    } catch (error: any) {
      console.error('🔍 [CAFE SEARCH] Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search cafes. Please try again.",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Google Places search function
  const searchGooglePlaces = async (query: string, campus?: string): Promise<CafeResult[]> => {
    try {
      if (!campus) {
        console.warn("🔍 [GOOGLE PLACES] No campus provided, skipping Google Places search");
        return [];
      }

      // Get campus coordinates
      const coordinates = CAMPUS_COORDINATES[campus] || CAMPUS_COORDINATES['UCLA']; // Default to UCLA
      console.log("🔍 [GOOGLE PLACES] Using coordinates for", campus, ":", coordinates);

      // Call the places-search edge function
      const { data: placesData, error: placesError } = await supabase.functions.invoke('places-search', {
        body: {
          searchQuery: `${query} coffee cafe`,
          location: coordinates,
          radius: 5000 // 5km radius around campus
        }
      });

      if (placesError) {
        console.error("🔍 [GOOGLE PLACES] Error calling places-search function:", placesError);
        return [];
      }

      if (!placesData?.results || placesData.results.length === 0) {
        console.log("🔍 [GOOGLE PLACES] No results returned from Google Places");
        return [];
      }

      console.log("🔍 [GOOGLE PLACES] Raw results:", placesData.results.length, "places found");

      // Transform Google Places results to match CafeResult schema
      const transformedResults: CafeResult[] = placesData.results
        .filter((place: any) => place.name && place.place_id)
        .slice(0, 5) // Limit to top 5 results
        .map((place: any) => ({
          id: uuidv4(), // Generate UUID for database operations
          name: place.name,
          address: place.vicinity || place.formatted_address,
          campus: campus,
          google_place_id: place.place_id, // Keep Google Places ID for Maps integration
        }));

      console.log("🔍 [GOOGLE PLACES] Transformed results:", transformedResults);
      return transformedResults;

    } catch (error) {
      console.error('🔍 [GOOGLE PLACES] Error searching Google Places:', error);
      return [];
    }
  };

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    searchCafes,
    clearResults,
    results,
    isLoading
  };
};