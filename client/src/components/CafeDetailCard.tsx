import React from 'react';
import { X, MapPin, Phone, Globe, Calendar, Star, Camera, MessageCircle } from 'lucide-react';

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
  hours?: string;
  amenities?: string[];
}

interface CafeDetailCardProps {
  cafe: Cafe;
  onClose: () => void;
  onAddReview: (cafe: Cafe) => void;
}

export const CafeDetailCard: React.FC<CafeDetailCardProps> = ({ cafe, onClose, onAddReview }) => {
  const priceString = cafe.priceLevel ? '$'.repeat(cafe.priceLevel) : '$$';
  const recScore = cafe.avgrating || 0;
  const friendScore = (cafe.avgrating || 0) * 0.9; // Mock friend score

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[80vh] overflow-hidden mb-16">
        {/* Header with close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <X size={16} className="text-gray-600" />
          </button>
          
          {/* Mini map placeholder */}
          <div className="h-24 bg-gradient-to-br from-purple-400 to-purple-600 relative">
            <div className="absolute bottom-2 left-4 text-white text-sm font-medium">
              {cafe.name}
            </div>
          </div>
        </div>

        {/* Content with proper spacing */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Amenities/Tags */}
          {cafe.amenities && cafe.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cafe.amenities.map((amenity, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Cafe name and info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{cafe.name}</h2>
            <p className="text-sm text-gray-600">{cafe.address}</p>
          </div>

          {/* Quick actions */}
          <div className="flex space-x-3">
            <button className="flex-1 py-2 px-3 bg-gray-100 rounded-lg text-sm font-medium">
              Directions
            </button>
            <button className="flex-1 py-2 px-3 bg-gray-100 rounded-lg text-sm font-medium">
              Call
            </button>
            <button 
              onClick={() => onAddReview(cafe)}
              className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              Review
            </button>
          </div>

          {/* Rating display */}
          {cafe.avgrating ? (
            <div className="flex items-center space-x-4 py-3 bg-gray-50 rounded-lg px-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{cafe.avgrating.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">{cafe.ratingcount || 0}</div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">No reviews yet</p>
              <button 
                onClick={() => onAddReview(cafe)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium"
              >
                Be the first to review!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};