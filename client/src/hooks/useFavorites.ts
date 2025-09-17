import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UserFavorite {
  id: string;
  item_name: string;
  item_type: 'coffee' | 'food';
  created_at: Date;
}

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getStorageKey = (targetUserId: string) => `user_favorites_${targetUserId}`;

  const fetchFavorites = async () => {
    try {
      // For MVP, use localStorage to store favorites
      // In production, this would connect to Supabase tables
      const currentUserId = userId || 'current_user'; // Simplified for MVP
      const storageKey = getStorageKey(currentUserId);
      const storedFavorites = localStorage.getItem(storageKey);
      
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        setFavorites(parsed.map((fav: any) => ({
          ...fav,
          created_at: new Date(fav.created_at)
        })));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (itemName: string, itemType: 'coffee' | 'food') => {
    try {
      // Check if user already has 2 favorites (MVP limit)
      if (favorites.length >= 2) {
        toast({
          title: "Limit Reached",
          description: "You can only have up to 2 favorite items",
          variant: "destructive",
        });
        return false;
      }

      // Check if item already exists
      const existingItem = favorites.find(
        fav => fav.item_name.toLowerCase() === itemName.toLowerCase() && fav.item_type === itemType
      );
      
      if (existingItem) {
        toast({
          title: "Already Added",
          description: "This item is already in your favorites",
          variant: "destructive",
        });
        return false;
      }

      const newFavorite: UserFavorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        item_name: itemName,
        item_type: itemType,
        created_at: new Date(),
      };

      const updatedFavorites = [newFavorite, ...favorites];
      setFavorites(updatedFavorites);

      // Store in localStorage for MVP
      const currentUserId = userId || 'current_user';
      const storageKey = getStorageKey(currentUserId);
      localStorage.setItem(storageKey, JSON.stringify(updatedFavorites));

      toast({
        title: "Success",
        description: `Added "${itemName}" to your favorites`,
      });
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Error",
        description: "Failed to add favorite",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
      setFavorites(updatedFavorites);

      // Update localStorage
      const currentUserId = userId || 'current_user';
      const storageKey = getStorageKey(currentUserId);
      localStorage.setItem(storageKey, JSON.stringify(updatedFavorites));

      toast({
        title: "Success",
        description: "Removed from favorites",
      });
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    refetch: fetchFavorites
  };
};