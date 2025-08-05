import { Star, MapPin, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CafeInfoCard = ({ cafe, onClose, onAddReview }) => {
  const handleAddReview = () => {
    onAddReview?.(cafe);
    onClose();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
              ? 'fill-yellow-400/50 text-yellow-400' 
              : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto animate-fade-in"
        onClick={onClose}
      />
      
      {/* Card */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto animate-slide-in-bottom">
        <Card className="m-4 p-6 bg-background/95 backdrop-blur-sm border shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {cafe.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  {renderStars(cafe.averageRating || 0)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {cafe.averageRating > 0 ? cafe.averageRating.toFixed(1) : 'No ratings'}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({cafe.reviewCount || 0} review{cafe.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
              
              {/* Address */}
              {cafe.address && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{cafe.address}</span>
                </div>
              )}
            </div>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* User's review indicator */}
          {cafe.hasUserReview && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary font-medium">
                ✓ You've reviewed this place
              </p>
            </div>
          )}
          
          {/* Action Button */}
          <Button 
            onClick={handleAddReview}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {cafe.hasUserReview ? 'Add Another Review' : 'Add Review'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CafeInfoCard;