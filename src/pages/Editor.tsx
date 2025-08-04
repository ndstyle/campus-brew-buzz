import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Camera, MapPin, Search, Star } from "lucide-react";

const Editor = () => {
  const [rating, setRating] = useState([7]);
  const [selectedCafe, setSelectedCafe] = useState("");
  const [reviewText, setReviewText] = useState("");

  const suggestedCafes = [
    { name: "Blue Bottle Coffee", location: "Greenwich Village", distance: "0.2 mi" },
    { name: "Joe Coffee", location: "NYU Campus", distance: "0.1 mi" },
    { name: "Starbucks Reserve", location: "Union Square", distance: "0.4 mi" }
  ];

  const categories = ["Atmosphere", "Coffee Quality", "Service", "Price", "WiFi"];

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Write Review</h1>
          <p className="text-muted-foreground">Share your coffee experience</p>
        </div>

        {/* Cafe Selection */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Select Cafe</h2>
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search for a cafe..."
              value={selectedCafe}
              onChange={(e) => setSelectedCafe(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nearby suggestions:</p>
            {suggestedCafes.map((cafe, index) => (
              <div 
                key={index}
                onClick={() => setSelectedCafe(cafe.name)}
                className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-foreground">{cafe.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {cafe.location} · {cafe.distance}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Rating */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Overall Rating</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate from 1-10</span>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-foreground">{rating[0]}</span>
              </div>
            </div>
            <Slider
              value={rating}
              onValueChange={setRating}
              max={10}
              min={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                {category}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Review Text */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Your Review</h2>
          <Textarea
            placeholder="Tell us about your experience... What made this coffee special? How was the atmosphere?"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-32 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {reviewText.length}/500 characters
          </p>
        </Card>

        {/* Photo Upload */}
        <Card className="p-4 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Add Photos</h2>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Tap to add photos</p>
            <Button variant="outline" size="sm">
              Choose Photos
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full h-12" size="lg">
            Publish Review
          </Button>
          <Button variant="outline" className="w-full h-12" size="lg">
            Save as Draft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Editor;