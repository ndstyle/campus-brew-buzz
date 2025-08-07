import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReviewSubmission {
  cafeId: string; // UUID for database
  cafeName: string;
  rating: number;
  notes: string;
  photoUrl?: string;
  categories?: string[];
  googlePlaceId?: string; // Google Places ID for Maps integration
}

export const useReviews = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitReview = useCallback(async (reviewData: ReviewSubmission) => {
    console.log("=== REVIEW SUBMISSION PAYLOAD ===");
    console.log("user_id:", user?.id);
    console.log("user_id type:", typeof user?.id);
    console.log("cafeId being sent:", reviewData.cafeId);
    console.log("cafeId type:", typeof reviewData.cafeId);
    console.log("Full reviewData:", reviewData);
    
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
        .maybeSingle();

      if (!existingCafe) {
        console.log("🆕 Creating new cafe with data:");
        console.log("id (UUID):", reviewData.cafeId);
        console.log("name:", reviewData.cafeName);
        console.log("google_place_id:", reviewData.googlePlaceId || reviewData.cafeId);
        
        // Create cafe if it doesn't exist
        const { error: cafeError } = await supabase
          .from('cafes')
          .insert({
            id: reviewData.cafeId,
            name: reviewData.cafeName,
            google_place_id: reviewData.googlePlaceId || reviewData.cafeId, // Use separate Google Places ID
            campus: reviewData.cafeName.includes('custom-') ? 'Unknown' : undefined // Handle custom cafes
          });

        if (cafeError) {
          console.error("❌ Cafe creation error:", cafeError);
          throw cafeError;
        }
        console.log("✅ Cafe created successfully");
      }

      // Submit the review
      console.log("📝 Submitting review with data:");
      console.log("user_id:", user.id);
      console.log("cafe_id:", reviewData.cafeId);
      console.log("rating:", reviewData.rating);
      console.log("blurb:", reviewData.notes);
      
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
        console.error("❌ Review submission error:", reviewError);
        throw reviewError;
      }
      console.log("✅ Review submitted successfully:", reviewResult);

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