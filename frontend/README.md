# Amaynu - Recommendation System

A modern recommendation system web application built with Next.js, React Query, Prisma, and Supabase.

## Features

- 🔐 **Authentication**: Sign up and login with email/password
- 🎵 **Music Recommendations**: Browse and like music tracks
- 🎬 **Film Recommendations**: Browse and like films
- 👤 **User Profile**: View your liked items and preferences
- 🎯 **Onboarding**: First-time user experience for selecting favorite artists
- 📊 **Dynamic Recommendations**: Artists update based on your selections

## Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Custom implementation with bcrypt

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── music/         # Music endpoints
│   │   ├── films/         # Film endpoints
│   │   └── user/          # User endpoints
│   ├── auth/              # Auth pages (login, signup)
│   ├── onboarding/        # Onboarding page
│   ├── user/              # User profile page
│   └── page.tsx           # Home page
├── features/              # Feature-based modules
│   ├── auth/             # Authentication feature
│   ├── music/            # Music feature
│   ├── films/            # Films feature
│   └── user/             # User feature
├── hooks/                # React Query hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-music.ts      # Music hooks
│   ├── use-films.ts      # Films hooks
│   └── use-user.ts       # User hooks
├── lib/                  # Core utilities
│   ├── prisma.ts         # Prisma client singleton
│   ├── react-query.tsx   # React Query provider
│   └── supabase.ts       # Supabase client
├── prisma/               # Prisma configuration
│   ├── schema.prisma     # Database schema definition (IMPORTANT!)
│   ├── seed.ts           # Database seeding script
│   └── seed-films.ts     # Film seeding script
├── types/                # TypeScript types
└── components/           # Shared components
    ├── ui/               # UI components (shadcn)
    └── navigation.tsx    # Navigation component
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ipexktsgctofdbmmgkxo.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_yxDeGRZzuLbC6Pie109Acw_6VXeLz6G

# Recommendation Backend (FastAPI)
NEXT_PUBLIC_RECS_API_URL=http://localhost:8000

# TMDB (used to pull movies + IMDb ids for seeding)
TMDB_API_KEY=your_tmdb_key_here
TMDB_MAX_PAGES=10

# Database URL - Get from Supabase project settings
# Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
DATABASE_URL="postgresql://postgres.ipexktsgctofdbmmgkxo:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**To get your DATABASE_URL:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the connection string under "Connection string" → "URI"
4. Replace `[YOUR-PASSWORD]` with your database password

### 2. Verify Prisma Schema File

**IMPORTANT**: Make sure you have the Prisma schema file at `frontend/prisma/schema.prisma`. 

**The schema file MUST be present for the application to work!**

If you don't see this file:
1. Make sure you've pulled the latest changes: `git pull`
2. Check that the file exists: `ls frontend/prisma/schema.prisma`
3. If it's missing, ask the repository owner to ensure it's committed to the repository
4. The schema file should NOT be in `.gitignore` - it must be tracked by git

**Quick check:**
```bash
# From the frontend directory
cat prisma/schema.prisma
```

If this command fails, the schema file is missing and needs to be added to the repository.

### 3. Database Setup

Run Prisma migrations to create the database schema:

```bash
# Navigate to frontend directory
cd frontend

# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Or push schema directly (for development)
npx prisma db push
```

### 4. Seed Database with Mock Data

Populate the database with sample music and films:

```bash
npm run db:seed
```

This will add 15 music tracks and 15 films to your database.

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: User accounts with email/password authentication
- **UserPreferences**: User preferences and onboarding status
- **Music**: Music tracks/artists
- **Film**: Films/movies
- **UserMusicLike**: User likes for music
- **UserFilmLike**: User likes for films

## Key Features Explained

### Authentication Flow
1. User signs up → Account created → Redirected to onboarding
2. User logs in → Check onboarding status → Redirect accordingly
3. Session stored in cookies (persists across sessions)
4. Anonymous data (likes/preferences) stored in localStorage
5. When user logs in, anonymous data is synced to database

### Anonymous User Support
- Users can like music/films and select artists without logging in
- Data is stored in localStorage
- When user logs in or signs up, all anonymous data is synced to database
- This provides a seamless experience - users don't lose their preferences

### Onboarding Flow
1. New users select favorite artists
2. Recommendations update dynamically based on selections
3. On completion, preferences saved and user redirected to home

### Like System
- Users can like/unlike music and films
- Likes are stored in the database
- User profile shows all liked items

## Development Notes

- **DRY Principle**: Components and hooks are reusable
- **Modular Structure**: Features are organized by domain
- **Type Safety**: Full TypeScript support
- **React Query**: Handles data fetching, caching, and mutations
- **Mock Data**: Currently uses mock data for music/films (will be replaced with real data later)

## Next Steps

1. Set up your Supabase database connection string
2. Run Prisma migrations to create tables
3. Seed database with real music/film data (future)
4. Implement recommendation algorithm (future)
5. Add more features as needed

## Troubleshooting

### Prisma Schema File Missing

If you get errors about missing Prisma schema:

1. **Check if the file exists:**
   ```bash
   ls frontend/prisma/schema.prisma
   ```

2. **If missing, pull latest changes:**
   ```bash
   git pull origin main  # or your branch name
   ```

3. **Verify it's tracked in git:**
   ```bash
   git ls-files | grep schema.prisma
   ```

4. **If still missing, check with repository owner** - the schema file should be at `frontend/prisma/schema.prisma`

### Prisma Client Not Generated

If you see errors about Prisma Client:

```bash
cd frontend
npx prisma generate
```

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Prisma commands
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma migrate dev     # Create and apply migration
npx prisma db push         # Push schema changes (dev only)
npx prisma generate        # Generate Prisma Client
```
