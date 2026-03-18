# OurHouse - College Housing Finder

## App Summary

OurHouse helps college students discover off-campus housing in one place. Students set preferences such as budget, distance from campus, and ranking priorities; the app stores those settings in PostgreSQL and uses them to drive the housing experience.

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3 + shadcn/ui
- TanStack React Query 5

### Backend
- Node.js 18+
- Express 4
- pg (node-postgres)

### Database
- PostgreSQL 14+

## Repository Layout

- frontend/: Next.js app and all frontend configs
- backend/: Express API and backend runtime config
- backend/migrations/: schema and seed SQL files

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | latest | bundled with Node.js |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |
| psql (CLI) | bundled with Postgres | verify with psql --version |

Verify installed tools:

```bash
node --version
npm --version
psql --version
```

## Installation and Setup

### 1. Create the database

```bash
createdb myhouse
```

### 2. Apply schema

```bash
psql -d myhouse -f backend/migrations/schema.sql
```

If your database already exists from an older setup, run:

```bash
psql -d myhouse -f backend/migrations/add_password_hash_to_users.sql
```

### 3. Seed database

```bash
psql -d myhouse -f backend/migrations/seed.sql
```

### 4. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Confirm values in backend/.env:

```env
DATABASE_URL=postgresql://localhost:5432/myhouse
PORT=3001
```

### 5. Configure frontend environment

```bash
cp frontend/.env.example frontend/.env.local
```

Required variable:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 6. Install backend dependencies

```bash
cd backend
npm install
```

### 7. Install frontend dependencies

```bash
cd frontend
npm install
```

## Running the Application

Use two terminals.

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Expected log:

```text
Backend running on http://localhost:3001
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000.

## Authentication

- Protected app routes (`/preferences`, `/listings`, `/notifications`) require sign-in.
- Go to `/login` and sign in with email + password from the `users` table.
- If the user does not exist, use the `Create Account` button on the login page.
- Seeded login: `demo@university.edu` / `demo1234`

## Verifying the Vertical Slice

### Preferences (End-to-End)

1. Open http://localhost:3000/preferences
2. Complete the two-step form:
   - **Step 1 (Rank):** Drag to reorder the 5 factors (price, location, rooms, sociability, amenities)
   - **Step 2 (Details):** Set budget (min/max price), distance from campus, and notification frequency
3. Click Save
4. Return to /preferences and verify your values persist

Check preferences in Postgres:

```bash
psql -d myhouse -c "SELECT max_price, max_distance_miles, price_rank, location_rank FROM user_preferences WHERE user_id = 1;"
```

Check notification frequency:

```bash
psql -d myhouse -c "SELECT notification_frequency FROM users WHERE user_id = 1;"
```

### Listings & Notifications (UI Present, Backend In Progress)

- **Listings** (`/listings`): Currently displays 5 mock listings that match the seed data. Backend API for dynamic listings is planned.
- **Notifications** (`/notifications`): The page renders correctly, but the GET `/api/notifications` and PUT `/api/notifications/mark-all-read` endpoints are not yet implemented. You can check seed data in the database:

```bash
psql -d myhouse -c "SELECT user_id, listing_id FROM saved_listings WHERE user_id = 1;"
```

## Reset Database

```bash
psql -d myhouse -f backend/migrations/schema.sql
psql -d myhouse -f backend/migrations/seed.sql
```
