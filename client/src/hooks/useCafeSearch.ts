import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGeoapify } from '@/hooks/useGeoapify';
import { useUniversities } from '@/hooks/useUniversities';

// Remove Google Places - using GEOAPIFY instead

export interface CafeResult {
  id: string;
  name: string;
  address?: string;
  campus?: string;
  geoapify_place_id?: string;
  lat?: number;
  lng?: number;
}

export const useCafeSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CafeResult[]>([]);
  const { toast } = useToast();
  const { searchNearbyCafes, searchCafesByName } = useGeoapify();
  const { getUniversityCoordinates } = useUniversities();

  const searchCafes = useCallback(async (searchTerm: string, campus?: string) => {
    console.log("🔍 [CAFE SEARCH] Search triggered for:", searchTerm, "campus:", campus);
    
    if (!searchTerm.trim()) {
      console.log("🔍 [CAFE SEARCH] Empty search term, clearing results");
      setResults([]);
      return;
    }

    if (!campus) {
      console.error("🔍 [CAFE SEARCH] No campus provided");
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
      // Get campus coordinates for GEOAPIFY search
      const campusCoords = getUniversityCoordinates(campus);
      if (!campusCoords) {
        console.error("🔍 [CAFE SEARCH] Could not get coordinates for campus:", campus);
        setResults([]);
        return;
      }

      console.log("🔍 [CAFE SEARCH] Using campus coordinates:", campusCoords);

      // Step 1: Search database for existing cafes
      let query = supabase
        .from('cafes')
        .select('id, name, address, campus, geoapify_place_id, lat, lng')
        .ilike('name', `%${searchTerm}%`)
        .limit(5);

      if (campus) {
        query = query.eq('campus', campus);
      }

      console.log("🔍 [CAFE SEARCH] Executing Supabase query...");
      const { data: dbResults, error } = await query.order('name');

      if (error) {
        console.error("🔍 [CAFE SEARCH] Supabase query error:", error);
        throw error;
      }

      console.log("🔍 [CAFE SEARCH] Database results:", dbResults?.length || 0);

      // Step 2: Search GEOAPIFY for nearby cafes (using same logic as map)
      console.log("🔍 [CAFE SEARCH] Searching GEOAPIFY for nearby cafes...");
      const geoapifyResults = await searchCafesByName(searchTerm, campusCoords.lat, campusCoords.lng);
      
      console.log("🔍 [CAFE SEARCH] GEOAPIFY results:", geoapifyResults.length);

      // Step 3: Transform GEOAPIFY results to CafeResult format
      const transformedGeoapifyResults: CafeResult[] = geoapifyResults.map(place => ({
        id: '', // Empty ID means new cafe
        name: place.name,
        address: place.vicinity || place.address,
        campus: campus,
        geoapify_place_id: place.geoapify_place_id || place.place_id,
        lat: place.latitude || place.lat,
        lng: place.longitude || place.lng
      }));

      // Step 4: Convert database results to CafeResult format
      const transformedDbResults: CafeResult[] = (dbResults || []).map(cafe => ({
        ...cafe,
        address: cafe.address || undefined,
        campus: cafe.campus || undefined
      }));

      // Step 5: Combine and deduplicate results (prioritize database entries)
      const allResults = [...transformedDbResults, ...transformedGeoapifyResults];
      const uniqueResults = allResults.filter((cafe, index, arr) => 
        arr.findIndex(c => c.name.toLowerCase() === cafe.name.toLowerCase()) === index
      ).slice(0, 8); // Limit to top 8 results
      
      console.log("🔍 [CAFE SEARCH] Combined unique results:", uniqueResults.length, "cafes found");
      setResults(uniqueResults);

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
  }, [toast, getUniversityCoordinates, searchCafesByName]);

  // Function removed - using GEOAPIFY instead

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