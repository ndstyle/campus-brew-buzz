import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Menu, Heart, MessageCircle, Share, Plus, Bookmark, Search } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface FeedPageProps {
  searchMode?: boolean;
  onReviewClick?: (review: any) => void;
  onAddReview?: () => void;
  refreshTrigger?: number;
}

const FeedPage = ({ searchMode = false, onReviewClick, onAddReview, refreshTrigger }: FeedPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("nearby");
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { fetchReviews } = useReviews();

  const filters = [
    { id: "nearby", label: "✈️ Recs Nearby", icon: "✈️" },
    { id: "trending", label: "📈 Trending", icon: "📈" },
    { id: "friends", label: "👥 Friend recs", icon: "👥" },
  ];

  const loadReviews = async () => {
    setLoading(true);
    const scope = activeFilter === 'friends' ? 'friends' : 'all';
    const data = await fetchReviews(scope as any);
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [activeFilter]);

  // Reload reviews when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadReviews();
    }
  }, [refreshTrigger]);

  // Real-time subscription for new reviews
  useEffect(() => {
    console.log('🔄 [FEED REALTIME] Setting up real-time subscription');
    
    const channel = supabase
      .channel('reviews-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          console.log('⚡ [FEED REALTIME] New review received:', payload);
          // Reload reviews to get the new one with joins
          loadReviews();
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 [FEED REALTIME] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(review => 
        review.cafes?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.cafes?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.blurb?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.users?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.users?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.users?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter (simplified for now)
    if (activeFilter === "trending") {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [reviews, searchQuery, activeFilter]);

  const handleLike = (reviewId: string) => {
    setLikedReviews(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(reviewId)) {
        newLiked.delete(reviewId);
      } else {
        newLiked.add(reviewId);
      }
      return newLiked;
    });
  };

  const getDisplayName = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.username) {
      return user.username;
    }
    return "Anonymous User";
  };

  const getInitials = (user: any) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "AU";
  };

  if (loading) {
    return (
      <div className="mobile-container bg-background pb-20 min-h-screen">
        <div className="mobile-safe-area">
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-4">
            <h1 className="text-xl font-bold">
              {searchMode ? "Search & Review" : <>rate<span className="text-primary">ur</span>coffee</>}
            </h1>
            <div className="flex items-center space-x-3">
              {onAddReview && (
                <Button size="sm" onClick={onAddReview} className="flex items-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search a restaurant, member, etc."
                className="h-12 bg-muted/30 border-0 rounded-xl pl-10 pr-4"
                disabled
              />
            </div>
          </div>

          {/* Loading Skeleton */}
          <div className="px-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-full" />
                </div>
                <Skeleton className="h-32 w-full mb-4 rounded-lg" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      <div className="mobile-safe-area">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-4">
          <h1 className="text-xl font-bold">
            {searchMode ? "Search & Review" : <>rate<span className="text-primary">ur</span>coffee</>}
          </h1>
          <div className="flex items-center space-x-3">
            {onAddReview && (
              <Button size="sm" onClick={onAddReview} className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Add Review</span>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search a restaurant, member, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 bg-muted/30 border-0 rounded-xl pl-10 pr-4"
            />
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex space-x-3 px-4 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="whitespace-nowrap rounded-full px-4 py-2"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Review Feed */}
        <div className="space-y-4 px-4">
          {filteredReviews.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                {searchQuery ? "No reviews found matching your search." : "No reviews yet. Be the first to write one!"}
              </div>
              {onAddReview && !searchQuery && (
                <Button onClick={onAddReview} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Review
                </Button>
              )}
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card 
                key={review.id} 
                className="overflow-hidden border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onReviewClick?.(review)}
              >
                <div className="p-4">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                          {getInitials(review.users)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-base">
                          <span className="font-semibold">{getDisplayName(review.users)}</span>
                          <span className="text-muted-foreground"> ranked </span>
                          <span className="font-semibold">{review.cafes?.name || "Unknown Cafe"}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <span>🍽️ • {review.cafes?.address || review.cafes?.campus || "Location unknown"}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), "MMM d")}
                        </div>
                      </div>
                    </div>
                    
                    {/* Rating Circle */}
                    <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                      <span className="text-success-foreground font-bold text-lg">
                        {Number(review.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Photo */}
                  {review.photo_url && (
                    <div className="mb-4">
                      <img
                        src={review.photo_url}
                        alt="Review photo"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  {review.blurb && (
                    <div className="mb-4">
                      <span className="font-semibold text-sm">Notes: </span>
                      <span className="text-sm">{review.blurb}</span>
                    </div>
                  )}

                  {/* Interaction Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button 
                        className={`flex items-center space-x-1 transition-colors ${
                          likedReviews.has(review.id) 
                            ? 'text-red-500' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(review.id);
                        }}
                      >
                        <Heart className={`w-5 h-5 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button className="flex items-center space-x-1 text-muted-foreground hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="text-muted-foreground hover:text-green-500 transition-colors">
                        <Share className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                      <button className="text-muted-foreground hover:text-yellow-500 transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;