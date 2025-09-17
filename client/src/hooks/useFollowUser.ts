import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFollowUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const followUser = async (userIdToFollow: string) => {
    if (!userIdToFollow) return null;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to follow users',
          variant: 'destructive',
        });
        return null;
      }

      if (user.id === userIdToFollow) {
        toast({
          title: 'Error',
          description: 'You cannot follow yourself',
          variant: 'destructive',
        });
        return null;
      }

      // Use the existing Supabase Edge Function for follow operations
      const { data, error } = await supabase.functions.invoke('follow', {
        body: { 
          action: 'follow', 
          followee_id: userIdToFollow 
        },
      });

      if (error) {
        console.error('Error following user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to follow user',
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'User followed successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow user',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (userIdToUnfollow: string) => {
    if (!userIdToUnfollow) return null;
    
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to unfollow users',
          variant: 'destructive',
        });
        return null;
      }

      // Use the existing Supabase Edge Function for follow operations
      const { data, error } = await supabase.functions.invoke('follow', {
        body: { 
          action: 'unfollow', 
          followee_id: userIdToUnfollow 
        },
      });

      if (error) {
        console.error('Error unfollowing user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to unfollow user',
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'User unfollowed successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unfollow user',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { followUser, unfollowUser, isLoading };
};