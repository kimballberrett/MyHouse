# MyHouse - College Housing Finder

## App Summary

MyHouse helps college students find off-campus housing near BYU Provo. Students set preferences (budget, distance from campus, bedroom/bathroom counts), and the app uses those preferences to surface matching Craigslist listings scraped daily. A browse page lets users explore all listings with live filters.

**Live app:** deployed on Vercel, backed by Supabase.

## Tech Stack

### Frontend
- Next.js 16 (App Router, client components with React Query)
- React 19
- TypeScript 5
- Tailwind CSS 3 + shadcn/ui
- TanStack React Query 5

### Database
- Supabase (PostgreSQL) — `listings`, `user_preferences` tables
- Auth via Supabase Auth (UUID user IDs)

### Scraper
- Node.js script (`scraper/`) — runs on demand or on a schedule
- Fetches listings from Craigslist Provo (`provo.craigslist.org/search/apa`)
- Extracts title, price, beds, baths, lat/lng from HTML + JSON-LD
- Fetches individual listing pages to capture image URLs
- Upserts to Supabase via `@supabase/supabase-js`
- Local SQLite cache (`scraper/listings.db`) for deduplication

## Repository Layout

```
frontend/   Next.js app, components, lib, app routes
scraper/    Craigslist scraper (Node.js + Cheerio + Axios)
backend/    Legacy Express API (superseded by Supabase direct access)
```

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | latest |

## Deployment (Vercel)

The app is deployed on Vercel. Key config in `vercel.json`:

```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs"
}
```

Environment variables required in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Local Development

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp frontend/.env.example frontend/.env.local
```

Set in `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000.

## Running the Scraper

```bash
cd scraper
npm install
```

Set environment variables (copy from Supabase dashboard):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_service_role_key
```

Run:
```bash
node run.js
```

The scraper will:
1. Fetch ~120 listings from Craigslist Provo
2. Upsert all listings to Supabase
3. Visit each listing's detail page to scrape the image URL (300ms delay between requests)
4. Update `image_url` for each listing in Supabase

## Database Schema (Supabase)

### `listings`
| Column | Type | Notes |
|--------|------|-------|
| listing_id | bigint | primary key |
| title | text | |
| city | text | parsed from Craigslist location string |
| montly_rent | integer | |
| num_bedrooms | integer | nullable |
| num_bathrooms | integer | nullable |
| source_url | text | Craigslist listing URL |
| source_id | text | Craigslist post ID (unique key for upsert) |
| image_url | text | scraped from listing detail page |
| latitude | float | from JSON-LD structured data |
| longitude | float | from JSON-LD structured data |
| date_scraped | timestamptz | set on insert |

### `user_preferences`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | primary key |
| user_id | uuid | Supabase auth user ID |
| min_price | integer | |
| max_price | integer | |
| max_distance_miles | float | distance from BYU campus |

## App Routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in or create account via Supabase Auth |
| `/listings` | Daily summary — listings filtered by your saved preferences |
| `/browse` | All listings with interactive filters (price, beds, baths) |
| `/preferences` | Full preference setup (priority ranking + details) |
| `/preferences/quick` | Quick-edit preferences inline |

## Features

### Authentication
- Sign in / create account via Supabase Auth
- Protected routes redirect unauthenticated users to `/login`

### Listings Page (`/listings`)
- Shows listings filtered by your saved preferences (price range, distance from BYU campus)
- Calculates distance using Haversine formula from BYU coordinates (40.2518, -111.6493)
- Prompts to set up preferences if none are saved

### Browse Page (`/browse`)
- Shows all scraped listings (360+)
- **My Matches** button: instantly applies your saved preference filters
- **Filters popover**: live-updating filter panel with:
  - Price range (min/max)
  - Bedrooms (any / 1+ / 2+ / 3+ / 4+)
  - Bathrooms (any / 1+ / 2+ / 3+)
  - Amenities (when available)
  - Live match count preview
  - **Apply** to confirm, **Reset** to show all listings

### Listing Cards
- Listing image (scraped from Craigslist detail pages, served directly from Craigslist CDN)
- Price badge
- Distance from BYU campus (listings page only)
- Title, city, beds, baths
- Link to original Craigslist listing

### Preferences
- Full multi-step form: priority ranking + budget/distance details
- Quick-edit page for fast updates
- Preferences persist in Supabase and pre-populate on return visits

### Scraper
- Targets Provo Craigslist apartments ($300–$2500/mo)
- Deduplicates by Craigslist post ID (`source_id`)
- Scrapes images from individual listing detail pages with rate limiting
- Safe to re-run — upserts on conflict, updates image URLs

## OKR Progress

### Sprint 1 — Complete
- Preference page: ranking and housing preferences UI
- User authentication: create account and sign in
- File tree and navigation set up

### Sprint 2 — Complete
- Preferences persist in database after saving
- Browse page with real listings data
- Frontend connected to database end-to-end

### Sprint 3 — Complete
- Craigslist scraper collecting real listings into Supabase
- Listing images scraped and displayed on cards
- Listings page filters by saved user preferences
- Browse page with interactive filters and My Matches
- App deployed on Vercel (production)
- Migrated from local PostgreSQL + Express to Supabase
