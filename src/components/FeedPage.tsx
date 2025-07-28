import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Heart, MessageCircle, Share, Plus, Bookmark, Search } from "lucide-react";

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
    }
  ];

  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
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
          {mockReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden border-0 shadow-sm">
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
                    <button className="flex items-center space-x-1">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="flex items-center space-x-1">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button>
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button>
                      <Plus className="w-5 h-5" />
                    </button>
                    <button>
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