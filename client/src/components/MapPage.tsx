import React, { useState, useEffect, useCallback } from 'react';
import { CafeMap } from './CafeMap';
import { CafeDetailCard } from './CafeDetailCard';
import { ReviewModal } from './ReviewModal';
import { useMapDataGeoapify } from '../hooks/useMapDataGeoapify';
import { useUserCampus } from '../hooks/useUserCampus';
import { useUniversities } from '../hooks/useUniversities';
import { Menu } from 'lucide-react';

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
}

export const MapPage: React.FC<MapPageProps> = ({ onAddReview }) => {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviewingCafe, setReviewingCafe] = useState<Cafe | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { campus: userCampus, loading: campusLoading } = useUserCampus();
  const { getUniversityCoordinates } = useUniversities();
  const { cafes, loading, error, fetchCafes } = useMapDataGeoapify();

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

  const handleSubmitReview = useCallback((review: { rating: number; text: string }) => {
    console.log('Submitting review:', review, 'for cafe:', reviewingCafe?.name);
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