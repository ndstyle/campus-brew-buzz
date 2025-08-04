# Test Plan & QA Checklist – Rateurcoffee

## Scope
Validate all user flows and backend interactions in the MVP before August 12.

---
## Functional Tests

### ✅ Review Submission
- Add review with and without photo
- Add review for new and existing cafe

### ✅ Feed
- Realtime updates work with 2 users logged in
- Photos and text render correctly

### ✅ Auth
- Magic link works via Supabase
- Prevents non-campus emails

### ✅ Map View
- Pins appear based on location
- Click to open detail modal

---
## Edge Cases
- Empty review text
- Long text wrapping
- Image upload >10MB
- Map fails to load

---
## Device Testing
- iPhone SE, XR, 14 Pro
- Android Pixel 6, Samsung A71
- Chrome, Safari, Firefox