import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, MessageCircle, Share, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PreviewProps {
  review?: any;
  onBack?: () => void;
}

const Preview = ({ review, onBack }: PreviewProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [cafeDetails, setCafeDetails] = useState(null);
  const { user } = useAuth();

  // Fetch user and cafe details if not provided in review
  useEffect(() => {
    const fetchDetails = async () => {
      if (!review) return;

      try {
        // Fetch user details if needed
        if (!review.user && review.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name, username')
            .eq('id', review.user_id)
            .single();
          
          if (userData) {
            setUserDetails({
              name: `${userData.first_name} ${userData.last_name}`,
              username: userData.username
            });
          }
        }

        // Fetch cafe details if needed
        if (!review.cafe && review.cafe_id) {
          const { data: cafeData } = await supabase
            .from('cafes')
            .select('name, campus, address')
            .eq('id', review.cafe_id)
            .single();
          
          if (cafeData) {
            setCafeDetails(cafeData);
          }
        }
      } catch (error) {
        console.error('Error fetching preview details:', error);
      }
    };

    fetchDetails();
  }, [review]);

  // Use provided review data or create preview data from current user
  const displayReview = review ? {
    ...review,
    user: review.user || userDetails || {
      name: user ? `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}` : 'You',
      username: user?.user_metadata?.username || 'you'
    },
    cafe: review.cafe || cafeDetails || {
      name: 'Selected Cafe',
      campus: 'Your Campus'
    },
    rating: Number(review.rating || 0),
    timestamp: 'Just now'
  } : null;

  if (!displayReview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No review data to preview</p>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Review Preview</h1>
              <p className="text-muted-foreground">How your review will appear to others</p>
            </div>
          </div>
        </div>

        {/* Review Card */}
        <Card className="p-4 mb-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{displayReview.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{displayReview.user.name}</h3>
                {displayReview.cafe.campus && (
                  <Badge variant="secondary" className="text-xs">{displayReview.cafe.campus}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{displayReview.user.username}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{displayReview.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {displayReview.timestamp}
              </div>
            </div>
          </div>

          {/* Cafe Info */}
          <div className="mb-4">
            <h4 className="font-semibold text-foreground text-lg mb-1">{displayReview.cafe.name}</h4>
            {displayReview.cafe.campus && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {displayReview.cafe.campus}
              </div>
            )}
          </div>

          {/* Categories */}
          {displayReview.categories && displayReview.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {displayReview.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Photos */}
          {displayReview.photo_url && (
            <div className="grid grid-cols-1 gap-2 mb-4">
              <img
                src={displayReview.photo_url}
                alt="Review photo"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Review Text */}
          {(displayReview.blurb || displayReview.text) && (
            <p className="text-foreground mb-4 leading-relaxed">
              {displayReview.blurb || displayReview.text}
            </p>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-1 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm">{(displayReview.likes || 0) + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{displayReview.comments || 0}</span>
              </button>
            </div>
            <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full h-12" size="lg">
            Looks Good - Publish
          </Button>
          <Button variant="outline" className="w-full h-12" size="lg">
            Edit Review
          </Button>
          <Button variant="ghost" className="w-full h-12" size="lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preview;