# RateUrCoffee - Campus Coffee Review Platform

## Overview

RateUrCoffee is a mobile-first web application designed for college students to discover, rate, and review coffee shops on their campus. The platform combines social features with location-based services to create a community-driven coffee discovery experience.

The application allows users to:
- Search and review coffee shops using a 1-10 rating system
- Upload photos with their reviews
- Follow friends and see their recommendations
- Explore coffee shops on an interactive map
- View leaderboards of top reviewers and cafes
- Connect with other coffee enthusiasts on their campus

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom brand colors (primary purple #8B5FBF)
- **Build Tool**: Vite for development and production builds
- **State Management**: React Context for authentication, TanStack Query for server state
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth for user management and session handling
- **File Storage**: Supabase Storage for user-uploaded review photos
- **Edge Functions**: Supabase Edge Functions for serverless API endpoints

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing between client and server
- **Key Tables**: 
  - Users table with university affiliation
  - Cafes table with campus associations and Google Places integration
  - Reviews table with ratings, photos, and user connections
  - User stats and leaderboard data

### Authentication & Authorization
- **Provider**: Supabase Auth with email/password authentication
- **Session Management**: JWT tokens with automatic refresh
- **User Onboarding**: Multi-step flow collecting college affiliation and preferences
- **Authorization**: Row Level Security (RLS) policies for data access control

### Location Services
- **Maps Integration**: Google Maps API for cafe locations and search
- **Campus Coordination**: University database with geographic coordinates
- **Search Strategy**: Campus-scoped cafe discovery using Google Places API

### Mobile-First Design
- **Responsive Design**: Tailwind CSS with mobile breakpoints
- **Touch Interface**: Optimized for mobile interactions
- **Progressive Web App**: Configured for mobile installation
- **Bottom Navigation**: Native mobile app-style navigation

## External Dependencies

### Third-Party Services
- **Supabase**: Backend-as-a-Service for database, authentication, storage, and edge functions
- **Google Maps Platform**: Places API for cafe search and Maps API for location display
- **Neon Database**: PostgreSQL hosting (via @neondatabase/serverless)

### Key Libraries
- **UI Components**: @radix-ui/* for accessible, unstyled components
- **Styling**: tailwindcss, clsx, class-variance-authority for component styling
- **Data Fetching**: @tanstack/react-query for server state management
- **Forms**: react-hook-form with @hookform/resolvers for form validation
- **Database**: drizzle-orm with drizzle-kit for database operations and migrations
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Type Safety**: Full TypeScript coverage across client, server, and shared code
- **Development**: Replit-optimized with hot reloading and error overlays
- **Database Management**: Drizzle Kit for schema migrations and database introspection