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
  geoapifyPlaceId?: string; // GEOAPIFY Place ID for Maps integration
  cafeDetails?: {
    name: string;
    address?: string;
    campus?: string;
    geoapify_place_id?: string;
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

      // Handle cafe creation/retrieval with SELECT-then-INSERT pattern
      // Check if cafeId is empty, null, undefined, or starts with 'custom-'
      if ((!cafeId || cafeId.startsWith('custom-')) && reviewData.cafeDetails) {
        console.log('🏪 [SUBMIT REVIEW] Processing cafe (create or get existing):', reviewData.cafeDetails);
        
        // Allow cafe creation without geoapify_place_id for manual entries
        console.log('🏪 [SUBMIT REVIEW] Creating cafe with manual entry (no GEOAPIFY Place ID required)');

        // First, try to find existing cafe by geoapify_place_id if available
        if (reviewData.cafeDetails.geoapify_place_id) {
          console.log('🔍 [SUBMIT REVIEW] Searching for existing cafe with geoapify_place_id:', reviewData.cafeDetails.geoapify_place_id);
        
          const { data: existingCafe, error: findError } = await supabase
            .from('cafes')
            .select('id')
            .eq('geoapify_place_id', reviewData.cafeDetails.geoapify_place_id)
            .single();

          if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('❌ [SUBMIT REVIEW] Error searching for existing cafe:', findError);
            throw findError;
          }

          if (existingCafe) {
            // Cafe already exists, use existing ID
            cafeId = existingCafe.id;
            console.log('✅ [SUBMIT REVIEW] Found existing cafe with ID:', cafeId);
          } else {
            console.log('🏪 [SUBMIT REVIEW] No existing cafe found, will create new one');
          }
        } else {
          console.log('🏪 [SUBMIT REVIEW] No GEOAPIFY Place ID provided, will create new cafe without it');
        }

        if (!cafeId) {
          // Cafe doesn't exist, create new one with INSERT
          console.log('🏪 [SUBMIT REVIEW] Creating new cafe...');
          
          const { data: newCafe, error: cafeError } = await supabase
            .from('cafes')
            .insert([{
              name: reviewData.cafeDetails.name,
              address: reviewData.cafeDetails.address || null,
              campus: reviewData.cafeDetails.campus || null,
              geoapify_place_id: reviewData.cafeDetails.geoapify_place_id || null,
              lat: reviewData.cafeDetails.lat || null,
              lng: reviewData.cafeDetails.lng || null
            }])
            .select('id')
            .single();

          if (cafeError) {
            console.error('❌ [SUBMIT REVIEW] Error creating new cafe:', cafeError);
            
            // If it's a duplicate key error, try to find the existing cafe again
            if (cafeError.code === '23505' && reviewData.cafeDetails.geoapify_place_id) { // PostgreSQL unique constraint violation
              console.log('🔄 [SUBMIT REVIEW] Duplicate key detected, trying to find existing cafe again...');
              
              const { data: retryExistingCafe, error: retryError } = await supabase
                .from('cafes')
                .select('id')
                .eq('geoapify_place_id', reviewData.cafeDetails.geoapify_place_id!)
                .single();
              
              if (retryError) {
                console.error('❌ [SUBMIT REVIEW] Error finding cafe on retry:', retryError);
                throw retryError;
              }
              
              cafeId = retryExistingCafe.id;
              console.log('✅ [SUBMIT REVIEW] Found existing cafe on retry with ID:', cafeId);
            } else {
              throw cafeError;
            }
          } else {
            cafeId = newCafe.id;
            console.log('✅ [SUBMIT REVIEW] New cafe created with ID:', cafeId);
          }
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

      // Skip checking for existing review if this is a UUID validation error candidate
      if (cafeId.startsWith('custom-')) {
        throw new Error('Invalid cafe ID format - cafe creation may have failed');
      }

      // Submit the review with upsert (replaces existing review for same user/cafe)
      const decimalRating = Number(reviewData.rating);
      console.log('📝 [SUBMIT REVIEW] Submitting decimal rating:', decimalRating, 'formatted:', decimalRating.toFixed(1));
      
      // Check if user already has a review for this cafe
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('cafe_id', cafeId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ [SUBMIT REVIEW] Error checking for existing review:', checkError);
        throw checkError;
      }

      let review;
      if (existingReview) {
        // Update existing review
        console.log('📝 [SUBMIT REVIEW] Updating existing review with ID:', existingReview.id);
        const { data: updatedReview, error: updateError } = await supabase
          .from('reviews')
          .update({
            rating: decimalRating,
            blurb: reviewData.notes,
            photo_url: reviewData.photoUrl
          })
          .eq('id', existingReview.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ [SUBMIT REVIEW] Error updating review:', updateError);
          throw updateError;
        }
        review = updatedReview;
      } else {
        // Create new review
        console.log('📝 [SUBMIT REVIEW] Creating new review');
        const { data: newReview, error: insertError } = await supabase
          .from('reviews')
          .insert([{
            cafe_id: cafeId,
            user_id: user.id,
            rating: decimalRating,
            blurb: reviewData.notes,
            photo_url: reviewData.photoUrl
          }])
          .select()
          .single();

        if (insertError) {
          console.error('❌ [SUBMIT REVIEW] Error creating review:', insertError);
          throw insertError;
        }
        review = newReview;
      }

      if (!review) {
        throw new Error('Failed to create or update review');
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