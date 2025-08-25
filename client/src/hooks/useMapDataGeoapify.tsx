import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGeoapify } from './useGeoapify';

export const useMapDataGeoapify = () => {
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { searchNearbyCafes, testGeoapifyAPI, placesLoading, placesError } = useGeoapify();

  // Debug log helper
  const debugLog = (message: string, data: any = null) => {
    console.log(`🗺️ [MAP DATA GEOAPIFY] ${message}`, data || '');
  };

  // Determine campus from coordinates (basic implementation)
  const determineCampus = useCallback((lat: number, lng: number): string => {
    // UCLA coordinates: 34.0689, -118.4452
    if (Math.abs(lat - 34.0689) < 0.01 && Math.abs(lng + 118.4452) < 0.01) {
      return 'University of California, Los Angeles';
    }
    // UIUC coordinates: 40.1020, -88.2272
    if (Math.abs(lat - 40.1020) < 0.01 && Math.abs(lng + 88.2272) < 0.01) {
      return 'University of Illinois Urbana-Champaign';
    }
    // UC Berkeley coordinates: 37.8719, -122.2585
    if (Math.abs(lat - 37.8719) < 0.01 && Math.abs(lng + 122.2585) < 0.01) {
      return 'University of California, Berkeley';
    }
    return 'Unknown Campus';
  }, []);

  // Merge and deduplicate cafes
  const mergeAndDeduplicateCafes = useCallback((dbCafes: any[], apiCafes: any[]): any[] => {
    const combined = [...dbCafes];
    
    apiCafes.forEach(apiCafe => {
      const isDuplicate = combined.some(dbCafe => 
        dbCafe.name.toLowerCase() === apiCafe.name.toLowerCase() &&
        Math.abs((dbCafe.lat || 0) - apiCafe.latitude) < 0.001 &&
        Math.abs((dbCafe.lng || 0) - apiCafe.longitude) < 0.001
      );
      
      if (!isDuplicate) {
        // Add campus information to new cafes
        const cafeWithCampus = {
          ...apiCafe,
          campus: determineCampus(apiCafe.latitude, apiCafe.longitude)
        };
        combined.push(cafeWithCampus);
      }
    });
    
    return combined;
  }, [determineCampus]);

  // Fetch cafes from database
  const fetchExistingCafes = useCallback(async (userCampus?: string | null): Promise<any[]> => {
    try {
      debugLog('📊 Fetching cafes from Supabase database...');
      
      let query = supabase
        .from('cafes')
        .select(`
          *,
          reviews (
            id,
            rating,
            user_id,
            blurb,
            photo_url,
            created_at
          )
        `);

      // Filter by campus if available
      if (userCampus) {
        query = query.eq('campus', userCampus);
        debugLog('🎯 Filtering by campus:', userCampus);
      }

      const { data: supabaseCafes, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      debugLog('📊 Supabase cafes found:', supabaseCafes?.length || 0);

      // Calculate average ratings for each cafe
      const cafesWithRatings = (supabaseCafes || []).map(cafe => {
        const reviews = cafe.reviews || [];
        const totalRating = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        return {
          ...cafe,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: reviews.length,
          hasUserReview: user ? reviews.some((review: any) => review.user_id === user.id) : false,
          source: 'supabase',
          // Ensure we have both lat/lng and latitude/longitude for compatibility
          lat: cafe.lat,
          lng: cafe.lng,
          latitude: cafe.lat,
          longitude: cafe.lng,
        };
      });
      
      return cafesWithRatings;
    } catch (error: any) {
      console.error('❌ Error fetching from database:', error);
      return [];
    }
  }, [user]);

  // Main fetch function
  const fetchCafes = useCallback(async (userCampus: string | null = null, center: { lat: number; lng: number } | null = null) => {
    setLoading(true);
    setError(null);
    
    debugLog('🚀 Starting comprehensive cafe fetch with Geoapify', { userCampus, center });

    try {
      // Step 1: Fetch cafes from Supabase database
      const dbCafes = await fetchExistingCafes(userCampus);

      // Step 2: If we have map center, also fetch from Geoapify
      let geoapifyCafes: any[] = [];
      if (center) {
        debugLog('🌍 Fetching places from Geoapify API...', center);
        try {
          geoapifyCafes = await searchNearbyCafes(center, 2000); // 2km radius
          debugLog('🌍 Geoapify places found:', geoapifyCafes.length);
          
          // If no results with 2km, try larger radius
          if (geoapifyCafes.length === 0) {
            debugLog('🔍 No results with 2km radius, trying 5km...');
            geoapifyCafes = await searchNearbyCafes(center, 5000);
            debugLog('🌍 Geoapify places found with 5km radius:', geoapifyCafes.length);
          }
        } catch (placesError) {
          debugLog('❌ Geoapify API error:', placesError);
          // Don't throw, just log the error and continue with Supabase data only
        }
      } else {
        debugLog('⚠️ No map center provided, skipping Geoapify API');
      }

      // Step 3: Combine results, prioritizing Supabase data for duplicates
      debugLog('🔗 Combining Supabase and Geoapify data...');
      const combinedCafes = mergeAndDeduplicateCafes(dbCafes, geoapifyCafes);

      debugLog('✅ Final cafe results:', {
        supabaseCafes: dbCafes.length,
        geoapifyCafes: geoapifyCafes.length,
        totalUnique: combinedCafes.length,
        sources: combinedCafes.reduce((acc, cafe) => {
          acc[cafe.source] = (acc[cafe.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      setCafes(combinedCafes);
      
    } catch (err: any) {
      debugLog('❌ Error in fetchCafes:', err);
      console.error('Error fetching cafes:', err);
      setError(err.message);
      toast({
        title: "Error Loading Cafes",
        description: "Failed to load coffee shops. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, searchNearbyCafes, fetchExistingCafes, mergeAndDeduplicateCafes]);

  // Function to test Geoapify API
  const testGeoapifyAPIWrapper = useCallback(async (center?: { lat: number; lng: number }) => {
    debugLog('🧪 Testing Geoapify API...');
    if (!center) {
      debugLog('❌ No center coordinates provided for testing');
      return;
    }
    
    await testGeoapifyAPI();
  }, [testGeoapifyAPI]);

  // Set up real-time subscription for new cafes
  useEffect(() => {
    const channel = supabase
      .channel('cafe-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cafes'
        },
        (payload) => {
          console.log('New cafe added:', payload);
          // Add the new cafe to the list
          setCafes(prev => [...prev, {
            ...payload.new,
            averageRating: 0,
            reviewCount: 0,
            hasUserReview: false,
            reviews: []
          }]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          console.log('New review added:', payload);
          // Refresh cafe data when a new review is added
          const userCampus = user?.user_metadata?.college;
          fetchCafes(userCampus, mapCenter);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Reduce dependencies to prevent loops

  const retryFetch = useCallback(() => {
    const userCampus = user?.user_metadata?.college;
    fetchCafes(userCampus, mapCenter);
  }, [fetchCafes, user, mapCenter]);

  return {
    cafes,
    loading: loading || placesLoading,
    error: error || placesError,
    fetchCafes,
    retryFetch,
    testGeoapifyAPI: testGeoapifyAPIWrapper,
    setMapCenter
  };
};