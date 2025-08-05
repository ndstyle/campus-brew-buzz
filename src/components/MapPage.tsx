import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMapData } from "@/hooks/useMapData";
import { getSchoolCoordinates } from "@/utils/schoolCoordinates";
import GoogleMap from "@/components/Map/GoogleMap";

const MapPage = ({ onAddReview }) => {
  const { user } = useAuth();
  const { cafes, loading, error, fetchCafes, retryFetch, testGooglePlacesAPI, setMapCenter: updateMapCenter } = useMapData();
  const [mapCenter, setMapCenter] = useState(null);

  // Get user's school coordinates
  useEffect(() => {
    if (user?.user_metadata?.college) {
      const coordinates = getSchoolCoordinates(user.user_metadata.college);
      console.log('🎯 [MAP PAGE] Setting map center for college:', user.user_metadata.college, coordinates);
      setMapCenter(coordinates);
      updateMapCenter(coordinates); // Also update the hook's map center
    } else {
      // Fallback to center US
      const fallbackCoords = { lat: 39.8283, lng: -98.5795, zoom: 4 };
      console.log('🎯 [MAP PAGE] No college found, using fallback coordinates:', fallbackCoords);
      setMapCenter(fallbackCoords);
      updateMapCenter(fallbackCoords);
    }
  }, [user, updateMapCenter]);

  // Fetch cafes when component mounts and map center is available
  useEffect(() => {
    if (mapCenter) {
      console.log('🚀 [MAP PAGE] Fetching cafes with center coordinates:', mapCenter);
      if (user?.user_metadata?.college) {
        fetchCafes(user.user_metadata.college, mapCenter);
      } else {
        fetchCafes(null, mapCenter);
      }
    }
  }, [user, fetchCafes, mapCenter]);

  // Test Google Places API when map center is available
  useEffect(() => {
    if (mapCenter && testGooglePlacesAPI) {
      console.log('🧪 [MAP PAGE] Testing Google Places API...');
      testGooglePlacesAPI(mapCenter);
    }
  }, [mapCenter, testGooglePlacesAPI]);

  const handleAddReview = (cafe) => {
    if (onAddReview) {
      onAddReview(cafe);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between py-4 px-4">
          <h1 className="text-xl font-bold">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-screen pt-16">
        {mapCenter ? (
          <GoogleMap
            center={mapCenter}
            zoom={mapCenter.zoom}
            cafes={cafes}
            onAddReview={handleAddReview}
            loading={loading}
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute top-20 left-4 right-4 z-20">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-destructive">Failed to load coffee shops</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={retryFetch}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;