import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Like {
  id: string;
  user_id: string;
  shared_cafe_id: string;
  created_at: Date;
}

interface LikeStats {
  count: number;
  isLiked: boolean;
}

export const useLikes = () => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLikes = async () => {
    try {
      setLoading(true);
      // Enhanced localStorage implementation for better persistence
      const storedLikes = localStorage.getItem('cafe_likes');
      
      if (storedLikes) {
        const parsed = JSON.parse(storedLikes);
        setLikes(parsed.map((like: any) => ({
          ...like,
          created_at: like.created_at ? new Date(like.created_at) : new Date()
        })));
      } else {
        setLikes([]);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      setLikes([]);
    } finally {
      setLoading(false);
    }
  };

  const getLikeStats = (sharedCafeId: string): LikeStats => {
    const cafeLikes = likes.filter(like => like.shared_cafe_id === sharedCafeId);
    const currentUserId = user?.id;
    const isLiked = currentUserId ? cafeLikes.some(like => like.user_id === currentUserId) : false;
    
    return {
      count: cafeLikes.length,
      isLiked
    };
  };

  const toggleLike = async (sharedCafeId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be signed in to like posts",
        variant: "destructive",
      });
      return null;
    }

    try {
      const currentUserId = user.id;
      const existingLike = likes.find(
        like => like.shared_cafe_id === sharedCafeId && like.user_id === currentUserId
      );

      let updatedLikes: Like[];

      if (existingLike) {
        // Unlike - remove the like
        updatedLikes = likes.filter(like => like.id !== existingLike.id);
        toast({
          title: "Unliked",
          description: "Removed like from cafe",
        });
      } else {
        // Like - add new like
        const newLike: Like = {
          id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: currentUserId,
          shared_cafe_id: sharedCafeId,
          created_at: new Date(),
        };
        updatedLikes = [...likes, newLike];
        toast({
          title: "Liked",
          description: "Added like to cafe",
        });
      }

      // Update state and persist to localStorage
      setLikes(updatedLikes);
      localStorage.setItem('cafe_likes', JSON.stringify(updatedLikes));
      
      return !existingLike; // Return new like status
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
      return null;
    }
  };

  const getLikedCafes = () => {
    const currentUserId = user?.id;
    if (!currentUserId) return [];
    
    return likes
      .filter(like => like.user_id === currentUserId)
      .map(like => like.shared_cafe_id);
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  return {
    likes,
    loading,
    getLikeStats,
    toggleLike,
    getLikedCafes,
    refetch: fetchLikes
  };
};