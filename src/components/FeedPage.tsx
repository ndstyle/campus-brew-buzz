import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bell, Menu, Heart, MessageCircle, Share, Plus, Bookmark } from "lucide-react";

const FeedPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("nearby");

  const filters = [
    { id: "nearby", label: "✈️ Recs Nearby", icon: "✈️" },
    { id: "trending", label: "📈 Trending", icon: "📈" },
    { id: "friends", label: "👥 Friend recs", icon: "👥" },
  ];

  const mockReviews = [
    {
      id: 1,
      user: {
        name: "sarah_j",
        avatar: "SJ",
        initials: "SJ"
      },
      cafe: {
        name: "Blue Bottle Coffee",
        location: "Berkeley, CA",
        visitCount: 3
      },
      rating: 8.5,
      notes: "Perfect cortado and amazing atmosphere for studying. The barista recommended their single origin from Guatemala and it was incredible!",
      photo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
      timestamp: "2h ago",
      likes: 24,
      comments: 5,
      friends: ["mike_c", "emma_d"]
    },
    {
      id: 2,
      user: {
        name: "alex_m",
        avatar: "AM",
        initials: "AM"
      },
      cafe: {
        name: "Philz Coffee",
        location: "Stanford, CA", 
        visitCount: 1
      },
      rating: 9.2,
      notes: "First time trying their custom blends - got the Tesora and it's now my new favorite! Will definitely be back.",
      photo: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=300&fit=crop",
      timestamp: "4h ago",
      likes: 18,
      comments: 3,
      friends: []
    }
  ];

  return (
    <div className="mobile-container bg-background pb-20">
      <div className="mobile-safe-area">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-4">
          <h1 className="text-xl font-bold">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <div className="flex items-center space-x-3">
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
          <Input
            placeholder="Search a restaurant, member, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex space-x-2 px-4 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Review Feed */}
        <div className="space-y-6 px-4">
          {mockReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <div className="p-4">
                {/* User Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {review.user.initials}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{review.user.name}</span>
                      <span className="text-muted-foreground">ranked</span>
                      <span className="font-medium">{review.cafe.name}</span>
                    </div>
                    {review.friends.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        with {review.friends.join(", ")}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {review.cafe.location} • Visit #{review.cafe.visitCount}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo */}
                {review.photo && (
                  <div className="mb-3">
                    <img
                      src={review.photo}
                      alt="Review photo"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <span className="font-medium text-sm">Notes: </span>
                  <span className="text-sm">{review.notes}</span>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{review.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{review.comments}</span>
                    </button>
                    <button>
                      <Share className="w-4 h-4" />
                    </button>
                    <button>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button>
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.timestamp}
                  </span>
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