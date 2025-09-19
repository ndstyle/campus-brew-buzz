import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  college?: string;
  bio?: string;
  profile_picture?: string;
  review_count: number;
  unique_cafes_count: number;
  followers_count: number;
  following_count: number;
  recent_reviews: {
    id: string;
    rating: number;
    blurb?: string;
    created_at: string;
    cafe: {
      id: string;
      name: string;
      address?: string;
    };
  }[];
}

export interface FollowStats {
  is_following: boolean;
  followers_count: number;
  following_count: number;
}

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const fetchProfile = async (targetUserId?: string) => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Determine which user profile to fetch
      const profileUserId = targetUserId || userId || currentUser.id;
      const isOwnProfile = profileUserId === currentUser.id;
      setIsCurrentUser(isOwnProfile);

      console.log('👤 [PROFILE] Fetching profile for user:', profileUserId);

      // Fetch user basic info and stats
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          username,
          first_name,
          last_name,
          college,
          bio,
          profile_picture
        `)
        .eq('id', profileUserId)
        .single();

      if (userError) {
        console.error('❌ [PROFILE] Error fetching user data:', userError);
        throw userError;
      }

      // Calculate user stats from reviews since user_stats table may not exist
      const { data: userReviews, error: reviewsStatsError } = await supabase
        .from('reviews')
        .select('id, cafe_id')
        .eq('user_id', profileUserId);

      // Calculate stats from reviews
      const review_count = userReviews?.length || 0;
      const unique_cafes_count = userReviews ? new Set(userReviews.map(r => r.cafe_id)).size : 0;
      const stats = { review_count, unique_cafes_count };

      // Fetch recent reviews with cafe info
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          blurb,
          created_at,
          cafes!inner(
            id,
            name,
            address
          )
        `)
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) {
        console.error('❌ [PROFILE] Error fetching reviews:', reviewsError);
        // Don't throw here, just use empty array
      }

      // Fetch follow stats
      let followersCount = 0;
      let followingCount = 0;
      let isFollowing = false;

      // Get followers count
      const { count: followersCountResult } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileUserId);

      // Get following count
      const { count: followingCountResult } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileUserId);

      followersCount = followersCountResult || 0;
      followingCount = followingCountResult || 0;

      // Check if current user follows this profile (only if viewing someone else)
      if (!isOwnProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileUserId)
          .single();

        isFollowing = !!followData;
      }

      const profileData: UserProfile = {
        id: userData.id,
        username: userData.username || '',
        first_name: userData.first_name || undefined,
        last_name: userData.last_name || undefined,
        college: userData.college || undefined,
        bio: userData.bio || undefined,
        profile_picture: userData.profile_picture || undefined,
        review_count: stats.review_count,
        unique_cafes_count: stats.unique_cafes_count,
        followers_count: followersCount,
        following_count: followingCount,
        recent_reviews: reviewsData?.map(review => ({
          id: review.id,
          rating: review.rating || 0,
          blurb: review.blurb || undefined,
          created_at: review.created_at || new Date().toISOString(),
          cafe: {
            id: review.cafes.id,
            name: review.cafes.name,
            address: review.cafes.address || undefined
          }
        })) || []
      };

      setProfile(profileData);
      setFollowStats({
        is_following: isFollowing,
        followers_count: followersCount,
        following_count: followingCount
      });

      console.log('👤 [PROFILE] Profile data loaded:', profileData);

    } catch (error) {
      console.error('❌ [PROFILE] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!profile || !followStats || isCurrentUser) return;

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      if (followStats.is_following) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);

        if (error) throw error;

        setFollowStats(prev => prev ? {
          ...prev,
          is_following: false,
          followers_count: prev.followers_count - 1
        } : null);

        console.log('👤 [PROFILE] Unfollowed user:', profile.username);

      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });

        if (error) throw error;

        setFollowStats(prev => prev ? {
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1
        } : null);

        console.log('👤 [PROFILE] Followed user:', profile.username);
      }

    } catch (error) {
      console.error('❌ [PROFILE] Error toggling follow:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    followStats,
    loading,
    isCurrentUser,
    toggleFollow,
    refetch: fetchProfile
  };
};