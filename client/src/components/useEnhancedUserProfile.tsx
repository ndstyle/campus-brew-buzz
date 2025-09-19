import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";

export interface FollowStats {
  is_following: boolean;
  followers_count: number;
  following_count: number;
}

export const useEnhancedUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async (targetUserId?: string) => {
    setLoading(true);

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const profileUserId = targetUserId || userId || currentUser.id;
      const isOwnProfile = profileUserId === currentUser.id;
      setIsCurrentUser(isOwnProfile);

      console.log(
        "👤 [ENHANCED PROFILE] Fetching profile for user:",
        profileUserId,
      );

      // Fetch enhanced user data including bio and profile picture
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          `
          id,
          username,
          first_name,
          last_name,
          email,
          college,
          bio,
          profile_picture
        `,
        )
        .eq("id", profileUserId)
        .single();

      if (userError) {
        console.error(
          "❌ [ENHANCED PROFILE] Error fetching user data:",
          userError,
        );
        throw userError;
      }

      // Calculate user stats from reviews
      const { data: userReviews, error: reviewsStatsError } = await supabase
        .from("reviews")
        .select("id, cafe_id")
        .eq("user_id", profileUserId);

      const review_count = userReviews?.length || 0;
      const unique_cafes_count = userReviews
        ? new Set(userReviews.map((r) => r.cafe_id)).size
        : 0;

      // Fetch recent reviews with cafe info
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          blurb,
          created_at,
          cafes!inner(
            id,
            name,
            address
          )
        `,
        )
        .eq("user_id", profileUserId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (reviewsError) {
        console.error(
          "❌ [ENHANCED PROFILE] Error fetching reviews:",
          reviewsError,
        );
      }

      // Fetch follow stats
      let followersCount = 0;
      let followingCount = 0;
      let isFollowing = false;

      const { count: followersCountResult } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followee_id", profileUserId);

      const { count: followingCountResult } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileUserId);

      followersCount = followersCountResult || 0;
      followingCount = followingCountResult || 0;

      if (!isOwnProfile) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("followee_id", profileUserId)
          .single();

        isFollowing = !!followData;
      }

      const profileData: UserProfile = {
        id: userData.id,
        username: userData.username || "",
        fullName:
          userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData.username || "",
        email: userData.email || "",
        bio: userData.bio || undefined,
        profilePicture: userData.profile_picture || undefined,
        first_name: userData.first_name || undefined,
        last_name: userData.last_name || undefined,
        college: userData.college || undefined,
        review_count,
        unique_cafes_count,
        followers_count: followersCount,
        following_count: followingCount,
        recent_reviews:
          reviewsData?.map((review) => ({
            id: review.id,
            rating: review.rating || 0,
            blurb: review.blurb || undefined,
            created_at: review.created_at || new Date().toISOString(),
            cafe: {
              id: review.cafes.id,
              name: review.cafes.name,
              address: review.cafes.address || undefined,
            },
          })) || [],
      };

      setProfile(profileData);
      setFollowStats({
        is_following: isFollowing,
        followers_count: followersCount,
        following_count: followingCount,
      });

      console.log(
        "👤 [ENHANCED PROFILE] Enhanced profile data loaded:",
        profileData,
      );
    } catch (error) {
      console.error("❌ [ENHANCED PROFILE] Error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!profile || !followStats || isCurrentUser) return;

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) return;

      if (followStats.is_following) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("followee_id", profile.id);

        if (error) throw error;

        setFollowStats((prev) =>
          prev
            ? {
                ...prev,
                is_following: false,
                followers_count: prev.followers_count - 1,
              }
            : null,
        );

        toast({
          title: "Success",
          description: `Unfollowed ${profile.username}`,
        });
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: currentUser.id,
          followee_id: profile.id,
        });

        if (error) throw error;

        setFollowStats((prev) =>
          prev
            ? {
                ...prev,
                is_following: true,
                followers_count: prev.followers_count + 1,
              }
            : null,
        );

        toast({
          title: "Success",
          description: `Now following ${profile.username}`,
        });
      }
    } catch (error: any) {
      console.error("❌ [ENHANCED PROFILE] Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
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
    refetch: fetchProfile,
  };
};
