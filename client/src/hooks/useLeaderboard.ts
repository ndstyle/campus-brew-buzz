import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  review_count: number;
  unique_cafes_count: number;
  rank: number;
}

export interface LeaderboardFilters {
  timeRange: 'month' | 'all-time';
  scope: 'global' | 'friends';
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeRange: 'month',
    scope: 'global'
  });

  const fetchLeaderboard = async (newFilters?: Partial<LeaderboardFilters>) => {
    setLoading(true);
    const activeFilters = { ...filters, ...newFilters };
    
    try {
      console.log('📊 [LEADERBOARD] Fetching leaderboard data with filters:', activeFilters);
      
      // Get current user for rank calculation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // For now, let's calculate stats directly from reviews since user_stats may not exist
      // Build query to aggregate review data by user
      let baseQuery;
      
      if (activeFilters.timeRange === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        baseQuery = supabase
          .from('reviews')
          .select(`
            user_id,
            cafe_id,
            users!inner(
              id,
              username,
              first_name,
              last_name,
              college
            )
          `)
          .gte('created_at', oneMonthAgo.toISOString());
      } else {
        baseQuery = supabase
          .from('reviews')
          .select(`
            user_id,
            cafe_id,
            users!inner(
              id,
              username,
              first_name,
              last_name,
              college
            )
          `);
      }

      const { data: leaderboardData, error } = await baseQuery;

      if (error) {
        console.error('❌ [LEADERBOARD] Error fetching leaderboard:', error);
        throw error;
      }

      console.log('📊 [LEADERBOARD] Raw data:', leaderboardData);

      // Process the data into leaderboard format by aggregating reviews
      const userStats = new Map<string, {
        user: any;
        review_count: number;
        unique_cafes: Set<string>;
      }>();

      leaderboardData?.forEach((review: any) => {
        const userId = review.user_id;
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            user: review.users,
            review_count: 0,
            unique_cafes: new Set()
          });
        }
        const stats = userStats.get(userId)!;
        stats.review_count++;
        stats.unique_cafes.add(review.cafe_id);
      });

      const processedData: LeaderboardUser[] = Array.from(userStats.entries()).map(([userId, stats]) => ({
        id: userId,
        username: stats.user.username || '',
        first_name: stats.user.first_name || undefined,
        last_name: stats.user.last_name || undefined,
        review_count: stats.review_count,
        unique_cafes_count: stats.unique_cafes.size,
        rank: 0 // Will be set below
      }));

      // Sort by unique cafes count, then by review count
      processedData.sort((a, b) => {
        if (b.unique_cafes_count !== a.unique_cafes_count) {
          return b.unique_cafes_count - a.unique_cafes_count;
        }
        return b.review_count - a.review_count;
      });

      // Assign ranks
      processedData.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Find current user's rank
      const currentUserData = processedData.find(u => u.id === user.id);
      
      setLeaderboard(processedData);
      setCurrentUserRank(currentUserData || null);
      
      console.log('📊 [LEADERBOARD] Processed leaderboard:', processedData);
      console.log('📊 [LEADERBOARD] Current user rank:', currentUserData);

    } catch (error) {
      console.error('❌ [LEADERBOARD] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<LeaderboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchLeaderboard(updatedFilters);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    currentUserRank,
    loading,
    filters,
    updateFilters,
    refetch: fetchLeaderboard
  };
};