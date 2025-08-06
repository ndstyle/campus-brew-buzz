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

    // Construct Google Places API URL for nearby search
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    placesUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY)
    placesUrl.searchParams.append('location', `${location.lat},${location.lng}`)
    placesUrl.searchParams.append('radius', radius.toString())
    placesUrl.searchParams.append('keyword', searchQuery)
    placesUrl.searchParams.append('type', 'cafe')

    console.log('Fetching places from:', placesUrl.toString())

    const response = await fetch(placesUrl.toString())
    const data = await response.json()

    if (!response.ok) {
      console.error('Google Places API error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch places from Google API', details: data }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform the response to match your frontend expectations
    const transformedResults = data.results?.map((place: any) => ({
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
        status: data.status,
        next_page_token: data.next_page_token
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
