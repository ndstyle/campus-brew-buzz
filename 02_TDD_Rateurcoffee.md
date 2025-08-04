# Technical Design Document (TDD) – Rateurcoffee

## Overview
This document outlines the architectural and technical design for Rateurcoffee’s MVP platform using Supabase and React.

---
## 1. Tech Stack
- **Frontend**: React (mobile-first), TailwindCSS, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Hosting**: Lovable (Frontend), Supabase (DB/Auth)
- **Image Handling**: Supabase Storage

---
## 2. High-Level Architecture

```
[React Frontend] <---> [Supabase Auth / Realtime / Postgres / Storage]
```

---
## 3. Core Tables

### `users`
- `id (uuid)` – PK
- `name`
- `email`
- `school`
- `avatar_url`

### `cafes`
- `id`
- `name`
- `address`
- `lat`, `lng`
- `campus`
- `avg_rating`
- `num_reviews`

### `reviews`
- `id`
- `user_id` → FK: `users.id`
- `cafe_id` → FK: `cafes.id`
- `rating`
- `text`
- `photo_url`
- `created_at`

---
## 4. APIs & Integrations

### REST via Supabase Auto-Generated Endpoints
- GET `/cafes?campus=xyz`
- POST `/reviews`
- GET `/leaderboard`

### Supabase Auth
- Magic link login via email

---
## 5. Security
- RLS (Row Level Security) enabled
- Auth-based access to private user data
- Only review authors can edit/delete their reviews

---
## 6. Deployment
- Lovable(CI/CD)
- Supabase CLI for migrations

---
## 7. Open Questions
- Do we need analytics tooling (Posthog, Umami)?
- Will we pre-seed cafes or crowdsource them?