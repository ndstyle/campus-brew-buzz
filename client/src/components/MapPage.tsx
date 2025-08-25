import React, { useState, useEffect, useCallback } from 'react';
import { CafeMap } from './CafeMap';
import { CafeDetailCard } from './CafeDetailCard';
import { ReviewModal } from './ReviewModal';
import { useMapDataGeoapify } from '../hooks/useMapDataGeoapify';
import { useUserCampus } from '../hooks/useUserCampus';
import { useUniversities } from '../hooks/useUniversities';
import { Menu, Trophy, Coffee, Search, Star, User } from 'lucide-react';

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

export const MapPage: React.FC = () => {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviewingCafe, setReviewingCafe] = useState<Cafe | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { campus: userCampus, loading: campusLoading } = useUserCampus();
  const { getUniversityCoordinates } = useUniversities();
  const { cafes, loading, error, fetchCafes } = useMapDataGeoapify();

  useEffect(() => {
    const initializeLocation = async () => {
      if (!campusLoading && userCampus) {
        // Use user's college location as default
        const campusCoords = getUniversityCoordinates(userCampus);
        if (campusCoords) {
          const coords: [number, number] = [campusCoords.lat, campusCoords.lng];
          setUserLocation(coords);
          fetchCafes(userCampus, { lat: coords[0], lng: coords[1] });
          setIsLoading(false);
          return;
        }
      }

      // Fallback to geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserLocation(coords);
            fetchCafes(userCampus || 'University of California, Los Angeles', { lat: coords[0], lng: coords[1] });
            setIsLoading(false);
          },
          (error) => {
            console.error('Location error:', error);
            // Final fallback to UCLA
            const defaultCoords: [number, number] = [34.0689, -118.4452];
            setUserLocation(defaultCoords);
            fetchCafes('University of California, Los Angeles', { lat: defaultCoords[0], lng: defaultCoords[1] });
            setIsLoading(false);
          }
        );
      } else {
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, [campusLoading, userCampus, getUniversityCoordinates, fetchCafes]);

  const handleCafeClick = useCallback((cafe: Cafe) => {
    console.log('🎯 MapPage: Cafe clicked:', cafe.name);
    console.log('🎯 MapPage: Setting selectedCafe to:', cafe);
    setSelectedCafe(cafe);
  }, []);

  const handleAddReview = useCallback((cafe: Cafe) => {
    setSelectedCafe(null);
    setReviewingCafe(cafe);
  }, []);

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
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">finding cafes near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-white overflow-hidden">

      {/* Mobile-Optimized Map */}
      {userLocation && (
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
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
              className="w-full h-96"
            />
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center py-2 px-3">
            <Trophy size={20} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">leaderboard</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-purple-600">
            <Coffee size={20} className="text-purple-600 mb-1" />
            <span className="text-xs font-medium">find coffee</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3">
            <Search size={20} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">search + review</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3">
            <Star size={20} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">feed</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3">
            <User size={20} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">my profile</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-30 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-20 left-4 right-4 z-30 bg-white rounded-lg p-3 shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
            <span className="text-sm text-gray-600">loading cafes...</span>
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