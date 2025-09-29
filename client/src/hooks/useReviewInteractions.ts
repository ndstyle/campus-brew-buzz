import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReviewStats {
  likesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const useReviewInteractions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewStats, setReviewStats] = useState<Map<string, ReviewStats>>(new Map());
  const [loading, setLoading] = useState(false);

  // Fetch stats for all reviews
  const fetchReviewStats = useCallback(async (reviewIds: string[]) => {
    if (!user || reviewIds.length === 0) return;

    try {
      // Fetch likes (using type assertion for tables not in generated types)
      const { data: likesData, error: likesError } = await (supabase as any)
        .from('review_likes')
        .select('review_id, user_id')
        .in('review_id', reviewIds);

      if (likesError) throw likesError;

      // Fetch bookmarks
      const { data: bookmarksData, error: bookmarksError } = await (supabase as any)
        .from('review_bookmarks')
        .select('review_id, user_id')
        .in('review_id', reviewIds);

      if (bookmarksError) throw bookmarksError;

      // Build stats map
      const statsMap = new Map<string, ReviewStats>();
      reviewIds.forEach(reviewId => {
        const likes = likesData?.filter((l: any) => l.review_id === reviewId) || [];
        const isLiked = likes.some((l: any) => l.user_id === user.id);
        const isBookmarked = bookmarksData?.some((b: any) => b.review_id === reviewId && b.user_id === user.id) || false;

        statsMap.set(reviewId, {
          likesCount: likes.length,
          isLiked,
          isBookmarked
        });
      });

      setReviewStats(statsMap);
    } catch (error: any) {
      console.error('[REVIEW_INTERACTIONS] Error fetching stats:', error);
    }
  }, [user]);

  // Toggle like
  const toggleLike = useCallback(async (reviewId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to like reviews.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const currentStats = reviewStats.get(reviewId);
      const isLiked = currentStats?.isLiked || false;

      if (isLiked) {
        // Unlike
        const { error } = await (supabase as any)
          .from('review_likes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setReviewStats(prev => {
          const newMap = new Map(prev);
          const stats = newMap.get(reviewId);
          if (stats) {
            newMap.set(reviewId, {
              ...stats,
              likesCount: Math.max(0, stats.likesCount - 1),
              isLiked: false
            });
          }
          return newMap;
        });
      } else {
        // Like
        const { error } = await (supabase as any)
          .from('review_likes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });

        if (error) throw error;

        // Update local state
        setReviewStats(prev => {
          const newMap = new Map(prev);
          const stats = newMap.get(reviewId);
          if (stats) {
            newMap.set(reviewId, {
              ...stats,
              likesCount: stats.likesCount + 1,
              isLiked: true
            });
          } else {
            newMap.set(reviewId, {
              likesCount: 1,
              isLiked: true,
              isBookmarked: false
            });
          }
          return newMap;
        });
      }
    } catch (error: any) {
      console.error('[REVIEW_INTERACTIONS] Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to like review. Please try again.',
        variant: 'destructive'
      });
    }
  }, [user, reviewStats, toast]);

  // Toggle bookmark
  const toggleBookmark = useCallback(async (reviewId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to bookmark reviews.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const currentStats = reviewStats.get(reviewId);
      const isBookmarked = currentStats?.isBookmarked || false;

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await (supabase as any)
          .from('review_bookmarks')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setReviewStats(prev => {
          const newMap = new Map(prev);
          const stats = newMap.get(reviewId);
          if (stats) {
            newMap.set(reviewId, {
              ...stats,
              isBookmarked: false
            });
          }
          return newMap;
        });

        toast({
          title: 'Bookmark Removed',
          description: 'Review removed from bookmarks.'
        });
      } else {
        // Add bookmark
        const { error } = await (supabase as any)
          .from('review_bookmarks')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });

        if (error) throw error;

        // Update local state
        setReviewStats(prev => {
          const newMap = new Map(prev);
          const stats = newMap.get(reviewId);
          if (stats) {
            newMap.set(reviewId, {
              ...stats,
              isBookmarked: true
            });
          } else {
            newMap.set(reviewId, {
              likesCount: 0,
              isLiked: false,
              isBookmarked: true
            });
          }
          return newMap;
        });

        toast({
          title: 'Bookmarked',
          description: 'Review saved to bookmarks!'
        });
      }
    } catch (error: any) {
      console.error('[REVIEW_INTERACTIONS] Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to bookmark review. Please try again.',
        variant: 'destructive'
      });
    }
  }, [user, reviewStats, toast]);

  // Get stats for a specific review
  const getReviewStats = useCallback((reviewId: string): ReviewStats => {
    return reviewStats.get(reviewId) || {
      likesCount: 0,
      isLiked: false,
      isBookmarked: false
    };
  }, [reviewStats]);

  return {
    fetchReviewStats,
    toggleLike,
    toggleBookmark,
    getReviewStats,
    loading
  };
};
