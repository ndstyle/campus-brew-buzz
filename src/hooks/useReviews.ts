import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReviewSubmission {
  cafeId?: string; // UUID for database
  cafeName: string;
  rating: number;
  notes: string;
  photoUrl?: string;
  categories?: string[];
  googlePlaceId?: string; // Google Places ID for Maps integration
  cafeDetails?: {
    name: string;
    address?: string;
    campus?: string;
    google_place_id?: string;
    lat?: number;
    lng?: number;
  };
}

export const useReviews = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitReview = useCallback(async (reviewData: ReviewSubmission) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a review.",
        variant: "destructive"
      });
      return false;
    }

    console.log('📝 [SUBMIT REVIEW] Starting review submission:', reviewData);
    console.log('📝 [SUBMIT REVIEW] Rating value and type:', reviewData.rating, typeof reviewData.rating);
    setIsSubmitting(true);

    try {
      let cafeId = reviewData.cafeId;

      // Create cafe if it doesn't exist
      if (!cafeId && reviewData.cafeDetails) {
        console.log('🏪 [SUBMIT REVIEW] Creating new cafe:', reviewData.cafeDetails);
        
        const { data: newCafe, error: cafeError } = await supabase
          .from('cafes')
          .insert({
            name: reviewData.cafeDetails.name,
            address: reviewData.cafeDetails.address,
            campus: reviewData.cafeDetails.campus,
            google_place_id: reviewData.cafeDetails.google_place_id,
            lat: reviewData.cafeDetails.lat,
            lng: reviewData.cafeDetails.lng
          })
          .select()
          .single();

        if (cafeError) {
          console.error('❌ [SUBMIT REVIEW] Error creating cafe:', cafeError);
          throw cafeError;
        }

        cafeId = newCafe.id;
        console.log('✅ [SUBMIT REVIEW] New cafe created with ID:', cafeId);
      }

      if (!cafeId) {
        throw new Error('No cafe ID available for review submission');
      }

      // Submit the review with decimal rating (NO Math.round()!)
      const decimalRating = Number(reviewData.rating);
      console.log('📝 [SUBMIT REVIEW] Submitting decimal rating:', decimalRating, 'formatted:', decimalRating.toFixed(1));
      
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          cafe_id: cafeId,
          user_id: user.id,
          rating: decimalRating, // Store as decimal in NUMERIC(3,1) column
          blurb: reviewData.notes,
          photo_url: reviewData.photoUrl
        })
        .select()
        .single();

      if (reviewError) {
        console.error('❌ [SUBMIT REVIEW] Error submitting review:', reviewError);
        throw reviewError;
      }

      console.log('✅ [SUBMIT REVIEW] Review submitted successfully with decimal rating:', review);

      // Update user stats
      const { error: statsError } = await supabase.rpc('increment_user_stats', {
        user_id: user.id
      });

      if (statsError) {
        console.error('⚠️ [SUBMIT REVIEW] Warning: Error updating user stats:', statsError);
        // Don't throw here, review was successful
      }

      toast({
        title: "Review submitted!",
        description: `Your ${decimalRating.toFixed(1)}-star review has been posted successfully.`
      });

      return review;
    } catch (error: any) {
      console.error('❌ [SUBMIT REVIEW] Error submitting review:', error);
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast]);

  const fetchReviews = useCallback(async (scope: 'all' | 'friends' = 'all') => {
    try {
      console.log('[FEED] Fetching reviews with scope:', scope);
      let base = supabase
        .from('reviews')
        .select(`
          *,
          cafes (
            name,
            address,
            campus
          ),
          users (
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (scope === 'friends' && user) {
        const { data: follows, error: fErr } = await supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', user.id);
        if (fErr) throw fErr;
        const ids = (follows || []).map((f: any) => f.followee_id);
        if (ids.length === 0) return [];
        base = base.in('user_id', ids);
      }

      const { data, error } = await base;
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('[FEED] Error fetching reviews:', error);
      toast({
        title: 'Error Loading Reviews',
        description: error.message || 'Failed to load reviews. Please refresh the page.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast, user]);

  return {
    submitReview,
    fetchReviews,
    isSubmitting
  };
};