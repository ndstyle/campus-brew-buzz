import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Camera, MapPin, Search, Star, ArrowLeft, Loader2 } from "lucide-react";
import { useReviews, ReviewSubmission } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditorProps {
  onBack?: () => void;
  onReviewSubmitted?: () => void;
}

const Editor = ({ onBack, onReviewSubmitted }: EditorProps) => {
  const [rating, setRating] = useState([7]);
  const [selectedCafe, setSelectedCafe] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { submitReview, isSubmitting } = useReviews();
  const { user } = useAuth();

  const suggestedCafes = [
    { id: "blue-bottle-village", name: "Blue Bottle Coffee", location: "Greenwich Village", distance: "0.2 mi" },
    { id: "joe-coffee-nyu", name: "Joe Coffee", location: "NYU Campus", distance: "0.1 mi" },
    { id: "starbucks-union-sq", name: "Starbucks Reserve", location: "Union Square", distance: "0.4 mi" }
  ];

  const categories = ["Atmosphere", "Coffee Quality", "Service", "Price", "WiFi"];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCafe.trim()) {
      newErrors.cafe = "Please select or enter a cafe name";
    }

    if (rating[0] < 1 || rating[0] > 10) {
      newErrors.rating = "Rating must be between 1 and 10";
    }

    if (!reviewText.trim()) {
      newErrors.review = "Please write a review";
    } else if (reviewText.length < 10) {
      newErrors.review = "Review must be at least 10 characters long";
    } else if (reviewText.length > 500) {
      newErrors.review = "Review must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ auth: "Please sign in to submit a review" });
      return;
    }

    // Find the selected cafe or create a new one
    const selectedCafeData = suggestedCafes.find(cafe => cafe.name === selectedCafe);
    const cafeId = selectedCafeData?.id || `custom-${Date.now()}`;

    const reviewData: ReviewSubmission = {
      cafeId,
      cafeName: selectedCafe,
      rating: Math.round(rating[0] * 10) / 10, // Round to 1 decimal place
      notes: reviewText.trim(),
    };

    const result = await submitReview(reviewData);
    
    if (result) {
      // Reset form
      setSelectedCafe("");
      setRating([7]);
      setReviewText("");
      setErrors({});
      
      // Call callback to refresh feed
      onReviewSubmitted?.();
      
      // Go back to feed
      onBack?.();
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving to local storage or database
    console.log("Save as draft functionality to be implemented");
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} disabled={isSubmitting}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Write Review</h1>
              <p className="text-muted-foreground">Share your coffee experience</p>
            </div>
          </div>
        </div>

        {/* Auth Error */}
        {errors.auth && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{errors.auth}</AlertDescription>
          </Alert>
        )}

        {/* Cafe Selection */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Select Cafe</h2>
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search for a cafe..."
              value={selectedCafe}
              onChange={(e) => {
                setSelectedCafe(e.target.value);
                if (errors.cafe) {
                  setErrors(prev => ({ ...prev, cafe: "" }));
                }
              }}
              className={`pl-10 ${errors.cafe ? 'border-destructive' : ''}`}
              disabled={isSubmitting}
            />
            {errors.cafe && (
              <p className="text-sm text-destructive mt-1">{errors.cafe}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nearby suggestions:</p>
            {suggestedCafes.map((cafe, index) => (
              <div 
                key={index}
                onClick={() => !isSubmitting && setSelectedCafe(cafe.name)}
                className={`flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                } ${selectedCafe === cafe.name ? 'bg-muted border-primary' : ''}`}
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
              disabled={isSubmitting}
            />
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating}</p>
            )}
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
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
            onChange={(e) => {
              setReviewText(e.target.value);
              if (errors.review) {
                setErrors(prev => ({ ...prev, review: "" }));
              }
            }}
            className={`min-h-32 resize-none ${errors.review ? 'border-destructive' : ''}`}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${reviewText.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {reviewText.length}/500 characters
            </p>
          </div>
          {errors.review && (
            <p className="text-sm text-destructive mt-1">{errors.review}</p>
          )}
        </Card>

        {/* Photo Upload */}
        <Card className="p-4 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Add Photos</h2>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Tap to add photos</p>
            <Button variant="outline" size="sm" disabled={isSubmitting}>
              Choose Photos
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full h-12" 
            size="lg" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Review"
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12" 
            size="lg"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Editor;