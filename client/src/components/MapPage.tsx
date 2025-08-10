import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMapData } from "@/hooks/useMapData";
import { useUniversities } from '@/hooks/useUniversities';
import { useUserCampus } from '@/hooks/useUserCampus';
import GoogleMap from "@/components/Map/GoogleMap";

const MapPage = ({ onAddReview }) => {
  const { user } = useAuth();
  const { cafes, loading, error, fetchCafes, retryFetch, testGooglePlacesAPI, setMapCenter } = useMapData();
  const { getUniversityCoordinates, loading: universitiesLoading } = useUniversities();
  const { campus, loading: campusLoading } = useUserCampus();
  
  // Get initial map center based on user's college from database
  const [mapCenter, setLocalMapCenter] = useState(null);

  // Combined effect to prevent cascade re-renders - only run once when campus data is ready
  useEffect(() => {
    if (!campusLoading && campus && !universitiesLoading && !mapCenter) {
      console.log('🗺️ [MAP PAGE] Setting up map for campus:', campus);
      const coordinates = getUniversityCoordinates(campus);
      console.log('🗺️ [MAP PAGE] Campus coordinates:', coordinates);
      
      if (coordinates) {
        setLocalMapCenter(coordinates);
        setMapCenter(coordinates);
        
        // Fetch cafes and test API once
        console.log('🗺️ [MAP PAGE] Fetching cafes for campus:', campus);
        fetchCafes(campus, coordinates);
        testGooglePlacesAPI(coordinates);
      }
    }
  }, [campus, campusLoading, universitiesLoading, mapCenter]); // Remove function dependencies to prevent loops

  const handleAddReview = (cafe) => {
    console.log('🗺️ [MAP PAGE] Handling add review for cafe:', cafe);
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
              <p className="text-muted-foreground">
                {campusLoading || universitiesLoading ? 'Loading campus data...' : 'Loading map...'}
              </p>
              {!campusLoading && !universitiesLoading && (
                <p className="text-sm text-muted-foreground mt-2">
                  Campus: {campus || 'Unknown'}
                </p>
              )}
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