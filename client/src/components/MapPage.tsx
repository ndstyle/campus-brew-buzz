import React, { useState, useEffect } from 'react';
import { CafeMap } from './CafeMap';
import { CafeDetailCard } from './CafeDetailCard';
import { ReviewModal } from './ReviewModal';
import { useMapDataGeoapify } from '../hooks/useMapDataGeoapify';
import { Search, Filter } from 'lucide-react';

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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviewingCafe, setReviewingCafe] = useState<Cafe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { cafes, loading, error, fetchCafes } = useMapDataGeoapify();

  useEffect(() => {
    // Get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          fetchCafes('University of California, Los Angeles', { lat: coords[0], lng: coords[1] });
          setIsLoading(false);
        },
        (error) => {
          console.error('Location error:', error);
          // Default to UCLA area
          const defaultCoords: [number, number] = [34.0689, -118.4452];
          setUserLocation(defaultCoords);
          fetchCafes('University of California, Los Angeles', { lat: defaultCoords[0], lng: defaultCoords[1] });
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, [fetchCafes]);

  const handleCafeClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

  const handleAddReview = (cafe: Cafe) => {
    setSelectedCafe(null);
    setReviewingCafe(cafe);
  };

  const handleSubmitReview = (review: { rating: number; text: string; photos?: string[] }) => {
    console.log('Submitting review:', review, 'for cafe:', reviewingCafe?.name);
    // TODO: Submit to your backend
    setReviewingCafe(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Finding cafes near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-white overflow-hidden">
      {/* Top Header - Minimal */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold text-gray-900">Find Coffee</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Map */}
      {userLocation && (
        <div className="absolute inset-0 pt-16">
          <CafeMap
            cafes={cafes.map(cafe => ({
              id: cafe.id,
              name: cafe.name,
              latitude: cafe.latitude || cafe.lat || 0,
              longitude: cafe.longitude || cafe.lng || 0,
              avgrating: cafe.averageRating || cafe.avgrating,
              ratingcount: cafe.reviewCount || cafe.ratingcount,
              address: cafe.address || 'Address not available',
              cuisine: cafe.cuisine,
              priceLevel: cafe.priceLevel,
              photos: cafe.photos
            }))}
            center={userLocation}
            onCafeClick={handleCafeClick}
            className="w-full h-full"
          />
        </div>
      )}

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
            <span className="text-sm text-gray-600">Loading cafes...</span>
          </div>
        </div>
      )}

      {/* Cafe Detail Modal */}
      {selectedCafe && (
        <CafeDetailCard
          cafe={selectedCafe}
          onClose={() => setSelectedCafe(null)}
          onAddReview={handleAddReview}
        />
      )}

      {/* Review Modal */}
      {reviewingCafe && (
        <ReviewModal
          cafe={reviewingCafe}
          onClose={() => setReviewingCafe(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default MapPage;