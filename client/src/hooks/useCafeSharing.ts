import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SharedCafe {
  id: string;
  user_id: string;
  cafe_id: string;
  cafe_name: string;
  caption?: string;
  created_at: Date;
  // User info for display
  username?: string;
  user_first_name?: string;
  user_last_name?: string;
}

export const useCafeSharing = () => {
  const [sharedCafes, setSharedCafes] = useState<SharedCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSharedCafes = async () => {
    try {
      // For MVP, use localStorage to store shared cafes
      // In production, this would connect to Supabase tables
      const storedShares = localStorage.getItem('shared_cafes');
      
      if (storedShares) {
        const parsed = JSON.parse(storedShares);
        const sortedShares = parsed
          .map((share: any) => ({
            ...share,
            created_at: share.created_at ? new Date(share.created_at) : new Date()
          }))
          .sort((a: SharedCafe, b: SharedCafe) => b.created_at.getTime() - a.created_at.getTime());
        setSharedCafes(sortedShares);
      } else {
        setSharedCafes([]);
      }
    } catch (error) {
      console.error('Error fetching shared cafes:', error);
      setSharedCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const shareCafe = async (cafeId: string, cafeName: string, caption?: string) => {
    try {
      // For MVP, use mock user data
      // In production, this would get the actual authenticated user
      const currentUser = {
        id: 'current_user',
        username: 'currentuser',
        first_name: 'Current',
        last_name: 'User'
      };

      const newShare: SharedCafe = {
        id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: currentUser.id,
        cafe_id: cafeId,
        cafe_name: cafeName,
        caption: caption?.trim() || '',
        created_at: new Date(),
        username: currentUser.username,
        user_first_name: currentUser.first_name,
        user_last_name: currentUser.last_name,
      };

      const updatedShares = [newShare, ...sharedCafes];
      setSharedCafes(updatedShares);

      // Store in localStorage for MVP
      localStorage.setItem('shared_cafes', JSON.stringify(updatedShares));

      toast({
        title: "Success",
        description: `Shared "${cafeName}" with your network`,
      });
      return true;
    } catch (error) {
      console.error('Error sharing cafe:', error);
      toast({
        title: "Error",
        description: "Failed to share cafe",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSharedCafe = async (shareId: string) => {
    try {
      const updatedShares = sharedCafes.filter(share => share.id !== shareId);
      setSharedCafes(updatedShares);

      // Update localStorage
      localStorage.setItem('shared_cafes', JSON.stringify(updatedShares));

      toast({
        title: "Success",
        description: "Shared cafe removed",
      });
      return true;
    } catch (error) {
      console.error('Error deleting shared cafe:', error);
      toast({
        title: "Error",
        description: "Failed to remove shared cafe",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSharedCafes();
  }, []);

  return {
    sharedCafes,
    loading,
    shareCafe,
    deleteSharedCafe,
    refetch: fetchSharedCafes
  };
};