import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface University {
  id: string;
  name: string;
  aliases: string[];
  latitude: number;
  longitude: number;
  default_zoom: number;
  country: string;
  state_province: string | null;
  city: string | null;
  verified: boolean;
}

export interface UniversityCoordinates {
  lat: number;
  lng: number;
  zoom: number;
}

export const useUniversities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUniversities = async () => {
    try {
      console.log('🏫 [UNIVERSITIES] Fetching universities from database...');
      
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ [UNIVERSITIES] Error fetching universities:', error);
        toast({
          title: "Error loading universities",
          description: "Failed to load university data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const formattedData = (data || []).map((university: any) => ({
        ...university,
        aliases: Array.isArray(university.aliases) ? university.aliases.filter((alias: any) => typeof alias === 'string') : [],
        city: university.city || null,
        state_province: university.state_province || null,
        country: university.country || 'USA',
        verified: university.verified || false,
        default_zoom: university.default_zoom || 15
      }));
      
      console.log(`✅ [UNIVERSITIES] Loaded ${formattedData.length} universities from database`);
      setUniversities(formattedData);
    } catch (err) {
      console.error('❌ [UNIVERSITIES] Unexpected error:', err);
      toast({
        title: "University loading failed",
        description: "An unexpected error occurred loading universities.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const getUniversityCoordinates = (universityName: string): UniversityCoordinates => {
    console.log(`🎯 [UNIVERSITIES] Looking up coordinates for: "${universityName}"`);
    
    if (!universityName) {
      console.log('⚠️ [UNIVERSITIES] No university name provided, using fallback');
      return { lat: 39.8283, lng: -98.5795, zoom: 4 }; // Center of USA
    }

    // First try exact match
    const exactMatch = universities.find(u => u.name.toLowerCase() === universityName.toLowerCase());
    if (exactMatch) {
      const coords = {
        lat: Number(exactMatch.latitude),
        lng: Number(exactMatch.longitude),
        zoom: exactMatch.default_zoom
      };
      console.log(`✅ [UNIVERSITIES] Exact match found for "${universityName}":`, coords);
      return coords;
    }

    // Try alias match
    const aliasMatch = universities.find(u => 
      u.aliases.some(alias => alias.toLowerCase() === universityName.toLowerCase())
    );
    if (aliasMatch) {
      const coords = {
        lat: Number(aliasMatch.latitude),
        lng: Number(aliasMatch.longitude),
        zoom: aliasMatch.default_zoom
      };
      console.log(`✅ [UNIVERSITIES] Alias match found for "${universityName}":`, coords);
      return coords;
    }

    // Try partial match on name
    const partialMatch = universities.find(u => 
      u.name.toLowerCase().includes(universityName.toLowerCase()) ||
      universityName.toLowerCase().includes(u.name.toLowerCase())
    );
    if (partialMatch) {
      const coords = {
        lat: Number(partialMatch.latitude),
        lng: Number(partialMatch.longitude),
        zoom: partialMatch.default_zoom
      };
      console.log(`✅ [UNIVERSITIES] Partial match found for "${universityName}":`, coords);
      return coords;
    }

    // Try partial match on aliases
    const aliasPartialMatch = universities.find(u => 
      u.aliases.some(alias => 
        alias.toLowerCase().includes(universityName.toLowerCase()) ||
        universityName.toLowerCase().includes(alias.toLowerCase())
      )
    );
    if (aliasPartialMatch) {
      const coords = {
        lat: Number(aliasPartialMatch.latitude),
        lng: Number(aliasPartialMatch.longitude),
        zoom: aliasPartialMatch.default_zoom
      };
      console.log(`✅ [UNIVERSITIES] Alias partial match found for "${universityName}":`, coords);
      return coords;
    }

    console.log(`❌ [UNIVERSITIES] No match found for "${universityName}", using fallback coordinates`);
    return { lat: 39.8283, lng: -98.5795, zoom: 4 }; // Center of USA fallback
  };

  const searchUniversities = (query: string): University[] => {
    if (!query || query.length < 2) return [];
    
    const queryLower = query.toLowerCase();
    
    return universities.filter(u => {
      // Match by name
      const nameMatch = u.name.toLowerCase().includes(queryLower);
      
      // Match by aliases
      const aliasMatch = u.aliases.some(alias => 
        alias.toLowerCase().includes(queryLower)
      );
      
      // Match by city or state
      const locationMatch = 
        (u.city && u.city.toLowerCase().includes(queryLower)) ||
        (u.state_province && u.state_province.toLowerCase().includes(queryLower));
      
      return nameMatch || aliasMatch || locationMatch;
    }).slice(0, 20); // Limit results for performance
  };

  return {
    universities,
    loading,
    getUniversityCoordinates,
    searchUniversities,
    refreshUniversities: fetchUniversities
  };
};