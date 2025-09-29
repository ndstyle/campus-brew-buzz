import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  X, 
  Plus, 
  Bookmark, 
  Clock,
  TrendingUp,
  Users,
  Star,
  Coffee
} from "lucide-react";

interface Cafe {
  id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: string;
  image?: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  followers?: number;
}

const SearchPage: React.FC = () => {
  const [isCafeSelected, setIsCafeSelected] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("Current Location");
  const [activeFilter, setActiveFilter] = useState("trending");

  // Mock search data
  const [recentCafes] = useState<Cafe[]>([
    { id: "1", name: "Blue Bottle Coffee", address: "North City, Del Mar, CA", rating: 4.5 },
    { id: "2", name: "Philz Coffee - Del Mar", address: "Del Mar, CA", rating: 4.2 },
  ]);

  const [suggestedCafes] = useState<Cafe[]>([
    { id: "3", name: "The Coffee Bean & Tea Leaf", address: "Village of La Jolla, San Diego, CA", rating: 4.3 },
    { id: "4", name: "Starbucks Reserve", address: "Gaslamp Quarter, San Diego, CA", rating: 4.1 },
    { id: "5", name: "Local Coffee Co.", address: "University City, San Diego, CA", rating: 4.6 },
  ]);

  const [suggestedUsers] = useState<User[]>([
    { id: "1", name: "Sarah Johnson", username: "@sarahj", followers: 1250 },
    { id: "2", name: "Mike Chen", username: "@mikechen", followers: 890 },
    { id: "3", name: "Emma Davis", username: "@emmad", followers: 2100 },
  ]);

  // Search handler functions
  const handleClearRecent = (cafeId: string) => {
    console.log("Clear recent:", cafeId);
    // Implement clear recent functionality
  };

  const handleAddToList = (cafeId: string) => {
    console.log("Add to list:", cafeId);
    // Implement add to list functionality
  };

  const handleBookmark = (cafeId: string) => {
    console.log("Bookmark:", cafeId);
    // Implement bookmark functionality
  };

  const handleRemoveSuggestion = (cafeId: string) => {
    console.log("Remove suggestion:", cafeId);
    // Implement remove suggestion functionality
  };

  const handleFollowUser = (userId: string) => {
    console.log("Follow user:", userId);
    // Implement follow user functionality
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">rateurcoffee</h1>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Top-Level Toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-4">
            <Button
              variant={isCafeSelected ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsCafeSelected(true)}
              className={`flex-1 rounded-md ${
                isCafeSelected 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Coffee Shops
            </Button>
            <Button
              variant={!isCafeSelected ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsCafeSelected(false)}
              className={`flex-1 rounded-md ${
                !isCafeSelected 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Members
            </Button>
          </div>
        </div>
      </div>

      {/* Search Inputs */}
      <div className="px-4 mb-6">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${isCafeSelected ? 'coffee shop, specialty, occasion' : 'member, username'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Current Location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Discovery Filters */}
      <div className="px-4 mb-6">
        <div className="flex space-x-2">
          <Button
            variant={activeFilter === "recs" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("recs")}
            className={`rounded-full ${
              activeFilter === "recs" 
                ? "bg-primary text-primary-foreground" 
                : "border-muted-foreground/20"
            }`}
          >
            Recs
          </Button>
          <Button
            variant={activeFilter === "trending" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("trending")}
            className={`rounded-full ${
              activeFilter === "trending" 
                ? "bg-primary text-primary-foreground" 
                : "border-muted-foreground/20"
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </Button>
          <Button
            variant={activeFilter === "friends" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("friends")}
            className={`rounded-full ${
              activeFilter === "friends" 
                ? "bg-primary text-primary-foreground" 
                : "border-muted-foreground/20"
            }`}
          >
            <Users className="h-4 w-4 mr-1" />
            Friend Recs
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-6 pb-24">
        {/* Recents Section */}
        {isCafeSelected && recentCafes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recently Viewed</h2>
            </div>
            <div className="space-y-2">
              {recentCafes.map((cafe) => (
                <Card key={cafe.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{cafe.name}</p>
                          <p className="text-sm text-muted-foreground">{cafe.address}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearRecent(cafe.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Places/Users */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {isCafeSelected 
              ? "Places You May Have Been in San Diego, CA" 
              : "Members You May Know"
            }
          </h2>
          <div className="space-y-2">
            {isCafeSelected ? (
              suggestedCafes.map((cafe) => (
                <Card key={cafe.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{cafe.name}</p>
                        <p className="text-sm text-muted-foreground">{cafe.address}</p>
                        {cafe.rating && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{cafe.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToList(cafe.id)}
                          className="h-8 w-8 p-0 rounded-full border border-muted-foreground/20"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(cafe.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSuggestion(cafe.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              suggestedUsers.map((user) => (
                <Card key={user.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleFollowUser(user.id)}
                          className="h-8 px-3"
                        >
                          Follow
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSuggestion(user.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
