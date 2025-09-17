import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, MapPin, Share2, Trash2, Clock, Heart } from "lucide-react";
import { useCafeSharing } from "@/hooks/useCafeSharing";
import { useLikes } from "@/hooks/useLikes";
import { formatDistanceToNow } from "date-fns";

interface SharedCafeFeedProps {
  showDeleteButton?: boolean;
}

const SharedCafeFeed = ({ showDeleteButton = false }: SharedCafeFeedProps) => {
  const { sharedCafes, loading, deleteSharedCafe } = useCafeSharing();
  const { getLikeStats, toggleLike } = useLikes();

  const handleDelete = async (shareId: string) => {
    if (window.confirm('Are you sure you want to delete this shared cafe?')) {
      await deleteSharedCafe(shareId);
    }
  };

  const handleLike = async (shareId: string) => {
    await toggleLike(shareId);
  };

  const getDisplayName = (share: any) => {
    if (share.user_first_name && share.user_last_name) {
      return `${share.user_first_name} ${share.user_last_name}`;
    }
    return share.username || 'Anonymous User';
  };

  const getInitials = (share: any) => {
    if (share.user_first_name && share.user_last_name) {
      return `${share.user_first_name[0]}${share.user_last_name[0]}`.toUpperCase();
    }
    if (share.username) {
      return share.username[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="space-y-4" data-testid="shared-cafe-feed-loading">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sharedCafes.length === 0) {
    return (
      <Card data-testid="shared-cafe-feed-empty">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Share2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No shared cafes yet</h3>
              <p className="text-sm text-muted-foreground">
                Start sharing your favorite coffee spots with friends!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="shared-cafe-feed">
      {sharedCafes.map((share) => (
        <Card key={share.id} data-testid={`shared-cafe-${share.id}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback data-testid={`avatar-${share.id}`}>
                    {getInitials(share)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm" data-testid={`username-${share.id}`}>
                    {getDisplayName(share)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span data-testid={`timestamp-${share.id}`}>
                      {formatDistanceToNow(share.created_at, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              {showDeleteButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(share.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  data-testid={`button-delete-${share.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Cafe Info */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />
                <h3 className="font-medium" data-testid={`cafe-name-${share.id}`}>
                  {share.cafe_name}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  <Share2 className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              </div>
            </div>

            {/* Caption */}
            {share.caption && (
              <p className="text-sm" data-testid={`caption-${share.id}`}>
                {share.caption}
              </p>
            )}

            {/* Like Actions */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const likeStats = getLikeStats(share.id);
                    return (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(share.id)}
                        className={`h-8 px-3 ${
                          likeStats.isLiked 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`}
                        data-testid={`button-like-${share.id}`}
                      >
                        <Heart 
                          className={`h-4 w-4 mr-2 ${
                            likeStats.isLiked ? 'fill-current' : ''
                          }`} 
                        />
                        <span data-testid={`like-count-${share.id}`}>
                          {likeStats.count} {likeStats.count === 1 ? 'like' : 'likes'}
                        </span>
                      </Button>
                    );
                  })()}
                  <span className="text-sm text-muted-foreground">💬 0 comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SharedCafeFeed;