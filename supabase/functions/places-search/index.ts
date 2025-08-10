import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery, location, radius = 5000 } = await req.json()
    
    if (!searchQuery || !location) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: searchQuery and location' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
    
    console.log('🔑 API Key status:', {
      exists: !!GOOGLE_PLACES_API_KEY,
      length: GOOGLE_PLACES_API_KEY?.length || 0,
      firstChars: GOOGLE_PLACES_API_KEY?.substring(0, 10) || 'none'
    })
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('❌ GOOGLE_PLACES_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Multiple API calls to get comprehensive beverage spots
    const placeTypes = ['cafe', 'restaurant']; // Keep restaurant to catch tea/boba places
    const allResults: any[] = [];

    console.log('🔍 Fetching expanded places with multiple types and keywords...');

    for (const type of placeTypes) {
      const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
      placesUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY)
      placesUrl.searchParams.append('location', `${location.lat},${location.lng}`)
      placesUrl.searchParams.append('radius', radius.toString())
      placesUrl.searchParams.append('type', type)
      
      // Expanded keyword search to include boba, matcha, tea, coffee, etc.
      const expandedKeyword = `${searchQuery} OR coffee OR cafe OR espresso OR matcha OR boba OR tea OR "bubble tea"`
      placesUrl.searchParams.append('keyword', expandedKeyword)

      console.log(`Fetching ${type} places from:`, placesUrl.toString())

      try {
        const response = await fetch(placesUrl.toString())
        const data = await response.json()

        if (response.ok && data.results) {
          // Filter results to only include beverage-related places
          const beverageResults = data.results.filter((place: any) => {
            const name = place.name?.toLowerCase() || '';
            const types = place.types || [];
            
            // Include if name contains beverage keywords
            const hasKeyword = name.includes('coffee') || name.includes('cafe') || 
                              name.includes('espresso') || name.includes('matcha') || 
                              name.includes('boba') || name.includes('tea') || 
                              name.includes('bubble') || name.includes('latte') ||
                              name.includes('brew') || name.includes('roast') ||
                              name.includes('bean');
            
            // Include if it's a cafe type
            const isCafe = types.includes('cafe');
            
            return hasKeyword || isCafe;
          });
          
          allResults.push(...beverageResults);
          console.log(`✅ Found ${beverageResults.length} relevant ${type} places`);
        } else {
          console.error(`❌ Error fetching ${type} places:`, data);
        }
      } catch (error) {
        console.error(`❌ Network error fetching ${type} places:`, error);
      }
    }

    // Remove duplicates based on place_id
    const uniqueResults = allResults.filter((place, index, array) => 
      array.findIndex(p => p.place_id === place.place_id) === index
    );

    console.log(`🎯 Total unique beverage places found: ${uniqueResults.length}`);

    // Transform the response to match your frontend expectations
    const transformedResults = uniqueResults?.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      geometry: {
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        }
      },
      photos: place.photos?.map((photo: any) => ({
        photo_reference: photo.photo_reference,
        height: photo.height,
        width: photo.width
      })) || [],
      opening_hours: place.opening_hours,
      types: place.types
    })) || []

    return new Response(
      JSON.stringify({ 
        results: transformedResults,
        total_found: transformedResults.length,
        search_types: placeTypes
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
