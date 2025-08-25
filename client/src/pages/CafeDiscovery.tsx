import React, { useState, useEffect } from 'react';
import { CafeMap } from '@/components/CafeMap';
import { useMapDataGeoapify } from '@/hooks/useMapDataGeoapify';
import { useUserCampus } from '@/hooks/useUserCampus';
import { useUniversities } from '@/hooks/useUniversities';
import { useToast } from '@/hooks/use-toast';
import { Coffee, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  averageRating?: number;
  reviewCount?: number;
  campus: string;
  geoapify_place_id?: string;
  google_place_id?: string; // Keep for backward compatibility
  hasUserReview?: boolean;
}

export const CafeDiscovery: React.FC = () => {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  
  // Get user's campus and coordinates
  const { campus: userCampus, loading: campusLoading } = useUserCampus();
  const { getUniversityCoordinates } = useUniversities();
  
  // Use new Geoapify-based data hook
  const {
    cafes,
    loading,
    error,
    fetchCafes,
    retryFetch,
    testGeoapifyAPI,
    setMapCenter
  } = useMapDataGeoapify();

  // Initialize location and fetch data
  useEffect(() => {
    const initializeLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserLocation(coords);
            setMapCenter({ lat: coords[0], lng: coords[1] });
            console.log('📍 User location obtained:', coords);
          },
          (error) => {
            console.error('❌ Geolocation error:', error);
            // Fall back to campus coordinates
            if (userCampus) {
              const campusCoords = getUniversityCoordinates(userCampus);
              const coords: [number, number] = [campusCoords.lat, campusCoords.lng];
              setUserLocation(coords);
              setMapCenter({ lat: coords[0], lng: coords[1] });
              console.log('📍 Using campus coordinates:', coords);
            }
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        console.warn('⚠️ Geolocation not supported');
        // Fall back to campus coordinates
        if (userCampus) {
          const campusCoords = getUniversityCoordinates(userCampus);
          const coords: [number, number] = [campusCoords.lat, campusCoords.lng];
          setUserLocation(coords);
          setMapCenter({ lat: coords[0], lng: coords[1] });
        }
      }
    };

    if (!campusLoading) {
      initializeLocation();
    }
  }, [userCampus, campusLoading, getUniversityCoordinates, setMapCenter]);

  // Fetch cafes when we have location - only once
  useEffect(() => {
    if (userLocation && !loading && cafes.length === 0) {
      const center = { lat: userLocation[0], lng: userLocation[1] };
      fetchCafes(userCampus, center);
    }
  }, [userLocation, userCampus]); // Remove fetchCafes dependency to prevent loops

  const handleCafeClick = (cafe: Cafe) => {
    console.log('🏪 Cafe clicked:', cafe.name);
    setSelectedCafe(cafe);
    
    // Show basic info in toast for now
    toast({
      title: cafe.name,
      description: `${cafe.address} - ${cafe.averageRating ? `${cafe.averageRating}/10` : 'No reviews yet'}`,
    });
  };

  const handleTestAPI = async () => {
    if (userLocation) {
      await testGeoapifyAPI({ lat: userLocation[0], lng: userLocation[1] });
    } else {
      toast({
        title: "No Location",
        description: "Please enable location services to test the API",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (campusLoading || (!userLocation && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="font-medium">Getting your location...</h3>
            <p className="text-sm text-muted-foreground">Finding cafes near your campus</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !cafes.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Coffee className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-medium text-foreground">Unable to load cafes</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={retryFetch} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default location if no user location
  const mapCenter: [number, number] = userLocation || [34.0689, -118.4452]; // UCLA default

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover Cafes</h1>
          <p className="text-muted-foreground">
            {userCampus ? `Near ${userCampus}` : 'Near your location'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTestAPI} variant="outline" size="sm">
            Test API
          </Button>
          <Button onClick={retryFetch} variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {cafes.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Coffee className="h-4 w-4" />
            <span>{cafes.length} cafes found</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>
              {cafes.filter(c => c.source === 'supabase').length} in database,{' '}
              {cafes.filter(c => c.source === 'geoapify').length} from Geoapify
            </span>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative">
        <CafeMap
          cafes={cafes.map(cafe => ({
            id: cafe.id,
            name: cafe.name,
            latitude: cafe.latitude || cafe.lat || 0,
            longitude: cafe.longitude || cafe.lng || 0,
            averageRating: cafe.averageRating,
            reviewCount: cafe.reviewCount,
            address: cafe.address || 'Address not available',
            campus: cafe.campus,
            hasUserReview: cafe.hasUserReview,
          }))}
          center={mapCenter}
          onCafeClick={handleCafeClick}
          className="w-full h-[500px]"
          zoom={15}
        />
        
        {loading && (
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading cafes...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected cafe info */}
      {selectedCafe && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold">{selectedCafe.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCafe.address}</p>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  Rating: {selectedCafe.averageRating ? `${selectedCafe.averageRating}/10` : 'No reviews yet'}
                </span>
                <span>
                  Reviews: {selectedCafe.reviewCount || 0}
                </span>
                <span>
                  Campus: {selectedCafe.campus}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};