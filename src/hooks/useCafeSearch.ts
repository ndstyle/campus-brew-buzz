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
    if (!searchTerm.trim()) {
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

      const { data, error } = await query.order('name');

      if (error) {
        throw error;
      }

      setResults(data || []);
    } catch (error: any) {
      console.error('Error searching cafes:', error);
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