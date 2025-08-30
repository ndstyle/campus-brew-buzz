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

export const useCafeSearch = (mapCafes?: any[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CafeResult[]>([]);
  const { toast } = useToast();
  const { getUniversityCoordinates } = useUniversities();

  const searchCafes = useCallback(async (searchTerm: string, campus?: string) => {
    console.log("🔍 [CAFE SEARCH] Search triggered for:", searchTerm, "campus:", campus);
    
    if (!searchTerm.trim()) {
      console.log("🔍 [CAFE SEARCH] Empty search term, clearing results");
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the same cafe data that's already loaded by the map
      if (mapCafes && mapCafes.length > 0) {
        console.log("🔍 [CAFE SEARCH] Using existing map data:", mapCafes.length, "cafes");
        
        // Filter map cafes by search term and campus
        const filteredCafes = mapCafes
          .filter(cafe => {
            const nameMatch = cafe.name.toLowerCase().includes(searchTerm.toLowerCase());
            const campusMatch = !campus || cafe.campus === campus;
            return nameMatch && campusMatch;
          })
          .slice(0, 8)
          .map(cafe => ({
            id: cafe.id || '',
            name: cafe.name,
            address: cafe.address || cafe.vicinity,
            campus: cafe.campus,
            geoapify_place_id: cafe.geoapify_place_id || cafe.place_id,
            lat: cafe.lat || cafe.latitude,
            lng: cafe.lng || cafe.longitude
          }));

        console.log("🔍 [CAFE SEARCH] Filtered results from map data:", filteredCafes.length);
        setResults(filteredCafes);
        return;
      }

      // Fallback: Search database directly if no map data available
      console.log("🔍 [CAFE SEARCH] No map data available, searching database...");
      let query = supabase
        .from('cafes')
        .select('id, name, address, campus, lat, lng')
        .ilike('name', `%${searchTerm}%`)
        .limit(8);

      if (campus) {
        query = query.eq('campus', campus);
      }

      const { data: dbResults, error } = await query.order('name');

      if (error) {
        console.error("🔍 [CAFE SEARCH] Supabase query error:", error);
        throw error;
      }

      const transformedResults: CafeResult[] = (dbResults || []).map(cafe => ({
        id: cafe.id || '',
        name: cafe.name || '',
        address: cafe.address || undefined,
        campus: cafe.campus || undefined,
        lat: cafe.lat || undefined,
        lng: cafe.lng || undefined
      }));

      console.log("🔍 [CAFE SEARCH] Database fallback results:", transformedResults.length);
      setResults(transformedResults);

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
  }, [toast, mapCafes]);

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