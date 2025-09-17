import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, UserPlus, UserMinus, Coffee, Calendar, Star, MapPin, Edit, Settings } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import { ProfileEdit } from "@/components/ProfileEdit";
import { UserPreferences } from "@/components/UserPreferences";

interface ProfilePageProps {
  userId?: string; // If provided, show another user's profile; otherwise show current user
  onCafeClick?: (cafeId: string) => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfilePage = ({ userId, onCafeClick, onFollowersClick, onFollowingClick }: ProfilePageProps) => {
  const { profile, followStats, loading, isCurrentUser, toggleFollow } = useUserProfile(userId);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getDisplayName = () => {
    if (!profile) return "";
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile.first_name) {
      return profile.first_name;
    } else {
      return profile.username;
    }
  };

  const getAvatarInitials = () => {
    if (!profile) return "U";
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    } else if (profile.first_name) {
      return profile.first_name[0].toUpperCase();
    } else {
      return profile.username[0].toUpperCase();
    }
  };

  const generateSummary = () => {
    if (!profile) return "";
    
    const cafesText = profile.unique_cafes_count === 1 ? "coffee shop" : "coffee & boba shops";
    const reviewsText = profile.review_count === 1 ? "review" : "reviews";
    
    return `Visited ${profile.unique_cafes_count} ${cafesText} with ${profile.review_count} ${reviewsText}.`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-6 space-y-6">
          {/* Loading Header */}
          <div className="text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>

          {/* Loading Stats */}
          <div className="flex justify-center space-x-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Loading Activity */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">Profile not found</h3>
          <p className="text-sm text-muted-foreground">
            This user might not exist or there was an error loading their profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Profile Header */}
      <div className="p-6 space-y-6">
        {/* Top Action Buttons - Only show for current user */}
        {isCurrentUser && (
          <div className="flex justify-end space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileEditOpen(true)}
              data-testid="button-edit-profile"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              data-testid="button-settings"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        )}
        {/* Avatar and Basic Info */}
        <div className="text-center space-y-4">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
              {getAvatarInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{getDisplayName()}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.college && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.college}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center space-x-8">
          <button 
            className="text-center space-y-1 hover:bg-muted/50 rounded-lg p-2 transition-colors"
            onClick={onFollowersClick}
          >
            <div className="text-xl font-bold">{followStats?.followers_count || 0}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </button>
          
          <button 
            className="text-center space-y-1 hover:bg-muted/50 rounded-lg p-2 transition-colors"
            onClick={onFollowingClick}
          >
            <div className="text-xl font-bold">{followStats?.following_count || 0}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </button>
          
          <div className="text-center space-y-1">
            <div className="text-xl font-bold">{profile.unique_cafes_count}</div>
            <div className="text-sm text-muted-foreground">Shops Visited</div>
          </div>
        </div>

        {/* Follow Button (if viewing another user) */}
        {!isCurrentUser && followStats && (
          <div className="flex justify-center">
            <Button 
              onClick={toggleFollow}
              variant={followStats.is_following ? "outline" : "default"}
              className="px-8"
            >
              {followStats.is_following ? (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          </div>
        )}

        {/* Summary Section */}
        <div className="text-center">
          <p className="text-muted-foreground">
            {generateSummary()}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          
          {profile.recent_reviews.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                {isCurrentUser ? "Start exploring coffee shops and write your first review!" : "This user hasn't written any reviews yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.recent_reviews.map((review) => (
                <Card 
                  key={review.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onCafeClick?.(review.cafe.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Cafe Icon */}
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Coffee className="h-5 w-5 text-primary" />
                      </div>
                      
                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{review.cafe.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        {review.cafe.address && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {review.cafe.address}
                          </p>
                        )}
                        
                        {review.blurb && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {review.blurb}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileEdit onSuccess={() => setIsProfileEditOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <UserPreferences onSuccess={() => setIsSettingsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;