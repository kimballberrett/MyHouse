# OurHouse — College Housing Finder

## App Summary

Finding off-campus housing as a college student is stressful: listings are scattered across Facebook Marketplace, Craigslist, and word-of-mouth, making it easy to miss a great option or overpay. OurHouse solves this by giving students a single, preference-driven hub for discovering nearby housing contracts. The primary user is a college student searching for an affordable room or apartment within a short commute of campus. Students set their preferences — maximum monthly rent, maximum distance from campus, and a ranked priority list of factors like price, location, and amenities — and the app surfaces matching listings with photos and direct links to contact landlords. Preferences are persisted in a PostgreSQL database, so they survive page refreshes and browser restarts without the student needing to re-enter them. The stack is intentionally lean — a Next.js frontend, an Express REST API, and PostgreSQL — so the architecture is easy to reason about and extend as the product grows.

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router, React Server Components)
- React 19
- TypeScript 5.7
- Tailwind CSS 3 + shadcn/ui component library
- TanStack React Query 5 (data fetching & cache management)

**Backend**
- Node.js 18+
- Express 4
- `pg` (node-postgres) driver

**Database**
- PostgreSQL (any recent version, 14+)

---

## Architecture Diagram

```
┌──────────────────────────┐
│   Browser (port 3000)    │
│   Next.js / React Query  │
└────────────┬─────────────┘
             │  HTTP (fetch)
             ▼
┌──────────────────────────┐
│  Express API (port 3001) │
│  GET  /api/preferences   │
│  PUT  /api/preferences   │
└────────────┬─────────────┘
             │  pg Pool
             ▼
┌──────────────────────────┐
│  PostgreSQL              │
│  database: myhouse       │
│  tables: users,          │
│    user_preferences,     │
│    listings,             │
│    saved_listings,       │
│    amenities,            │
│    listing_amenities,    │
│    listing_images        │
└──────────────────────────┘
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| pnpm | latest | `npm install -g pnpm` |
| PostgreSQL | 14+ | https://www.postgresql.org/download/ |
| psql (CLI) | bundled with Postgres | verify with `psql --version` |

Verify everything is installed:

```bash
node --version      # v18.x or higher
pnpm --version      # any recent version
psql --version      # psql (PostgreSQL) 14.x or higher
```

---

## Installation & Setup

### 1. Create the database

```bash
createdb myhouse
```

### 2. Apply the schema

```bash
psql -d myhouse -f db/schema.sql
```

### 3. Seed the database

```bash
psql -d myhouse -f db/seed.sql
```

### 4. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and confirm the `DATABASE_URL` matches your local Postgres setup:

```
DATABASE_URL=postgresql://localhost:5432/myhouse
PORT=3001
```

If your Postgres requires a username/password, update the URL:
`postgresql://username:password@localhost:5432/myhouse`

### 5. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 6. Install frontend dependencies

```bash
pnpm install
```

---

## Running the Application

You need **two terminals** running simultaneously.

**Terminal 1 — Backend (Express API)**

```bash
cd backend
npm run dev
```

You should see: `Backend running on http://localhost:3001`

**Terminal 2 — Frontend (Next.js)**

```bash
pnpm dev
```

You should see: `Ready on http://localhost:3000`

Open **http://localhost:3000** in your browser.

---

## Verifying the Vertical Slice

The working button is **"Save & View Listings"** on the Preferences page. This button sends all preference data to the Express backend, which writes it to the `user_preferences` table in PostgreSQL and returns the updated record. The UI then navigates to Listings. On the next visit to Preferences, the saved values are loaded from the database — not from component state — so they persist across refreshes and browser restarts.

### Step-by-step

1. Open **http://localhost:3000/preferences** in your browser.
2. **Step 1 — Rank Your Priorities:** Use the arrow buttons to reorder the list. For example, move **Location** to rank 1 (top of the list).
3. Click **Continue**.
4. **Step 2 — Your Preferences:**
   - Drag the rent slider to **$600**.
   - Set distance to **1 mile**.
   - Select **Weekly Updates** for notification frequency.
5. Click **Save & View Listings**. You will be redirected to the Listings page.
6. Navigate back to **http://localhost:3000/preferences**.
7. The form reopens with your saved values pre-filled: rent shows $600, distance shows 1 mile, Weekly Updates is selected, and Location is ranked first.
8. **Refresh the page** (Cmd+R / Ctrl+R). The values are still there — they are coming from the database, not React state.

### Confirm in the database

```bash
psql -d myhouse -c "SELECT max_price, max_distance_miles, price_rank, location_rank FROM user_preferences WHERE user_id = 1;"
```

Expected output after saving the example values above:

```
 max_price | max_distance_miles | price_rank | location_rank
-----------+--------------------+------------+---------------
       600 |                1.0 |          2 |             1
(1 row)
```

Check notification frequency (stored on the users table):

```bash
psql -d myhouse -c "SELECT notification_frequency FROM users WHERE user_id = 1;"
```

Expected output:

```
 notification_frequency
------------------------
 weekly
(1 row)
```

### Reset and test again

```bash
psql -d myhouse -f db/schema.sql
psql -d myhouse -f db/seed.sql
```

This recreates all 7 tables and restores the original seed values (max_price=800, max_distance_miles=2.0, price ranked first).
