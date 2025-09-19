import React, { useState, useEffect, useCallback } from 'react';
import { CafeMap } from './CafeMap';
import { CafeDetailCard } from './CafeDetailCard';
import { EnhancedReviewModal } from './EnhancedReviewModal';
import CafeFilterPanel from './CafeFilterPanel';
import { useMapDataGeoapify } from '../hooks/useMapDataGeoapify';
import { useUserCampus } from '../hooks/useUserCampus';
import { useUniversities } from '../hooks/useUniversities';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, Users, Coffee, TrendingUp, MapPin, Star, Filter, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Cafe, CafeFilter, ReviewWithTags } from '@/types';

interface EnhancedMapPageProps {
  onAddReview: (cafe?: Cafe) => void;
  onCafesLoaded?: (cafes: any[]) => void;
}

export const EnhancedMapPage: React.FC<EnhancedMapPageProps> = ({ onAddReview, onCafesLoaded }) => {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviewingCafe, setReviewingCafe] = useState<Cafe | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showRecentCafes, setShowRecentCafes] = useState(false);
  const [filters, setFilters] = useState<CafeFilter>({
    category: 'all',
    minRating: 1,
    maxRating: 10,
    priceRange: [],
    cuisineType: []
  });

  const { campus: userCampus, loading: campusLoading } = useUserCampus();
  const { getUniversityCoordinates } = useUniversities();
  const { cafes, loading, error, fetchCafes } = useMapDataGeoapify();

  // Mock friend count for social element
  const friendCount = 12;

  // Fetch recent reviews for the bottom sheet
  const { data: recentReviews = [] } = useQuery({
    queryKey: ['/api/reviews', 'recent-map'],
    enabled: showRecentCafes,
    staleTime: 5 * 60 * 1000,
  }) as { data: any[] };

  // Filter cafes based on current filters
  const filteredCafes = cafes.filter(cafe => {
    // Category filter
    if (filters.category !== 'all' && cafe.category !== filters.category) {
      return false;
    }

    // Rating filter
    const cafeRating = cafe.averageRating || cafe.avgrating || 0;
    if (cafeRating < filters.minRating || cafeRating > filters.maxRating) {
      return false;
    }

    // Price range filter
    if (filters.priceRange.length > 0 && !filters.priceRange.includes(cafe.price_range || '$$')) {
      return false;
    }

    // Cuisine type filter
    if (filters.cuisineType.length > 0 && !filters.cuisineType.includes(cafe.cuisine_type || 'coffee')) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return cafe.name.toLowerCase().includes(query) ||
             (cafe.address && cafe.address.toLowerCase().includes(query)) ||
             (cafe.cuisine_type && cafe.cuisine_type.toLowerCase().includes(query));
    }

    return true;
  });

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    const initializeLocation = async () => {
      if (!mounted || hasInitialized) return;
      hasInitialized = true;

      console.log('🎯 EnhancedMapPage: Initializing location once...', { campusLoading, userCampus });

      if (!campusLoading && userCampus) {
        const campusCoords = getUniversityCoordinates(userCampus);
        if (campusCoords && mounted) {
          const coords: [number, number] = [campusCoords.lat, campusCoords.lng];
          setUserLocation(coords);
          await fetchCafes(userCampus, { lat: coords[0], lng: coords[1] });
          setIsLoading(false);
          return;
        }
      }

      if (!userCampus && mounted) {
        const defaultCoords: [number, number] = [34.0689, -118.4452];
        setUserLocation(defaultCoords);
        await fetchCafes('University of California, Los Angeles', { lat: defaultCoords[0], lng: defaultCoords[1] });
        setIsLoading(false);
      }
    };

    if (!campusLoading) {
      initializeLocation();
    }

    return () => {
      mounted = false;
    };
  }, [campusLoading, userCampus]);

  useEffect(() => {
    if (filteredCafes && filteredCafes.length > 0 && onCafesLoaded) {
      console.log('🎯 EnhancedMapPage: Passing filtered cafes to parent:', filteredCafes.length);
      onCafesLoaded(filteredCafes);
    }
  }, [filteredCafes, onCafesLoaded]);

  const handleCafeClick = useCallback((cafe: Cafe) => {
    console.log('🎯 EnhancedMapPage: Cafe clicked:', cafe.name);
    setSelectedCafe(cafe);
  }, []);

  const handleAddReview = useCallback((cafe: Cafe) => {
    console.log('🎯 EnhancedMapPage: Add review clicked for cafe:', cafe.name);
    setSelectedCafe(null);
    setReviewingCafe(cafe);
  }, []);

  const handleSubmitReview = useCallback((review: ReviewWithTags) => {
    console.log('🎉 [ENHANCED REVIEW] Submitting enhanced review:', {
      rating: review.rating,
      text: review.text,
      isPublic: review.isPublic,
      shareToFeed: review.shareToFeed,
      taggedFriends: review.taggedFriends,
      cafe: reviewingCafe?.name
    });

    // TODO: Integrate with actual review submission system
    setReviewingCafe(null);
  }, [reviewingCafe]);

  const handleCloseCard = useCallback(() => {
    setSelectedCafe(null);
  }, []);

  const handleCloseReview = useCallback(() => {
    setReviewingCafe(null);
  }, []);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.minRating > 1 || filters.maxRating < 10) count++;
    if (filters.priceRange.length > 0) count++;
    if (filters.cuisineType.length > 0) count++;
    return count;
  };

  if (isLoading || campusLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen">
        <div className="mobile-safe-area flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground text-sm">finding cafes near you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      {/* Full-Screen Map */}
      {userLocation ? (
        <div className="relative h-screen">
          {/* Enhanced Search Overlay - Top */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 space-y-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4" />
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
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

              {/* Results Summary */}
              <div className="mt-2 text-xs text-muted-foreground">
                Showing {filteredCafes.length} of {cafes.length} cafes
                {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filter${getActiveFilterCount() === 1 ? '' : 's'} applied)`}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="glass-card rounded-xl social-floating">
                <CafeFilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClose={() => setShowFilters(false)}
                  isOpen={showFilters}
                />
              </div>
            )}
          </div>

          {/* Map Component with Filtered Data */}
          <CafeMap
            cafes={filteredCafes.map(cafe => ({
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
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
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
        <div className="mobile-safe-area flex items-center justify-center h-full">
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

      {/* Enhanced Review Modal */}
      {reviewingCafe && (
        <EnhancedReviewModal
          cafe={reviewingCafe}
          onClose={handleCloseReview}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default EnhancedMapPage;