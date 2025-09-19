// Enhanced type definitions for new features

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  first_name?: string;
  last_name?: string;
  college?: string;
  review_count: number;
  unique_cafes_count: number;
  followers_count: number;
  following_count: number;
  recent_reviews: RecentReview[];
}

export interface RecentReview {
  id: string;
  rating: number;
  blurb?: string;
  created_at: string;
  cafe: {
    id: string;
    name: string;
    address?: string;
  };
}

export interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  avgrating?: number;
  ratingcount?: number;
  cuisine?: string;
  priceLevel?: number;
  photos?: string[];
  phone?: string;
  website?: string;
  amenities?: string[];
  category?: string;
  cuisine_type?: string;
  price_range?: string;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ReviewWithTags {
  rating: number;
  text: string;
  taggedFriends: string[];
  isPublic: boolean;
  shareToFeed: boolean;
}

export interface CafeFilter {
  category: string;
  minRating: number;
  maxRating: number;
  priceRange: string[];
  cuisineType: string[];
}