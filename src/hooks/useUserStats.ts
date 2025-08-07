import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  reviews_count: number;
  places_visited: number;
  photos_count: number;
  current_streak: number;
  longest_streak: number;
  rank_position: number | null;
  average_rating: number;
}

export interface RecentReview {
  id: string;
  rating: number;
  blurb: string | null;
  created_at: string;
  cafe: {
    name: string;
    campus: string | null;
  };
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserStats = async () => {
    if (!user) {
      console.log('📊 [USER STATS] No user available, skipping stats fetch');
      setLoading(false);
      return;
    }

    try {
      console.log(`📊 [USER STATS] Fetching stats for user: ${user.id}`);
      
      // Fetch user stats
      const { data: userStatsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('❌ [USER STATS] Error fetching user stats:', statsError);
        throw statsError;
      }

      // Calculate average rating from reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', user.id);

      if (reviewsError) {
        console.error('❌ [USER STATS] Error fetching reviews for average:', reviewsError);
        throw reviewsError;
      }

      const averageRating = reviewsData && reviewsData.length > 0
        ? reviewsData.reduce((sum, review) => sum + Number(review.rating), 0) / reviewsData.length
        : 0;

      const statsToReturn: UserStats = {
        reviews_count: userStatsData?.reviews_count || 0,
        places_visited: userStatsData?.places_visited || 0,
        photos_count: userStatsData?.photos_count || 0,
        current_streak: userStatsData?.current_streak || 0,
        longest_streak: userStatsData?.longest_streak || 0,
        rank_position: userStatsData?.rank_position || null,
        average_rating: averageRating
      };

      console.log('✅ [USER STATS] User stats loaded:', statsToReturn);
      setStats(statsToReturn);

    } catch (err) {
      console.error('❌ [USER STATS] Error fetching user stats:', err);
      toast({
        title: "Error loading user stats",
        description: "Failed to load your statistics. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchRecentReviews = async () => {
    if (!user) {
      console.log('📊 [RECENT REVIEWS] No user available, skipping recent reviews fetch');
      return;
    }

    try {
      console.log(`📊 [RECENT REVIEWS] Fetching recent reviews for user: ${user.id}`);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          blurb,
          created_at,
          cafes!reviews_cafe_id_fkey (
            name,
            campus
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('❌ [RECENT REVIEWS] Error fetching recent reviews:', error);
        throw error;
      }

      const formattedReviews: RecentReview[] = (data || []).map(review => ({
        id: review.id,
        rating: Number(review.rating),
        blurb: review.blurb,
        created_at: review.created_at,
        cafe: {
          name: review.cafes?.name || 'Unknown Cafe',
          campus: review.cafes?.campus || 'Unknown Campus'
        }
      }));

      console.log(`✅ [RECENT REVIEWS] Loaded ${formattedReviews.length} recent reviews`);
      setRecentReviews(formattedReviews);

    } catch (err) {
      console.error('❌ [RECENT REVIEWS] Error fetching recent reviews:', err);
      toast({
        title: "Error loading recent reviews",
        description: "Failed to load your recent reviews.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserStats(),
        fetchRecentReviews()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    stats,
    recentReviews,
    loading,
    refreshStats: fetchUserStats,
    refreshRecentReviews: fetchRecentReviews
  };
};