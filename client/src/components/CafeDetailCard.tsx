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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[85vh] overflow-hidden">
        {/* Header with close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            <X size={16} className="text-gray-600" />
          </button>
          
          {/* Mini map */}
          <div className="h-32 bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20"></div>
            <div className="absolute bottom-2 left-4 text-white text-sm font-medium">
              {cafe.name}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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

          {/* Name and details */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{cafe.name}</h2>
            <div className="flex items-center text-gray-600 space-x-2 mb-1">
              <span className="font-medium">{priceString}</span>
              <span>•</span>
              <span>{cafe.cuisine || 'Cafe, Coffee'}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <MapPin size={16} className="mr-1" />
              <span className="text-sm">{cafe.address}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-4">
            {cafe.website && (
              <button className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Globe size={20} className="text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Website</span>
              </button>
            )}
            {cafe.phone && (
              <button className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Phone size={20} className="text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Call</span>
              </button>
            )}
            <button 
              onClick={() => onAddReview(cafe)}
              className="flex flex-col items-center p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              <Star size={20} className="mb-1" />
              <span className="text-xs">Review</span>
            </button>
          </div>

          {/* Scores section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Scores</h3>
            <div className="flex space-x-6">
              {/* Rec Score */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700">{recScore.toFixed(1)}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Rec Score</div>
                  <div className="text-sm text-gray-500">How much we think you'll like it</div>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-green-600 rounded-full text-white text-xs flex items-center justify-center">
                      {cafe.ratingcount || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Friend Score */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-700">{friendScore.toFixed(1)}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Friend Score</div>
                  <div className="text-sm text-gray-500">What your friends think</div>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">
                      1
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photos section */}
          {cafe.photos && cafe.photos.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Popular dishes</h3>
                <button className="text-sm text-purple-600 font-medium">See all photos</button>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {cafe.photos.slice(0, 3).map((photo, i) => (
                  <img key={i} src={photo} alt={`${cafe.name} photo ${i + 1}`} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                ))}
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-3">Add Photos</h3>
              <div className="flex space-x-2">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Camera size={20} className="text-gray-400" />
                </div>
                <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                  Be the first to add photos of this place!
                </div>
              </div>
            </div>
          )}

          {/* Add Review Button */}
          <button
            onClick={() => onAddReview(cafe)}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors"
          >
            Add Review
          </button>
        </div>
      </div>
    </div>
  );
};