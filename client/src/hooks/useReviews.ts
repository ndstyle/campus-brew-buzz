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

    // Rate limiting check: 10 reviews per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    try {
      const { count: recentReviews, error: countError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo);

      if (countError) throw countError;
      
      if ((recentReviews || 0) >= 10) {
        toast({
          title: "Rate limit exceeded (429)",
          description: "You can only submit 10 reviews per hour. Please try again later.",
          variant: "destructive"
        });
        return false;
      }
    } catch (err: any) {
      console.error('❌ [SUBMIT REVIEW] Rate limit check failed:', err);
    }

    console.log('📝 [SUBMIT REVIEW] Starting review submission:', reviewData);
    console.log('📝 [SUBMIT REVIEW] Rating value and type:', reviewData.rating, typeof reviewData.rating);
    setIsSubmitting(true);

    try {
      // Validate rating range
      if (reviewData.rating < 1.0 || reviewData.rating > 10.0) {
        toast({
          title: "Invalid rating",
          description: "Rating must be between 1.0 and 10.0",
          variant: "destructive"
        });
        return false;
      }

      let cafeId = reviewData.cafeId;

      // Handle cafe creation/retrieval with UPSERT to avoid constraint violations
      if (!cafeId && reviewData.cafeDetails) {
        console.log('🏪 [SUBMIT REVIEW] UPSERTING cafe (create or get existing):', reviewData.cafeDetails);
        
        // First try to find existing cafe by google_place_id
        const { data: existingCafe, error: findError } = await supabase
          .from('cafes')
          .select('id')
          .eq('google_place_id', reviewData.cafeDetails.google_place_id)
          .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('❌ [SUBMIT REVIEW] Error finding existing cafe:', findError);
          throw findError;
        }

        if (existingCafe) {
          // Cafe already exists, use existing ID
          cafeId = existingCafe.id;
          console.log('✅ [SUBMIT REVIEW] Found existing cafe with ID:', cafeId);
        } else {
          // Cafe doesn't exist, create new one with INSERT ... ON CONFLICT
          console.log('🏪 [SUBMIT REVIEW] Creating new cafe with UPSERT...');
          
          const { data: upsertedCafe, error: cafeError } = await supabase
            .from('cafes')
            .upsert({
              name: reviewData.cafeDetails.name,
              address: reviewData.cafeDetails.address,
              campus: reviewData.cafeDetails.campus,
              google_place_id: reviewData.cafeDetails.google_place_id,
              lat: reviewData.cafeDetails.lat,
              lng: reviewData.cafeDetails.lng
            }, {
              onConflict: 'google_place_id',
              ignoreDuplicates: false
            })
            .select('id')
            .single();

          if (cafeError) {
            console.error('❌ [SUBMIT REVIEW] Error upserting cafe:', cafeError);
            throw cafeError;
          }

          cafeId = upsertedCafe.id;
          console.log('✅ [SUBMIT REVIEW] Cafe upserted with ID:', cafeId);
        }
      }

      if (!cafeId) {
        console.error('❌ [SUBMIT REVIEW] Missing cafe data:', { 
          cafeId: reviewData.cafeId, 
          hasCafeDetails: !!reviewData.cafeDetails,
          cafeDetails: reviewData.cafeDetails 
        });
        throw new Error('No cafe ID available for review submission - missing cafe data');
      }

      // Submit the review with upsert (replaces existing review for same user/cafe)
      const decimalRating = Number(reviewData.rating);
      console.log('📝 [SUBMIT REVIEW] Submitting decimal rating:', decimalRating, 'formatted:', decimalRating.toFixed(1));
      
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .upsert({
          cafe_id: cafeId,
          user_id: user.id,
          rating: decimalRating, // Store as decimal in NUMERIC(3,1) column
          blurb: reviewData.notes,
          photo_url: reviewData.photoUrl
        }, { 
          onConflict: 'user_id,cafe_id',
          ignoreDuplicates: false 
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