import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Heart, MessageCircle, Share, Plus, Bookmark, Search } from "lucide-react";

interface FeedPageProps {
  searchMode?: boolean;
  onReviewClick?: (review: any) => void;
  onAddReview?: () => void;
}

const FeedPage = ({ searchMode = false, onReviewClick, onAddReview }: FeedPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("nearby");
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());
  const [reviewInteractions, setReviewInteractions] = useState<Record<number, { likes: number; comments: number }>>({
    1: { likes: 0, comments: 0 }
  });

  const filters = [
    { id: "nearby", label: "✈️ Recs Nearby", icon: "✈️" },
    { id: "trending", label: "📈 Trending", icon: "📈" },
    { id: "friends", label: "👥 Friend recs", icon: "👥" },
  ];

  const baseReviews = [
    {
      id: 1,
      user: {
        name: "Chitraksha",
        avatar: "CK",
        initials: "CK"
      },
      cafe: {
        name: "Nemesis Coffee Surrey Pavilion",
        location: "Whalley, Surrey, BC, Canada",
        visitCount: 1
      },
      rating: 8.5,
      notes: "Such a good breakfast. Best avocado toast I've ever had and tiramisu croissant was on point",
      photo: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=300&fit=crop",
      timestamp: "July 19",
      likes: 0,
      comments: 0,
      friends: ["Ishan Deshpande", "Manav Khanvilkar"]
    },
    {
      id: 2,
      user: {
        name: "Sarah Chen",
        avatar: "SC",
        initials: "SC"
      },
      cafe: {
        name: "Blue Bottle Coffee",
        location: "Greenwich Village, NY",
        visitCount: 3
      },
      rating: 9.2,
      notes: "Perfect pour over technique. The single origin Ethiopian is incredible with notes of blueberry and chocolate.",
      photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
      timestamp: "July 18",
      likes: 12,
      comments: 3,
      friends: []
    },
    {
      id: 3,
      user: {
        name: "Mike Torres",
        avatar: "MT",
        initials: "MT"
      },
      cafe: {
        name: "Joe Coffee",
        location: "East Village, NY",
        visitCount: 1
      },
      rating: 7.8,
      notes: "Good espresso, great for studying. Can get crowded during peak hours but staff is friendly.",
      photo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
      timestamp: "July 17",
      likes: 8,
      comments: 1,
      friends: ["Alex Kim"]
    }
  ];

  const mockReviews = baseReviews.map(review => ({
    ...review,
    likes: reviewInteractions[review.id]?.likes ?? review.likes,
    comments: reviewInteractions[review.id]?.comments ?? review.comments
  }));

  const filteredReviews = useMemo(() => {
    let filtered = mockReviews;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(review => 
        review.cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.cafe.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (activeFilter === "trending") {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else if (activeFilter === "friends") {
      filtered = filtered.filter(review => review.friends.length > 0);
    }

    return filtered;
  }, [mockReviews, searchQuery, activeFilter]);

  const handleLike = (reviewId: number) => {
    setLikedReviews(prev => {
      const newLiked = new Set(prev);
      const isLiked = newLiked.has(reviewId);
      
      if (isLiked) {
        newLiked.delete(reviewId);
      } else {
        newLiked.add(reviewId);
      }

      setReviewInteractions(prevInteractions => ({
        ...prevInteractions,
        [reviewId]: {
          ...prevInteractions[reviewId],
          likes: (prevInteractions[reviewId]?.likes ?? baseReviews.find(r => r.id === reviewId)?.likes ?? 0) + (isLiked ? -1 : 1)
        }
      }));

      return newLiked;
    });
  };

  const handleComment = (reviewId: number) => {
    setReviewInteractions(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        comments: (prev[reviewId]?.comments ?? baseReviews.find(r => r.id === reviewId)?.comments ?? 0) + 1
      }
    }));
  };

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
          {filteredReviews.map((review) => (
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
                        {review.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-base">
                        <span className="font-semibold">{review.user.name}</span>
                        <span className="text-muted-foreground"> ranked </span>
                        <span className="font-semibold">{review.cafe.name}</span>
                      </div>
                      {review.friends.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          with {review.friends.join(", ")}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <span>🍽️ • {review.cafe.location}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        🔄 {review.cafe.visitCount} visit
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating Circle */}
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                    <span className="text-success-foreground font-bold text-lg">
                      {review.rating}
                    </span>
                  </div>
                </div>

                {/* Photo */}
                {review.photo && (
                  <div className="mb-4">
                    <img
                      src={review.photo}
                      alt="Review photo"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <span className="font-semibold text-sm">Notes: </span>
                  <span className="text-sm">{review.notes}</span>
                </div>

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
                      {review.likes > 0 && <span className="text-sm">{review.likes}</span>}
                    </button>
                    <button 
                      className="flex items-center space-x-1 text-muted-foreground hover:text-blue-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComment(review.id);
                      }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      {review.comments > 0 && <span className="text-sm">{review.comments}</span>}
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

                {/* Timestamp */}
                <div className="mt-3 text-xs text-muted-foreground">
                  {review.timestamp}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;