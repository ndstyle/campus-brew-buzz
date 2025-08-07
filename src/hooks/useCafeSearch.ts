import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        // For now, show empty but log that we should integrate with Google Places
        console.warn("🔍 [CAFE SEARCH] TODO: Integrate Google Places search for:", searchTerm);
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