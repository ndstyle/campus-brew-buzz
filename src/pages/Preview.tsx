import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, MessageCircle, Share, MapPin, Clock } from "lucide-react";

const Preview = () => {
  const [isLiked, setIsLiked] = useState(false);

  const mockReview = {
    id: "1",
    user: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c108?w=32&h=32&fit=crop&crop=face",
      username: "@sarahc",
      university: "NYU"
    },
    cafe: {
      name: "Blue Bottle Coffee",
      location: "Greenwich Village",
      address: "54 Mint Plaza, New York, NY"
    },
    rating: 8.5,
    categories: ["Atmosphere", "Coffee Quality", "Service"],
    reviewText: "Absolutely loved this place! The atmosphere is perfect for studying with plenty of natural light and comfortable seating. Their single-origin pour-over was exceptional - rich, smooth, and perfectly balanced. The baristas are incredibly knowledgeable and friendly. Definitely my new go-to spot for morning coffee before classes.",
    photos: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop"
    ],
    timestamp: "2 hours ago",
    likes: 24,
    comments: 8
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Review Preview</h1>
          <p className="text-muted-foreground">How your review will appear to others</p>
        </div>

        {/* Review Card */}
        <Card className="p-4 mb-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={mockReview.user.avatar} alt={mockReview.user.name} />
              <AvatarFallback>{mockReview.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{mockReview.user.name}</h3>
                <Badge variant="secondary" className="text-xs">{mockReview.user.university}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{mockReview.user.username}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{mockReview.rating}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {mockReview.timestamp}
              </div>
            </div>
          </div>

          {/* Cafe Info */}
          <div className="mb-4">
            <h4 className="font-semibold text-foreground text-lg mb-1">{mockReview.cafe.name}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              {mockReview.cafe.location}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {mockReview.categories.map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          {/* Photos */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {mockReview.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>

          {/* Review Text */}
          <p className="text-foreground mb-4 leading-relaxed">
            {mockReview.reviewText}
          </p>

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-1 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-sm">{mockReview.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{mockReview.comments}</span>
              </button>
            </div>
            <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full h-12" size="lg">
            Looks Good - Publish
          </Button>
          <Button variant="outline" className="w-full h-12" size="lg">
            Edit Review
          </Button>
          <Button variant="ghost" className="w-full h-12" size="lg">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Preview;