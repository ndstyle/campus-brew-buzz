import React from 'react';
import { X, Globe, Phone, Navigation, ChevronRight, Star, Users, Heart, Coffee } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
  const recScore = cafe.avgrating || 4.2;
  const friendScore = 4.1; // Mock friend score
  const friendsVisitedCount = 23; // Mock friend count
  
  // Mock friends who visited for social proof
  const friendsWhoVisited = [
    { name: 'Alex', avatar: 'A' },
    { name: 'Blake', avatar: 'B' },
    { name: 'Casey', avatar: 'C' },
    { name: 'Dana', avatar: 'D' },
    { name: 'Ellis', avatar: 'E' }
  ];

  // Mock photos for demo - in real app these would come from cafe.photos
  const mockPhotos = [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'
  ];

  // Mock recent reviews from friends
  const recentReviews = [
    { user: 'Alex', rating: 4.5, text: 'Amazing espresso!' },
    { user: 'Blake', rating: 4.0, text: 'Great atmosphere for studying' },
    { user: 'Casey', rating: 4.8, text: 'Love their cold brew' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-in-bottom border-t border-white/20">
        {/* Social Header */}
        <div className="relative h-40 bg-gradient-primary overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 glass-card rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
            data-testid="button-close-modal"
          >
            <X size={18} className="text-white" />
          </button>
          
          {/* Social Metrics Header */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{cafe.name}</h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{recScore}</span>
                  </div>
                  <span className="text-white/80">•</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-white/80" />
                    <span className="text-white/90 text-sm">{friendsVisitedCount} friends visited</span>
                  </div>
                </div>
              </div>
              <div className="avatar-cluster">
                {friendsWhoVisited.slice(0, 3).map((friend, index) => (
                  <Avatar key={index} className="avatar w-8 h-8 border-2 border-white">
                    <AvatarFallback className="bg-white text-primary text-xs font-medium">
                      {friend.avatar}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-10rem)] overflow-y-auto">

          {/* Cafe Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {priceString}
                </Badge>
                <Badge variant="outline">
                  {cafe.cuisine || 'Coffee & Café'}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                <Heart className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
            <p className="text-muted-foreground text-sm flex items-center">
              <Navigation className="h-4 w-4 mr-2 text-muted-foreground" />
              {cafe.address}
            </p>
          </div>

          {/* Friends Who Visited - Social Proof */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Friends who visited</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                See all {friendsVisitedCount}
              </Button>
            </div>
            <div className="avatar-cluster justify-start">
              {friendsWhoVisited.map((friend, index) => (
                <Avatar key={index} className="avatar w-10 h-10 border-2 border-background">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {friend.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
              {friendsVisitedCount > 5 && (
                <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground font-medium">
                  +{friendsVisitedCount - 5}
                </div>
              )}
            </div>
          </div>

          {/* Photos Gallery - Social Template Style */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {mockPhotos.map((photo, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <img 
                    src={photo} 
                    alt={`${cafe.name} photo ${i + 1}`} 
                    className="w-full h-24 rounded-xl object-cover transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-4 h-auto modern-card"
              data-testid="button-website"
            >
              <Globe size={20} className="text-muted-foreground mb-2" />
              <span className="text-xs font-medium">Website</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center p-4 h-auto modern-card"
              data-testid="button-call"
            >
              <Phone size={20} className="text-muted-foreground mb-2" />
              <span className="text-xs font-medium">Call</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`, '_blank')}
              className="flex flex-col items-center p-4 h-auto modern-card"
              data-testid="button-navigate"
            >
              <Navigation size={20} className="text-muted-foreground mb-2" />
              <span className="text-xs font-medium">Navigate</span>
            </Button>
          </div>

          {/* Social Review Button */}
          <Button 
            onClick={() => {
              console.log('🎯 Review button clicked for cafe:', cafe.name);
              onAddReview(cafe);
            }}
            className="w-full btn-social-primary py-6 text-lg font-semibold"
            data-testid="button-review-cafe"
          >
            <Coffee className="h-5 w-5 mr-2" />
            Review This Cafe
          </Button>

          {/* Social Template Score Cards */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Ratings</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Overall Score Card */}
              <div className="modern-card p-4 text-center">
                <div className="relative mb-3">
                  <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-white">{recScore}</span>
                  </div>
                  <Badge className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                    {cafe.ratingcount || 21}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-foreground">Overall</div>
                <div className="text-xs text-muted-foreground">Community rating</div>
              </div>

              {/* Friends Score Card */}
              <div className="modern-card p-4 text-center">
                <div className="relative mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-white">{friendScore}</span>
                  </div>
                  <Badge className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-xs px-1.5 py-0.5">
                    {friendsVisitedCount}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-foreground">Friends</div>
                <div className="text-xs text-muted-foreground">Your circle's rating</div>
              </div>
            </div>
          </div>

          {/* Recent Reviews from Friends */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Recent reviews</h3>
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                See all reviews
              </Button>
            </div>
            <div className="space-y-3">
              {recentReviews.map((review, i) => (
                <div key={i} className="modern-card p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {review.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground">{review.user}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};