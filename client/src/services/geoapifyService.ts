// Get API key from environment variables - ensure proper access
const getApiKey = () => {
  return import.meta.env.REACT_APP_GEOAPIFY_API_KEY || 
         import.meta.env.VITE_GEOAPIFY_API_KEY || 
         '6c8299f6962b421f95e5db9fed666e7c'; // Fallback for development
};

const API_KEY = getApiKey();

export interface GeoapifyPlace {
  place_id: string;
  properties: {
    name: string;
    formatted: string;
    lat: number;
    lon: number;
    categories: string[];
    contact?: {
      phone?: string;
      email?: string;
    };
    facilities?: {
      internet_access?: boolean;
      wheelchair?: boolean;
      outdoor_seating?: boolean;
    };
    opening_hours?: string;
    website?: string;
    datasource?: {
      sourcename: string;
      raw?: { osm_id?: number; };
    };
  };
}

export class GeoapifyService {
  private baseUrl = 'https://api.geoapify.com/v2';

  async searchCafesNearCampus(lat: number, lng: number, radius: number = 3000): Promise<GeoapifyPlace[]> {
    const currentApiKey = getApiKey();
    if (!currentApiKey) {
      console.error('❌ Geoapify API key missing from environment');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/places?categories=catering.cafe,catering.restaurant&filter=circle:${lng},${lat},${radius}&limit=50&apiKey=${currentApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Geoapify returned', data.features?.length || 0, 'cafes');
      return data.features || [];
    } catch (error) {
      console.error('❌ Error fetching cafes from Geoapify:', error);
      return [];
    }
  }

  async searchCafesByName(query: string, lat?: number, lng?: number): Promise<GeoapifyPlace[]> {
    const currentApiKey = getApiKey();
    if (!currentApiKey) return [];

    try {
      const biasParam = lat && lng ? `&bias=proximity:${lng},${lat}` : '';
      const response = await fetch(
        `${this.baseUrl}/places?categories=catering.cafe,catering.restaurant&text=${encodeURIComponent(query)}${biasParam}&limit=20&apiKey=${currentApiKey}`
      );
      
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('❌ Text search error:', error);
      return [];
    }
  }

  async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    const currentApiKey = getApiKey();
    if (!currentApiKey) return null;

    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${currentApiKey}`
      );
      
      const data = await response.json();
      if (data.features?.[0]) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return null;
    }
  }
}

export const geoapifyService = new GeoapifyService();