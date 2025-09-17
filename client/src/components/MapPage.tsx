import React, { useState, useEffect, useCallback } from 'react';
import { CafeMap } from './CafeMap';
import { CafeDetailCard } from './CafeDetailCard';
import { ReviewModal } from './ReviewModal';
import { useMapDataGeoapify } from '../hooks/useMapDataGeoapify';
import { useUserCampus } from '../hooks/useUserCampus';
import { useUniversities } from '../hooks/useUniversities';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, Users, Coffee, TrendingUp, MapPin, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  avgrating?: number;
  ratingcount?: number;
  cuisine?: string;
  priceLevel?: number;
  photos?: string[];
  phone?: string;
  website?: string;
  amenities?: string[];
}

interface MapPageProps {
  onAddReview: (cafe?: Cafe) => void;
  onCafesLoaded?: (cafes: any[]) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onAddReview, onCafesLoaded }) => {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviewingCafe, setReviewingCafe] = useState<Cafe | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRecentCafes, setShowRecentCafes] = useState(false);
  
  const { campus: userCampus, loading: campusLoading } = useUserCampus();
  const { getUniversityCoordinates } = useUniversities();
  const { cafes, loading, error, fetchCafes } = useMapDataGeoapify();

  // Coffee categories for filtering
  const categories = [
    { id: 'all', label: 'All', icon: Coffee },
    { id: 'espresso', label: 'Espresso', icon: Coffee },
    { id: 'latte', label: 'Latte', icon: Coffee },
    { id: 'cold_brew', label: 'Cold Brew', icon: Coffee },
    { id: 'specialty', label: 'Specialty', icon: Star }
  ];

  // Mock friend count for social element
  const friendCount = 12; // In real app, this would come from friend data

  // Fetch recent reviews for the bottom sheet
  const { data: recentReviews = [] } = useQuery({
    queryKey: ['/api/reviews', 'recent-map'],
    enabled: showRecentCafes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }) as { data: any[] };

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;
    
    const initializeLocation = async () => {
      if (!mounted || hasInitialized) return;
      hasInitialized = true;
      
      console.log('🎯 MapPage: Initializing location once...', { campusLoading, userCampus });
      
      if (!campusLoading && userCampus) {
        // Use user's college location as default
        const campusCoords = getUniversityCoordinates(userCampus);
        if (campusCoords && mounted) {
          const coords: [number, number] = [campusCoords.lat, campusCoords.lng];
          setUserLocation(coords);
          await fetchCafes(userCampus, { lat: coords[0], lng: coords[1] });
          setIsLoading(false);
          return;
        }
      }

      // Fallback: Just use default UCLA coordinates without geolocation
      if (!userCampus && mounted) {
        const defaultCoords: [number, number] = [34.0689, -118.4452];
        setUserLocation(defaultCoords);
        await fetchCafes('University of California, Los Angeles', { lat: defaultCoords[0], lng: defaultCoords[1] });
        setIsLoading(false);
      }
    };

    // Only initialize once when campus loading is done
    if (!campusLoading) {
      initializeLocation();
    }
    
    return () => {
      mounted = false;
    };
  }, [campusLoading, userCampus]);

  // Pass cafes to parent when they're loaded
  useEffect(() => {
    if (cafes && cafes.length > 0 && onCafesLoaded) {
      console.log('🎯 MapPage: Passing cafes to parent:', cafes.length);
      onCafesLoaded(cafes);
    }
  }, [cafes, onCafesLoaded]);

  const handleCafeClick = useCallback((cafe: Cafe) => {
    console.log('🎯 MapPage: Cafe clicked:', cafe.name);
    console.log('🎯 MapPage: Setting selectedCafe to:', cafe);
    setSelectedCafe(cafe);
  }, []);

  const handleAddReview = useCallback((cafe: Cafe) => {
    console.log('🎯 MapPage: Add review clicked for cafe:', cafe.name);
    setSelectedCafe(null);
    onAddReview(cafe);
  }, [onAddReview]);

  const handleSubmitReview = useCallback((review: { 
    rating: number; 
    text: string; 
    isPublic: boolean; 
    shareToFeed: boolean; 
    taggedFriends: string[] 
  }) => {
    console.log('🎉 [SOCIAL REVIEW] Submitting social review:', {
      rating: review.rating,
      text: review.text,
      isPublic: review.isPublic,
      shareToFeed: review.shareToFeed,
      taggedFriends: review.taggedFriends,
      cafe: reviewingCafe?.name
    });
    
    // TODO: Integrate with actual review submission system
    // For now, we'll just log the social review data
    setReviewingCafe(null);
  }, [reviewingCafe]);

  const handleCloseCard = useCallback(() => {
    setSelectedCafe(null);
  }, []);

  const handleCloseReview = useCallback(() => {
    setReviewingCafe(null);
  }, []);

  if (isLoading || campusLoading) {
    return (
      <div className="map-page-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground text-sm">finding cafes near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page-container">
      {/* Full-Screen Map */}
      {userLocation ? (
        <div className="map-content-wrapper">
          {/* Social Search Overlay - Top */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-safe-top space-y-4">
            {/* Search Bar with Social Elements */}
            <div className="glass-card rounded-xl p-4 social-floating">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search coffee shops, friends, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                  data-testid="input-search"
                />
              </div>
              
              {/* Friend Counter */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {friendCount} coffee lovers nearby
                  </span>
                </div>
                <div className="avatar-cluster">
                  {[1, 2, 3].map((i) => (
                    <Avatar key={i} className="avatar w-6 h-6">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {String.fromCharCode(64 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 ${
                      selectedCategory === category.id 
                        ? 'bg-gradient-primary text-white shadow-lg' 
                        : 'glass-card text-foreground'
                    }`}
                    data-testid={`button-filter-${category.id}`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Map Component */}
          <CafeMap
            cafes={cafes.map(cafe => ({
              id: cafe.id,
              name: cafe.name,
              latitude: cafe.latitude || cafe.lat || 0,
              longitude: cafe.longitude || cafe.lng || 0,
              avgrating: cafe.averageRating || cafe.avgrating,
              ratingcount: cafe.reviewCount || cafe.ratingcount,
              address: cafe.address || 'address not available',
              cuisine: cafe.cuisine,
              priceLevel: cafe.priceLevel,
              photos: cafe.photos
            }))}
            center={userLocation}
            onCafeClick={handleCafeClick}
            className="w-full h-full"
          />

          {/* Recently Rated Cafes - Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-24">
            <Card className="glass-card social-floating" data-testid="card-recent-cafes">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Recently rated</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRecentCafes(!showRecentCafes)}
                    className="text-primary hover:text-primary/80"
                    data-testid="button-toggle-recent"
                  >
                    {showRecentCafes ? 'Hide' : 'See all'}
                  </Button>
                </div>
                
                {/* Preview Row */}
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {recentReviews.slice(0, 3).map((review: any, index: number) => (
                    <div
                      key={review.id || index}
                      className="flex-shrink-0 text-center cursor-pointer hover:opacity-80"
                      onClick={() => handleCafeClick({
                        id: review.cafe_id || `recent-${index}`,
                        name: review.cafes?.name || `Recent Cafe ${index + 1}`,
                        address: review.cafes?.address || 'Address not available',
                        latitude: review.cafes?.lat || 34.0689,
                        longitude: review.cafes?.lng || -118.4452
                      })}
                      data-testid={`card-recent-cafe-${index}`}
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-primary-subtle flex items-center justify-center mb-2">
                        <Coffee className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-xs font-medium text-foreground truncate w-16">
                        {review.cafes?.name || `Cafe ${index + 1}`}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {review.rating || (8 + index)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add some mock cafes if no reviews */}
                  {recentReviews.length === 0 && [1, 2, 3].map((i) => (
                    <div
                      key={`mock-${i}`}
                      className="flex-shrink-0 text-center cursor-pointer hover:opacity-80"
                      data-testid={`card-mock-cafe-${i}`}
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-primary-subtle flex items-center justify-center mb-2">
                        <Coffee className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-xs font-medium text-foreground truncate w-16">
                        Cafe {i}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {8 + i}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="map-content-wrapper">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">loading map...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-30 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-4 left-4 right-4 z-30 bg-background rounded-lg p-3 shadow-lg border">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            <span className="text-sm text-muted-foreground">loading cafes...</span>
          </div>
        </div>
      )}

      {/* Cafe Detail Modal */}
      {selectedCafe && (
        <CafeDetailCard
          cafe={selectedCafe}
          onClose={handleCloseCard}
          onAddReview={handleAddReview}
        />
      )}

      {/* Review Modal */}
      {reviewingCafe && (
        <ReviewModal
          cafe={reviewingCafe}
          onClose={handleCloseReview}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default MapPage;