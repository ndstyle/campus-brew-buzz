import React, { useState } from 'react';
import { X, Camera, Star } from 'lucide-react';

interface Cafe {
  id: string;
  name: string;
  address: string;
}

interface ReviewModalProps {
  cafe: Cafe;
  onClose: () => void;
  onSubmit: (review: { rating: number; text: string; photos?: string[] }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ cafe, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = () => {
    if (rating === 0) return;
    
    onSubmit({
      rating,
      text: reviewText,
      photos
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Rate {cafe.name}</h2>
          <button onClick={onClose} className="p-1">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">How would you rate this place?</p>
            <div className="flex justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    rating >= num
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-2xl font-bold text-purple-600">{rating}/10</p>
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your experience (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you love? What could be better?"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add photos (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Camera size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Tap to add photos</p>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};