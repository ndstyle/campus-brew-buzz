import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMapData = () => {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCafes = useCallback(async (userCampus = null) => {
    setLoading(true);
    setError(null);

    try {
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
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Calculate average ratings for each cafe
      const cafesWithRatings = (data || []).map(cafe => {
        const reviews = cafe.reviews || [];
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        return {
          ...cafe,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: reviews.length,
          hasUserReview: user ? reviews.some(review => review.user_id === user.id) : false
        };
      });

      setCafes(cafesWithRatings);
    } catch (err) {
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
          fetchCafes(userCampus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCafes, user]);

  const retryFetch = useCallback(() => {
    const userCampus = user?.user_metadata?.college;
    fetchCafes(userCampus);
  }, [fetchCafes, user]);

  return {
    cafes,
    loading,
    error,
    fetchCafes,
    retryFetch
  };
};