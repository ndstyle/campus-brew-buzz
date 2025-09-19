import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, UserMinus, Coffee, Calendar, Star, MapPin, Edit, Settings, Camera, Save } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import { ProfileEdit } from "@/components/ProfileEdit";
import { UserPreferences } from "@/components/UserPreferences";
import { FollowersModal } from "@/components/FollowersModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProfile as UserProfileType } from "@/types";

interface EnhancedProfilePageProps {
  userId?: string;
  onCafeClick?: (cafeId: string) => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const EnhancedProfilePage = ({ userId, onCafeClick, onFollowersClick, onFollowingClick }: EnhancedProfilePageProps) => {
  const { profile, followStats, loading, isCurrentUser, toggleFollow } = useUserProfile(userId);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const [isBioEditOpen, setIsBioEditOpen] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.bio) {
      setBioText(profile.bio);
    }
  }, [profile?.bio]);

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

  const handleBioUpdate = async () => {
    if (!user?.id) return;

    setIsUpdatingBio(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ bio: bioText.trim() || null })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bio updated successfully",
      });

      setIsBioEditOpen(false);
    } catch (error: any) {
      console.error('Error updating bio:', error);
      toast({
        title: "Error",
        description: "Failed to update bio",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBio(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Profile picture must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast({
        title: "Error",
        description: "Profile picture must be JPG or PNG format",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(data.path);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

      // Refresh the page to show new picture
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="flex justify-center space-x-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
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

        {/* Enhanced Avatar and Basic Info */}
        <div className="text-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 mx-auto">
              {profile.profilePicture ? (
                <AvatarImage src={profile.profilePicture} alt="Profile picture" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                  {getAvatarInitials()}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Profile Picture Upload Button - Only for current user */}
            {isCurrentUser && (
              <div className="absolute -bottom-2 -right-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  id="profile-picture-upload"
                  disabled={isUploadingPhoto}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => document.getElementById('profile-picture-upload')?.click()}
                  disabled={isUploadingPhoto}
                  data-testid="button-upload-profile-picture"
                >
                  {isUploadingPhoto ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

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

          {/* Enhanced Bio Section */}
          <div className="space-y-2">
            {profile.bio || isCurrentUser ? (
              <div className="max-w-sm mx-auto">
                <p className="text-sm text-muted-foreground">
                  {profile.bio || (isCurrentUser ? "Add a bio to tell others about yourself!" : "No bio available.")}
                </p>
                {isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBioEditOpen(true)}
                    className="mt-2 text-primary"
                    data-testid="button-edit-bio"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {profile.bio ? "Edit bio" : "Add bio"}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center space-x-8">
          <button 
            className="text-center space-y-1 hover:bg-muted/50 rounded-lg p-2 transition-colors"
            onClick={() => {
              setFollowersModalTab('followers');
              setIsFollowersModalOpen(true);
              onFollowersClick?.();
            }}
            data-testid="button-followers"
          >
            <div className="text-xl font-bold">{followStats?.followers_count || 0}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </button>

          <button 
            className="text-center space-y-1 hover:bg-muted/50 rounded-lg p-2 transition-colors"
            onClick={() => {
              setFollowersModalTab('following');
              setIsFollowersModalOpen(true);
              onFollowingClick?.();
            }}
            data-testid="button-following"
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
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Coffee className="h-5 w-5 text-primary" />
                      </div>

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

      {/* Bio Edit Dialog */}
      <Dialog open={isBioEditOpen} onOpenChange={setIsBioEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Tell others about yourself, your coffee preferences, or anything you'd like to share..."
              className="min-h-24 resize-none"
              maxLength={200}
              data-testid="textarea-bio"
            />
            <div className="text-xs text-muted-foreground text-right">
              {bioText.length}/200 characters
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBioEditOpen(false)}
                disabled={isUpdatingBio}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBioUpdate}
                disabled={isUpdatingBio}
                className="flex-1"
                data-testid="button-save-bio"
              >
                {isUpdatingBio ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Bio
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Followers Modal */}
      {profile && (
        <FollowersModal
          isOpen={isFollowersModalOpen}
          onClose={() => setIsFollowersModalOpen(false)}
          userId={profile.id}
          initialTab={followersModalTab}
        />
      )}
    </div>
  );
};

export default EnhancedProfilePage;