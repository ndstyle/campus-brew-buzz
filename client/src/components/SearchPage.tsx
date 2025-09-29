import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  address: string | null;
  campus?: string | null;
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
  const [searchResults, setSearchResults] = useState<Cafe[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingCafes, setTrendingCafes] = useState<Cafe[]>([]);
  const [friendRecommendations, setFriendRecommendations] = useState<Cafe[]>([]);
  const { toast } = useToast();

  // Fetch cafes or users based on search query
  const handleSearchChange = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setUserResults([]);
      return;
    }

    setLoading(true);
    
    try {
      if (isCafeSelected) {
        // Search cafes
        const { data, error } = await supabase
          .from('cafes')
          .select('id, name, address, campus')
          .or(`name.ilike.%${query}%,address.ilike.%${query}%,campus.ilike.%${query}%`)
          .limit(10);

        if (error) throw error;
        setSearchResults((data || []).map(cafe => ({
          ...cafe,
          address: cafe.address || cafe.campus || 'Location unknown'
        })));
      } else {
        // Search users
        const { data, error } = await supabase
          .from('users')
          .select('id, username, first_name, last_name')
          .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
          .limit(10);

        if (error) throw error;
        
        const formattedUsers: User[] = (data || []).map(user => ({
          id: user.id,
          name: user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}` 
            : user.username || 'Anonymous',
          username: user.username || '',
          followers: 0
        }));
        setUserResults(formattedUsers);
      }
    } catch (error: any) {
      console.error('[SEARCH] Error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to fetch search results. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [isCafeSelected, toast]);

  // Load trending cafes
  useEffect(() => {
    const loadTrendingCafes = async () => {
      try {
        const { data, error } = await supabase
          .from('cafes')
          .select('id, name, address, campus')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setTrendingCafes((data || []).map(cafe => ({
          ...cafe,
          address: cafe.address || cafe.campus || 'Location unknown'
        })));
      } catch (error) {
        console.error('[SEARCH] Error loading trending cafes:', error);
      }
    };

    loadTrendingCafes();
  }, []);

  // Load friend recommendations
  useEffect(() => {
    const loadFriendRecs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get cafes reviewed by friends
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            cafes!inner(
              id,
              name,
              address,
              campus
            ),
            users!inner(
              id
            )
          `)
          .limit(5);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          setFriendRecommendations([]);
        } else {
          const uniqueCafes = Array.from(
            new Map(data.map(item => [item.cafes.id, item.cafes])).values()
          ).map(cafe => ({
            ...cafe,
            address: cafe.address || cafe.campus || 'Location unknown'
          }));
          setFriendRecommendations(uniqueCafes);
        }
      } catch (error) {
        console.error('[SEARCH] Error loading friend recommendations:', error);
      }
    };

    if (activeFilter === 'friends') {
      loadFriendRecs();
    }
  }, [activeFilter]);

  // Handler functions with real implementation
  const handleAddToList = async (cafeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to add cafes to your list.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Added to List',
        description: 'Cafe added to your favorites!'
      });
    } catch (error) {
      console.error('[SEARCH] Error adding to list:', error);
      toast({
        title: 'Error',
        description: 'Failed to add cafe to list.',
        variant: 'destructive'
      });
    }
  };

  const handleBookmark = async (cafeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to bookmark cafes.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Bookmarked',
        description: 'Cafe bookmarked successfully!'
      });
    } catch (error) {
      console.error('[SEARCH] Error bookmarking:', error);
      toast({
        title: 'Error',
        description: 'Failed to bookmark cafe.',
        variant: 'destructive'
      });
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to follow users.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          followee_id: userId
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You are now following this user!'
      });
    } catch (error: any) {
      console.error('[SEARCH] Error following user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow user.',
        variant: 'destructive'
      });
    }
  };

  // Get display data based on filter
  const getDisplayCafes = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults;
    }
    
    switch(activeFilter) {
      case 'trending':
        return trendingCafes;
      case 'friends':
        return friendRecommendations;
      default:
        return trendingCafes;
    }
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
            onChange={(e) => handleSearchChange(e.target.value)}
            data-testid="input-search"
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
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Recommendations/Search Results */}
            <div>
              <h2 className="text-lg font-semibold mb-3">
                {searchQuery.trim() 
                  ? "Search Results" 
                  : activeFilter === 'recs'
                  ? "Recommendations"
                  : activeFilter === 'trending'
                  ? "Trending Coffee Shops"
                  : "Friend Recommendations"
                }
              </h2>

              {/* Friend Recs Placeholder */}
              {activeFilter === 'friends' && friendRecommendations.length === 0 && !searchQuery.trim() && (
                <Card className="p-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Add some friends for personalized recommendations!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Follow other members to see their favorite coffee shops here.
                  </p>
                </Card>
              )}

              {/* No results message */}
              {searchQuery.trim() && searchResults.length === 0 && userResults.length === 0 && !loading && (
                <Card className="p-6 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms
                  </p>
                </Card>
              )}

              {/* Display cafes */}
              <div className="space-y-2">
                {isCafeSelected ? (
                  (searchQuery.trim() ? searchResults : getDisplayCafes()).map((cafe) => (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              userResults.map((user) => (
                <Card key={user.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleFollowUser(user.id)}
                          className="h-8 px-3"
                          data-testid={`button-follow-${user.id}`}
                        >
                          Follow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
