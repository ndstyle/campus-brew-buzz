# API Documentation – Rateurcoffee

## Overview

This API powers the core functionality of the Rateurcoffee mobile app, focused on review-based discovery of local cafes. It is designed with a Beli-like UX: no visible latitude/longitude data is exposed to the client. Instead, the experience is fully driven through Google Places `place_id`s and metadata.

All endpoints follow RESTful conventions. Auth is JWT-based.

---

## Authentication

### POST /auth/signup

Registers a new user.

Request Body:
{
  "email": "user@example.com",
  "username": "coffeelover123",
  "password": "securepassword"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "u123", "username": "coffeelover123" }
}

---

### POST /auth/login

Authenticates user.

Request Body:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "u123", "username": "coffeelover123" }
}

---

## Coffee Shops

### GET /api/coffee-shops?campus=campusName&search=optionalSearchTerm

Returns a paginated list of coffee shops linked to a campus, optionally filtered by name search.

Response:
{
  "coffee_shops": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "The Daily Grind",
      "address": "123 Campus St, University Town",
      "campus": "University of Washington",
      "rating_avg": 8.5,
      "rating_count": 125,
      "tags": ["Casual", "Outdoor Seating", "Brunch"],
      "price_level": 2
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}

Note: No latitude/longitude exposed; UI uses Google Places SDK with place_id for mapping.

---

### POST /api/coffee-shops/add

Adds a new coffee shop manually if not found in Google Places.

Request Body:
{
  "place_id": null,
  "name": "Hidden Bean Cafe",
  "address": "456 Hidden Lane, University Town",
  "campus": "University of Washington",
  "tags": ["Quiet", "Specialty"],
  "price_level": 1
}

Response:
{
  "success": true,
  "coffee_shop": { ... }
}

---

## Reviews

### POST /api/reviews

Submits a new review or updates an existing one for a user and coffee shop.

Request Body:
{
  "user_id": "u123",
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "rating": 9,          // integer 1-10 scale
  "blurb": "Great cold brew with smooth taste.",
  "photo_url": "https://storage.rateurcoffee.com/photos/abc123.jpg"
}

Response:
{
  "success": true,
  "review_id": "r456",
  "updated": false    // true if this was an update, false if new
}

---

### GET /api/reviews?place_id=PLACE_ID&sort=recent|popular

Fetches reviews for a specific coffee shop.

Response:
{
  "reviews": [
    {
      "review_id": "r456",
      "user": { "id": "u123", "username": "coffeelover123", "avatar_url": "https://..." },
      "rating": 9,
      "blurb": "Great cold brew with smooth taste.",
      "photo_url": "https://storage.rateurcoffee.com/photos/abc123.jpg",
      "created_at": "2025-08-01T12:34:56Z"
    },
    ...
  ]
}

---

### GET /api/feed?user_id=USER_ID&filter=recent|popular|friends

Returns feed of reviews relevant to the user.

Response:
{
  "feed": [
    {
      "review_id": "r456",
      "user": { "id": "u123", "username": "coffeelover123" },
      "coffee_shop": {
        "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
        "name": "The Daily Grind",
        "rating_avg": 8.5
      },
      "rating": 9,
      "blurb": "Great cold brew with smooth taste.",
      "photo_url": "https://storage.rateurcoffee.com/photos/abc123.jpg",
      "created_at": "2025-08-01T12:34:56Z"
    },
    ...
  ]
}

---

## User Profiles & Social

### GET /api/users/:user_id

Fetches public profile info and stats.

Response:
{
  "user": {
    "id": "u123",
    "username": "coffeelover123",
    "full_name": "Jane Doe",
    "avatar_url": "https://...",
    "member_since": "2024-09-01T00:00:00Z",
    "review_count": 32,
    "photo_count": 18,
    "leaderboard_rank": 25
  }
}

---

### POST /api/follow

User follows or unfollows another user.

Request Body:
{
  "follower_id": "u123",
  "followee_id": "u456",
  "action": "follow"    // or "unfollow"
}

Response:
{
  "success": true,
  "following": true
}

---

## Leaderboard

### GET /api/leaderboard?campus=campusName&scope=friends|global

Returns ranking based on number and quality of reviews.

Response:
{
  "leaderboard": [
    {
      "user_id": "u123",
      "username": "coffeelover123",
      "rank": 1,
      "score": 300,
      "reviews": 50,
      "photos": 20
    },
    ...
  ]
}

---

## Rate Limiting & Error Codes

- Max 10 review submissions per hour per user.
- 429 Too Many Requests if rate limit exceeded.
- 400 Bad Request for validation errors.
- 401 Unauthorized if auth token is invalid or expired.
- 404 Not Found if resource does not exist.
- 500 Internal Server Error for unexpected failures.

---

## Notes on Map Integration

- The client uses Google Places API SDK for map display and place details.
- All map-related lookups use place_id as the unique key.
- No lat/lng coordinates are returned by the API; map pins and geolocation are handled client-side via Google Places.
- When user adds a new coffee shop manually, backend stores it with no Google place_id and flags for moderation.
- Location-based filtering is done by campus name and pre-defined campus areas.

---

This API design keeps user experience aligned with Beli-style flow: hiding raw geo data, relying on Google Places place_ids, and focusing on social discovery via ratings and friends.

