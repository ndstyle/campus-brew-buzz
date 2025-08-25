import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface ReviewModalProps {
  cafe: { id: string; name: string; address: string };
  onClose: () => void;
  onSubmit: (review: { rating: number; text: string }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ cafe, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, text: reviewText });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Rate & Review</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Cafe info */}
          <div className="text-center pb-2">
            <h3 className="font-semibold text-gray-900">{cafe.name}</h3>
            <p className="text-sm text-gray-600">{cafe.address}</p>
          </div>

          {/* Rating */}
          <div className="text-center">
            <p className="text-gray-700 mb-3">How would you rate it?</p>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`w-8 h-8 rounded-full text-sm font-bold ${
                    rating >= num
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xl font-bold text-purple-600">{rating}/10</p>
            )}
          </div>

          {/* Review text */}
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience... (optional)"
            className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};