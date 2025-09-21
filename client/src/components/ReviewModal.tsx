import React, { useState } from 'react';
import { X, Star, Camera, Users, Globe, Lock, Heart, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

interface ReviewModalProps {
  cafe: { id: string; name: string; address: string };
  onClose: () => void;
  onSubmit: (review: { rating: number; text: string; isPublic: boolean; shareToFeed: boolean; taggedFriends: string[] }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ cafe, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [shareToFeed, setShareToFeed] = useState(true);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showFriendTagger, setShowFriendTagger] = useState(false);

  // Mock friends for tagging
  const availableFriends = [
    { id: '1', name: 'Alex', avatar: 'A' },
    { id: '2', name: 'Blake', avatar: 'B' },
    { id: '3', name: 'Casey', avatar: 'C' },
    { id: '4', name: 'Dana', avatar: 'D' }
  ];

  const toggleFriendTag = (friendId: string) => {
    setTaggedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ 
      rating, 
      text: reviewText, 
      isPublic, 
      shareToFeed, 
      taggedFriends 
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        {/* Social Header */}
        <div className="bg-gradient-primary p-6 text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Share Your Experience</h2>
              <div className="flex items-center justify-center space-x-1">
                <Coffee className="h-4 w-4 text-white/80" />
                <span className="text-white/90 text-sm">{cafe.name}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
              data-testid="button-close-review"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cafe Location Badge */}
          <div className="text-center">
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
              📍 {cafe.address}
            </Badge>
          </div>

          {/* Social Rating System */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">How would you rate it?</h3>
              <div className="flex justify-center space-x-1 mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                      rating >= num
                        ? 'bg-gradient-primary text-white shadow-lg scale-110'
                        : 'modern-card text-muted-foreground hover:bg-muted hover:scale-105'
                    }`}
                    data-testid={`button-rating-${num}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="flex items-center justify-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {rating}/10
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Social Review Text */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Share your thoughts</h4>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What made this place special? Your friends want to know!"
              className="w-full h-24 p-4 modern-card border-0 resize-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground"
              data-testid="textarea-review"
            />
          </div>

          {/* Friend Tagging Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Tag friends</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFriendTagger(!showFriendTagger)}
                className="text-primary"
                data-testid="button-toggle-friends"
              >
                <Users className="h-4 w-4 mr-1" />
                {taggedFriends.length > 0 ? `${taggedFriends.length} tagged` : 'Add friends'}
              </Button>
            </div>
            
            {showFriendTagger && (
              <div className="modern-card p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableFriends.map(friend => (
                    <Button
                      key={friend.id}
                      variant={taggedFriends.includes(friend.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFriendTag(friend.id)}
                      className={`flex items-center space-x-2 ${
                        taggedFriends.includes(friend.id) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      data-testid={`button-tag-friend-${friend.id}`}
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs">
                          {friend.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{friend.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Sharing Options */}
          <div className="modern-card p-4 space-y-4">
            <h4 className="font-medium text-foreground">Privacy & Sharing</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Make public</span>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                data-testid="switch-public"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Share to feed</span>
              </div>
              <Switch
                checked={shareToFeed}
                onCheckedChange={setShareToFeed}
                data-testid="switch-share-feed"
              />
            </div>
          </div>

          {/* Social Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full btn-social-primary py-6 text-lg font-semibold"
            data-testid="button-submit-review"
          >
            <Coffee className="h-5 w-5 mr-2" />
            Share Your Review
          </Button>
        </div>
      </div>
    </div>
  );
};