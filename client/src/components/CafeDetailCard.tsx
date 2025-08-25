import React from 'react';
import { X, Globe, Phone, Navigation, ChevronRight } from 'lucide-react';

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
  const recScore = cafe.avgrating || 8.3;
  const friendScore = 8.2; // Mock friend score
  
  // Mock photos for demo - in real app these would come from cafe.photos
  const mockPhotos = [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-slide-in-bottom">
        {/* Header with mini map */}
        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <X size={16} className="text-gray-600" />
          </button>
          <div className="absolute bottom-3 left-4 text-gray-800 text-sm font-medium">
            {cafe.name}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[calc(85vh-8rem)] overflow-y-auto">

          {/* Name and details */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{cafe.name}</h2>
            <div className="text-sm text-gray-600 mb-1">
              {priceString} | {cafe.cuisine || 'italian, pizza'}
            </div>
            <div className="text-sm text-gray-500">{cafe.address}</div>
          </div>

          {/* Photos Carousel */}
          <div className="py-2">
            <div className="flex space-x-3 overflow-x-auto">
              {mockPhotos.map((photo, i) => (
                <img 
                  key={i} 
                  src={photo} 
                  alt={`${cafe.name} photo ${i + 1}`} 
                  className="w-32 h-20 rounded-lg object-cover flex-shrink-0" 
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Globe size={20} className="text-gray-600 mb-1" />
              <span className="text-xs text-gray-600">website</span>
            </button>
            <button className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Phone size={20} className="text-gray-600 mb-1" />
              <span className="text-xs text-gray-600">call</span>
            </button>
            <button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`, '_blank')}
              className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Navigation size={20} className="text-gray-600 mb-1" />
              <span className="text-xs text-gray-600">navigate</span>
            </button>
          </div>

          {/* Scores */}
          <div>
            <h3 className="text-lg font-semibold mb-3">scores</h3>
            <div className="flex space-x-6">
              {/* Rec Score */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-green-700">{recScore.toFixed(1)}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {cafe.ratingcount || 21}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">rec score</div>
                  <div className="text-xs text-gray-500">how much we think<br/>you will like it</div>
                </div>
              </div>

              {/* Friend Score */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-teal-700">{friendScore.toFixed(1)}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">friend score</div>
                  <div className="text-xs text-gray-500">what your<br/>friends think</div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular dishes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">popular dishes</h3>
              <button className="text-sm text-blue-600 font-medium">see all photos</button>
            </div>
            <div className="flex space-x-3 overflow-x-auto">
              {mockPhotos.map((photo, i) => (
                <img 
                  key={i} 
                  src={photo} 
                  alt={`dish ${i + 1}`} 
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0" 
                />
              ))}
              <button className="w-24 h-24 border border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                <ChevronRight size={16} />
                <span className="text-xs mt-1">all photos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};