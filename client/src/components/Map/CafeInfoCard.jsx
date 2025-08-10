import { Star, MapPin, Plus, X, Phone, Navigation, Globe, DollarSign, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CafeInfoCard = ({ cafe, onClose, onAddReview }) => {
  const handleAddReview = () => {
    console.log('🎯 [CAFE INFO CARD] Add Review clicked for cafe:', {
      name: cafe.name,
      id: cafe.id,
      google_place_id: cafe.google_place_id || cafe.place_id,
      address: cafe.address || cafe.vicinity,
      campus: cafe.campus
    });
    onAddReview?.(cafe);
    // Don't close immediately - let parent handle it
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 transition-all duration-300 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
            : i < rating 
              ? 'fill-yellow-400/50 text-yellow-400' 
              : 'text-muted-foreground/40'
        }`}
      />
    ));
  };

  const getPriceLevel = () => {
    const level = cafe.price_level;
    if (!level) return null;
    return '$'.repeat(Math.min(level, 4));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Enhanced Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto animate-fade-in"
        onClick={onClose}
      />
      
      {/* Beli-inspired Card */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto animate-slide-in-bottom">
        <div className="mx-4 mb-6">
          <Card className="bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border-0 shadow-2xl shadow-purple-500/10">
            {/* Main Content */}
            <div className="p-6 pb-4">
              {/* Header with Close Button */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  {/* Cafe Name - Large and Bold like Beli */}
                  <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight tracking-tight">
                    {cafe.name}
                  </h2>
                  
                  {/* Rating Section - Prominent like Beli */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                      {renderStars(cafe.averageRating || 0)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-foreground">
                        {cafe.averageRating > 0 ? cafe.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">
                        ({cafe.reviewCount || 0} review{cafe.reviewCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Price Level & Type */}
              <div className="flex items-center space-x-2 mb-4">
                {getPriceLevel() && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {getPriceLevel()}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300">
                  <Coffee className="h-3 w-3 mr-1" />
                  Coffee Shop
                </Badge>
              </div>
              
              {/* Address & Campus */}
              <div className="space-y-2 mb-6">
                {(cafe.address || cafe.vicinity) && (
                  <div className="flex items-start space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 text-purple-500" />
                    <span className="text-sm font-medium">{cafe.address || cafe.vicinity}</span>
                  </div>
                )}
                {cafe.campus && (
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium ml-6">
                    📍 {cafe.campus}
                  </div>
                )}
              </div>

              {/* User's review indicator */}
              {cafe.hasUserReview && (
                <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    You've reviewed this place
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Row - Beli style */}
            <div className="px-6 pb-6">
              <div className="flex space-x-3 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-10 text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-10 text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-10 text-muted-foreground hover:text-foreground border-muted-foreground/20 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
              </div>

              {/* Add Review Button - Primary Action */}
              <Button 
                onClick={handleAddReview}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {cafe.hasUserReview ? 'Add Another Review' : 'Add Review'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CafeInfoCard;