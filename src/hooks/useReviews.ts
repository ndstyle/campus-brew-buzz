import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReviewSubmission {
  cafeId: string;
  cafeName: string;
  rating: number;
  notes: string;
  photoUrl?: string;
  categories?: string[];
}

export const useReviews = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitReview = useCallback(async (reviewData: ReviewSubmission) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      // First, check if cafe exists, if not create it
      const { data: existingCafe } = await supabase
        .from('cafes')
        .select('id')
        .eq('id', reviewData.cafeId)
        .single();

      if (!existingCafe) {
        // Create cafe if it doesn't exist
        const { error: cafeError } = await supabase
          .from('cafes')
          .insert({
            id: reviewData.cafeId,
            name: reviewData.cafeName,
            // Add default values for required fields
            google_place_id: reviewData.cafeId
          });

        if (cafeError) {
          throw cafeError;
        }
      }

      // Submit the review
      const { data: reviewResult, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          cafe_id: reviewData.cafeId,
          rating: reviewData.rating,
          blurb: reviewData.notes,
          photo_url: reviewData.photoUrl
        })
        .select()
        .single();

      if (reviewError) {
        throw reviewError;
      }

      // Update user stats
      const { error: statsError } = await supabase.rpc('increment_user_stats', {
        user_id: user.id
      });

      if (statsError) {
        console.warn('Failed to update user stats:', statsError);
        // Don't fail the entire operation for stats update failure
      }

      toast({
        title: "Review Submitted!",
        description: "Your review has been successfully posted.",
      });

      return reviewResult;
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast]);

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          cafes (
            name,
            address,
            campus
          ),
          users (
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error Loading Reviews",
        description: "Failed to load reviews. Please refresh the page.",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  return {
    submitReview,
    fetchReviews,
    isSubmitting
  };
};