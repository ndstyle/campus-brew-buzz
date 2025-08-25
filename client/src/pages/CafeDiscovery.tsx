import React, { useState, useEffect } from 'react';
import { CafeMap } from '../components/CafeMap';
import { CafeDetailCard } from '../components/CafeDetailCard';
import { ReviewModal } from '../components/ReviewModal';
import { useMapDataGeoapify } from '../hooks/useMapDataGeoapify';
import { Search, Filter, List } from 'lucide-react';

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

export const CafeDiscovery: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviewingCafe, setReviewingCafe] = useState<Cafe | null>(null);
  const [showList, setShowList] = useState(false);
  const { cafes, loading, error, fetchCafes } = useMapDataGeoapify();

  useEffect(() => {
    // Auto-get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          fetchCafes('University of California, Los Angeles', { lat: coords[0], lng: coords[1] });
        },
        (error) => {
          console.error('Location error:', error);
          // Default to UCLA area
          const defaultCoords: [number, number] = [34.0689, -118.4452];
          setUserLocation(defaultCoords);
          fetchCafes('University of California, Los Angeles', { lat: defaultCoords[0], lng: defaultCoords[1] });
        }
      );
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
    console.log('Submitting review:', review);
    // TODO: Submit to your backend
    setReviewingCafe(null);
  };

  if (loading && !userLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding cafes near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Search Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">rateurcoffee</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Filter size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={() => setShowList(!showList)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <List size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      {userLocation && (
        <div className="pt-16">
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

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <button className="flex flex-col items-center py-2 px-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-500 mt-1">leaderboard</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-purple-600">
            <div className="w-6 h-6 bg-purple-600 rounded"></div>
            <span className="text-xs font-medium mt-1">find coffee</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-500 mt-1">search + review</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-500 mt-1">feed</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-500 mt-1">my profile</span>
          </button>
        </div>
      </div>

      {/* Cafe Detail Card Modal */}
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

      {/* Error state */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};