import { useState, useEffect } from "react";
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
import CafeSearchAutocomplete from "@/components/CafeSearchAutocomplete";
import { type CafeResult } from "@/hooks/useCafeSearch";
import { useUserCampus } from "@/hooks/useUserCampus";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";

interface EditorProps {
  onBack?: () => void;
  onReviewSubmitted?: () => void;
  prefilledCafe?: CafeResult | null; // Autofill cafe from map selection
  mapCafes?: any[]; // Pass map cafes for search
}

const Editor = ({ onBack, onReviewSubmitted, prefilledCafe, mapCafes }: EditorProps) => {
  const [step, setStep] = useState<'search' | 'review'>(prefilledCafe ? 'review' : 'search');
  const [selectedCafe, setSelectedCafe] = useState<CafeResult | null>(prefilledCafe || null);
  const [rating, setRating] = useState([7]);
  const [reviewText, setReviewText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Initialize hooks BEFORE useEffect to prevent "cannot access before initialization" error
  const { submitReview, isSubmitting } = useReviews();
  const { user } = useAuth();
  const { campus, loading: campusLoading } = useUserCampus();
  const { uploadPhoto, uploading: photoUploading } = usePhotoUpload();

  // Log autofill functionality and transform map data if needed
  useEffect(() => {
    if (prefilledCafe) {
      console.log('🎯 [EDITOR] Autofilled with cafe from map:', prefilledCafe);
      
      // If the cafe data is from map markers, it might need transformation
      // Map data structure vs Editor expected structure with safe null checks
      const transformedCafe = {
        ...prefilledCafe,
        // Ensure we have the right field names with proper null/undefined handling
        geoapify_place_id: prefilledCafe.geoapify_place_id || (prefilledCafe as any).place_id || null,
        address: prefilledCafe.address || (prefilledCafe as any).vicinity || '',
        campus: prefilledCafe.campus || campus || 'Unknown Campus', // Safe fallback
        lat: prefilledCafe.lat || (prefilledCafe as any).latitude,
        lng: prefilledCafe.lng || (prefilledCafe as any).longitude
      };
      
      console.log('🎯 [EDITOR] Transformed cafe data:', transformedCafe);
      
      // Update the selected cafe if there were any transformations
      // Use shallow comparison instead of JSON.stringify to avoid circular reference issues
      const hasChanges = transformedCafe.geoapify_place_id !== prefilledCafe.geoapify_place_id ||
                        transformedCafe.address !== prefilledCafe.address ||
                        transformedCafe.campus !== prefilledCafe.campus;
      
      if (hasChanges) {
        setSelectedCafe(transformedCafe);
      }
    }
  }, [prefilledCafe, campus]); // Now campus is safely initialized

  const suggestedCafes = [
    { id: "blue-bottle-village", name: "Blue Bottle Coffee", location: "Greenwich Village", distance: "0.2 mi" },
    { id: "joe-coffee-nyu", name: "Joe Coffee", location: "NYU Campus", distance: "0.1 mi" },
    { id: "starbucks-union-sq", name: "Starbucks Reserve", location: "Union Square", distance: "0.4 mi" }
  ];

  const categories = ["Atmosphere", "Coffee Quality", "Service", "Price", "WiFi"];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCafe) {
      newErrors.cafe = "Please select a cafe";
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

    if (!selectedCafe) return;

    console.log("🔍 Selected cafe object:", selectedCafe);
    console.log("🔍 Cafe UUID (selectedCafe.id):", selectedCafe.id);
    console.log("🔍 Cafe GEOAPIFY Place ID (selectedCafe.geoapify_place_id):", selectedCafe.geoapify_place_id);
    console.log("🔍 ID type:", typeof selectedCafe.id);
    console.log("🔍 GEOAPIFY Place ID type:", typeof selectedCafe.geoapify_place_id);

    // Sanitize cafe data to ensure only serializable values are included
    const sanitizedCafe = {
      id: selectedCafe.id,
      name: selectedCafe.name,
      address: selectedCafe.address,
      campus: selectedCafe.campus,
      geoapify_place_id: selectedCafe.geoapify_place_id,
      lat: selectedCafe.lat,
      lng: selectedCafe.lng
    };

    const reviewData: ReviewSubmission = {
      cafeId: sanitizedCafe.id, // Use the UUID for database operations if exists
      cafeName: sanitizedCafe.name,
      rating: rating[0], // Keep exact decimal value (1-10, step 0.1)
      notes: reviewText.trim(),
      photoUrl: uploadedPhotoUrl || undefined,
      geoapifyPlaceId: sanitizedCafe.geoapify_place_id, // Pass GEOAPIFY Place ID separately
      // Include cafe details for creation if cafe doesn't exist in database (empty ID)
      cafeDetails: !sanitizedCafe.id || sanitizedCafe.id.startsWith('custom-') ? {
        name: sanitizedCafe.name,
        address: sanitizedCafe.address || (selectedCafe as any).vicinity || 'Unknown Address',
        campus: sanitizedCafe.campus || campus || 'Unknown Campus',
        geoapify_place_id: sanitizedCafe.geoapify_place_id || (selectedCafe as any).place_id,
        lat: sanitizedCafe.lat || (selectedCafe as any).geometry?.location?.lat,
        lng: sanitizedCafe.lng || (selectedCafe as any).geometry?.location?.lng
      } : undefined
    };

    console.log("📤 Review data being submitted:", reviewData);
    console.log("🏪 Cafe already exists in DB:", !!selectedCafe.id);
    console.log("🏪 Will create new cafe:", !selectedCafe.id && !!reviewData.cafeDetails);
    console.log("🏪 GEOAPIFY Place ID for cafe:", reviewData.cafeDetails?.geoapify_place_id || selectedCafe.geoapify_place_id);

    try {
      const result = await submitReview(reviewData);
      
      if (!result) {
        console.error("❌ [EDITOR] Review submission failed - no result returned");
        return;
      }
      
      console.log("✅ [EDITOR] Review submitted successfully:", result);
      
      // Reset form
      setStep('search');
      setSelectedCafe(null);
      setRating([7]);
      setReviewText("");
      setUploadedPhotoUrl(null);
      setErrors({});
      
      // Call callback to refresh feed
      onReviewSubmitted?.();
      
      // Go back to feed
      onBack?.();
      
    } catch (error: any) {
      console.error("❌ [EDITOR] Review submission error:", error);
      setErrors({ 
        submit: error.message || 'Failed to submit review. Please try again.' 
      });
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving to local storage or database
    console.log("Save as draft functionality to be implemented");
  };

  const handleCafeSelected = (cafe: CafeResult) => {
    console.log("✅ [EDITOR] Cafe selected:", cafe);
    setSelectedCafe(cafe);
    setStep('review');
  };

  const handleAddNewCafe = (cafeName: string) => {
    console.log("➕ [EDITOR] Adding new cafe:", cafeName);
    // Create a temporary cafe object for new cafes (no ID means it will be created in database)
    const newCafe: CafeResult = {
      id: "", // Empty ID signals this needs to be created in database
      name: cafeName,
      campus: campus || 'Unknown Campus'
    };
    console.log("✅ [EDITOR] New cafe created:", newCafe);
    setSelectedCafe(newCafe);
    setStep('review');
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const photoUrl = await uploadPhoto(file);
    if (photoUrl) {
      setUploadedPhotoUrl(photoUrl);
    }
  };

  const handleBackToSearch = () => {
    setStep('search');
    setErrors({});
  };

  // Show cafe search first
  if (step === 'search') {
    // Show loading if we're still getting campus info
    if (campusLoading) {
      return (
        <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    return (
      <CafeSearchAutocomplete
        onCafeSelected={handleCafeSelected}
        onAddNewCafe={handleAddNewCafe}
        onBack={onBack}
        campus={campus || undefined}
        mapCafes={mapCafes}
      />
    );
  }

  // Redirect to search if no cafe is selected
  if (!selectedCafe) {
    return (
      <CafeSearchAutocomplete
        onCafeSelected={handleCafeSelected}
        onAddNewCafe={handleAddNewCafe}
        onBack={onBack}
        campus={campus || undefined}
        mapCafes={mapCafes}
      />
    );
  }

  // Show review form after cafe is selected
  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Button variant="ghost" size="icon" onClick={handleBackToSearch} disabled={isSubmitting}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
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

        {/* Selected Cafe Display */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Selected Cafe</h2>
          {selectedCafe ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-foreground">{selectedCafe.name}</h3>
                  {selectedCafe.address && (
                    <p className="text-sm text-muted-foreground">{selectedCafe.address}</p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToSearch}
                disabled={isSubmitting}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">No cafe selected</p>
              <Button 
                variant="outline" 
                onClick={handleBackToSearch}
                disabled={isSubmitting}
              >
                Select a Cafe
              </Button>
            </div>
          )}
        </Card>

        {/* Rating */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Overall Rating</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate from 1-10</span>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-foreground">{rating[0].toFixed(1)}</span>
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
          {uploadedPhotoUrl ? (
            <div className="space-y-3">
              <img 
                src={uploadedPhotoUrl} 
                alt="Review photo" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setUploadedPhotoUrl(null)}
                disabled={isSubmitting}
              >
                Remove Photo
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Add a photo (max 10MB, JPG/PNG only)</p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={isSubmitting || photoUploading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isSubmitting || photoUploading}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                {photoUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Choose Photo'
                )}
              </Button>
            </div>
          )}
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