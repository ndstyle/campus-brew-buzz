import React, { useState, useEffect } from 'react';
import { X, Star, Camera, Users, Globe, Lock, Heart, Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Friend, ReviewWithTags } from '@/types';

interface EnhancedReviewModalProps {
  cafe: { id: string; name: string; address: string };
  onClose: () => void;
  onSubmit: (review: ReviewWithTags) => void;
}

export const EnhancedReviewModal: React.FC<EnhancedReviewModalProps> = ({ cafe, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [shareToFeed, setShareToFeed] = useState(true);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showFriendTagger, setShowFriendTagger] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [availableFriends, setAvailableFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const { user } = useAuth();

  // Load user's friends for tagging
  useEffect(() => {
    const loadFriends = async () => {
      if (!user?.id) return;

      setLoadingFriends(true);
      try {
        // Get users that the current user follows (simplified friend system)
        const { data: followsData, error } = await supabase
          .from('follows')
          .select(`
            followee_id,
            users!follows_followee_id_fkey(
              id,
              username,
              first_name,
              last_name,
              profile_picture
            )
          `)
          .eq('follower_id', user.id);

        if (error) throw error;

        const friends: Friend[] = followsData
          ?.map((follow: any) => ({
            id: follow.users.id,
            name: follow.users.first_name && follow.users.last_name 
              ? `${follow.users.first_name} ${follow.users.last_name}`
              : follow.users.username,
            username: follow.users.username,
            avatar: follow.users.profile_picture
          }))
          .filter(friend => friend.name && friend.username) || [];

        setAvailableFriends(friends);
      } catch (error) {
        console.error('Error loading friends:', error);
      } finally {
        setLoadingFriends(false);
      }
    };

    if (showFriendTagger) {
      loadFriends();
    }
  }, [user?.id, showFriendTagger]);

  const filteredFriends = availableFriends.filter(friend =>
    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  const toggleFriendTag = (friendId: string) => {
    setTaggedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const getTaggedFriendNames = () => {
    return availableFriends
      .filter(friend => taggedFriends.includes(friend.id))
      .map(friend => friend.name)
      .join(', ');
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ 
      rating, 
      text: reviewText, 
      taggedFriends,
      isPublic, 
      shareToFeed
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
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
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500 characters
            </div>
          </div>

          {/* Enhanced Friend Tagging Section */}
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

            {/* Show tagged friends summary */}
            {taggedFriends.length > 0 && (
              <div className="modern-card p-3">
                <p className="text-sm text-muted-foreground mb-2">Tagged friends:</p>
                <p className="text-sm font-medium">{getTaggedFriendNames()}</p>
              </div>
            )}

            {showFriendTagger && (
              <Card className="p-4 space-y-3">
                {/* Friend Search */}
                <Input
                  placeholder="Search friends..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="text-sm"
                  data-testid="input-friend-search"
                />

                {/* Friends List */}
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {loadingFriends ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                      <p className="text-xs text-muted-foreground mt-2">Loading friends...</p>
                    </div>
                  ) : filteredFriends.length > 0 ? (
                    filteredFriends.map(friend => (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriendTag(friend.id)}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          taggedFriends.includes(friend.id) 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                        data-testid={`button-tag-friend-${friend.id}`}
                      >
                        <Avatar className="w-8 h-8">
                          {friend.avatar ? (
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                          ) : (
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {friend.name[0].toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{friend.name}</p>
                          <p className="text-xs text-muted-foreground">@{friend.username}</p>
                        </div>
                        {taggedFriends.includes(friend.id) && (
                          <Badge variant="secondary" className="text-xs">Tagged</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {friendSearchQuery ? 'No friends found' : 'No friends to tag'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Follow other users to tag them in reviews
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Social Sharing Options */}
          <div className="modern-card p-4 space-y-4">
            <h4 className="font-medium text-foreground">Privacy & Sharing</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-foreground">Make public</span>
                  <p className="text-xs text-muted-foreground">Anyone can see this review</p>
                </div>
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
                <div>
                  <span className="text-sm text-foreground">Share to feed</span>
                  <p className="text-xs text-muted-foreground">Show in your friends' feeds</p>
                </div>
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
            {taggedFriends.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                +{taggedFriends.length} friend{taggedFriends.length === 1 ? '' : 's'}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};