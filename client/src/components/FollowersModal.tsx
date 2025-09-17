import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { useFollowUser } from '@/hooks/useFollowUser';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  college: string | null;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: 'followers' | 'following';
}

export const FollowersModal = ({ isOpen, onClose, userId, initialTab = 'followers' }: FollowersModalProps) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { followUser, unfollowUser, isLoading: followLoading } = useFollowUser();
  const { user: currentUser } = useAuth();

  const getDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else {
      return user.username;
    }
  };

  const getInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user.first_name) {
      return user.first_name[0].toUpperCase();
    } else {
      return user.username[0].toUpperCase();
    }
  };

  const fetchFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          users!follows_follower_id_fkey(
            id,
            username,
            first_name,
            last_name,
            college
          )
        `)
        .eq('followee_id', userId);

      if (error) throw error;

      const followerUsers = data
        ?.map((follow: any) => follow.users)
        .filter((user: any) => user !== null) || [];
      
      setFollowers(followerUsers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          followee_id,
          users!follows_followee_id_fkey(
            id,
            username,
            first_name,
            last_name,
            college
          )
        `)
        .eq('follower_id', userId);

      if (error) throw error;

      const followingUsers = data
        ?.map((follow: any) => follow.users)
        .filter((user: any) => user !== null) || [];
      
      setFollowing(followingUsers);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchCurrentUserFollowingStatus = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Get all users that the current user is following
      const { data, error } = await supabase
        .from('follows')
        .select('followee_id')
        .eq('follower_id', currentUser.id);

      if (error) throw error;

      const followingIds = data?.map(f => f.followee_id) || [];
      const status: Record<string, boolean> = {};
      
      // Set following status for all users in both lists
      [...followers, ...following].forEach(user => {
        status[user.id] = followingIds.includes(user.id);
      });
      
      setFollowingStatus(status);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const handleToggleFollow = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUser?.id || targetUserId === currentUser.id) return;

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId);
      }
      
      // Update local state
      setFollowingStatus(prev => ({
        ...prev,
        [targetUserId]: !isCurrentlyFollowing
      }));

      // Refresh data if viewing current user's follows
      if (userId === currentUser.id) {
        await fetchFollowing();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      Promise.all([
        fetchFollowers(),
        fetchFollowing(),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen && currentUser?.id && (followers.length > 0 || following.length > 0)) {
      fetchCurrentUserFollowingStatus();
    }
  }, [isOpen, currentUser?.id, followers.length, following.length]);

  const renderUserList = (users: User[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((user) => {
          const isCurrentlyFollowing = followingStatus[user.id] || false;
          const isCurrentUser = currentUser?.id === user.id;
          
          return (
            <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{getDisplayName(user)}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                {user.college && (
                  <p className="text-xs text-muted-foreground truncate">{user.college}</p>
                )}
              </div>
              
              {!isCurrentUser && currentUser && (
                <Button
                  size="sm"
                  variant={isCurrentlyFollowing ? "outline" : "default"}
                  onClick={() => handleToggleFollow(user.id, isCurrentlyFollowing)}
                  disabled={followLoading}
                  data-testid={`button-${isCurrentlyFollowing ? 'unfollow' : 'follow'}-${user.id}`}
                  className="flex items-center gap-1"
                >
                  {isCurrentlyFollowing ? (
                    <>
                      <UserMinus className="h-3 w-3" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" data-testid="tab-followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" data-testid="tab-following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="overflow-y-auto max-h-[50vh]">
            {renderUserList(followers, "No followers yet")}
          </TabsContent>
          
          <TabsContent value="following" className="overflow-y-auto max-h-[50vh]">
            {renderUserList(following, "Not following anyone yet")}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};