import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMapData = () => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Debug log helper
  const debugLog = (message, data = null) => {
    console.log(`🗺️ [MAP DATA DEBUG] ${message}`, data || '');
  };

  const fetchCafes = useCallback(async (userCampus = null, center = null) => {
    setLoading(true);
    setError(null);
    
    debugLog('🚀 Starting cafe fetch from Supabase only', { userCampus, center });

    try {
      // Fetch cafes from Supabase database only
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

      debugLog('✅ Final cafe results:', {
        supabaseCafes: cafesWithRatings.length,
        total: cafesWithRatings.length
      });

      setCafes(cafesWithRatings);
      
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
  }, [user, toast]);

  // Google Places API test disabled
  const testGooglePlacesAPI = useCallback(async (center) => {
    debugLog('🧪 Google Places API test disabled');
    return false;
  }, []);

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
  }, [fetchCafes, user, mapCenter]);

  const retryFetch = useCallback(() => {
    const userCampus = user?.user_metadata?.college;
    fetchCafes(userCampus, mapCenter);
  }, [fetchCafes, user, mapCenter]);

  return {
    cafes,
    loading,
    error,
    fetchCafes,
    retryFetch,
    testGooglePlacesAPI,
    setMapCenter
  };
};