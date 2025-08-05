import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGooglePlaces } from './useGooglePlaces';

export const useMapData = () => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { searchNearbyPlaces, testPlacesAPI, placesLoading, placesError } = useGooglePlaces();

  // Debug log helper
  const debugLog = (message, data = null) => {
    console.log(`🗺️ [MAP DATA DEBUG] ${message}`, data || '');
  };

  const fetchCafes = useCallback(async (userCampus = null, center = null) => {
    setLoading(true);
    setError(null);
    
    debugLog('🚀 Starting comprehensive cafe fetch', { userCampus, center });

    try {
      // Step 1: Fetch cafes from Supabase database
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
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        return {
          ...cafe,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: reviews.length,
          hasUserReview: user ? reviews.some(review => review.user_id === user.id) : false,
          source: 'supabase'
        };
      });

      // Step 2: If we have map center, also fetch from Google Places API
      let googlePlaces = [];
      if (center) {
        debugLog('🌍 Fetching places from Google Places API...', center);
        try {
          googlePlaces = await searchNearbyPlaces(center, 2000); // 2km radius
          debugLog('🌍 Google Places found:', googlePlaces.length);
          
          // If no results with 2km, try larger radius
          if (googlePlaces.length === 0) {
            debugLog('🔍 No results with 2km radius, trying 5km...');
            googlePlaces = await searchNearbyPlaces(center, 5000);
            debugLog('🌍 Google Places found with 5km radius:', googlePlaces.length);
          }
        } catch (placesError) {
          debugLog('❌ Google Places API error:', placesError);
          // Don't throw, just log the error and continue with Supabase data only
        }
      } else {
        debugLog('⚠️ No map center provided, skipping Google Places API');
      }

      // Step 3: Combine results, prioritizing Supabase data for duplicates
      debugLog('🔗 Combining Supabase and Google Places data...');
      const combinedCafes = [...cafesWithRatings];
      
      // Add Google Places that aren't already in Supabase
      googlePlaces.forEach(googlePlace => {
        const existsInSupabase = cafesWithRatings.some(
          supabaseCafe => supabaseCafe.google_place_id === googlePlace.google_place_id
        );
        
        if (!existsInSupabase) {
          combinedCafes.push({
            ...googlePlace,
            averageRating: googlePlace.rating || 0,
            reviewCount: googlePlace.user_ratings_total || 0,
            hasUserReview: false,
            reviews: []
          });
        }
      });

      debugLog('✅ Final cafe results:', {
        supabaseCafes: cafesWithRatings.length,
        googlePlaces: googlePlaces.length,
        totalUnique: combinedCafes.length,
        sources: combinedCafes.reduce((acc, cafe) => {
          acc[cafe.source] = (acc[cafe.source] || 0) + 1;
          return acc;
        }, {})
      });

      setCafes(combinedCafes);
      
    } catch (err) {
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
  }, [user, toast, searchNearbyPlaces]);

  // Function to test Google Places API with debug info
  const testGooglePlacesAPI = useCallback(async (center) => {
    debugLog('🧪 Testing Google Places API...');
    if (!center) {
      debugLog('❌ No center coordinates provided for testing');
      return;
    }
    
    await testPlacesAPI(center);
  }, [testPlacesAPI]);

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
  }, [fetchCafes, user]);

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
    testGooglePlacesAPI,
    setMapCenter
  };
};