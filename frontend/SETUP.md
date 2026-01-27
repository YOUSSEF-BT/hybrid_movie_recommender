# Setup Guide for Amaynu Recommendation System

This guide will help you set up the project from scratch.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to Supabase project (or create a new one)
- Git (to clone the repository)

## Step 1: Clone and Install Dependencies

```bash
# Navigate to the frontend directory
cd frontend

# Install all dependencies
npm install
```

## Step 2: Set Up Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase Database URL:**
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **Database**
   - Under "Connection string", select **URI**
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password

3. **Update `.env.local` with your credentials:**
   ```env
   DATABASE_URL="postgresql://postgres.ipexktsgctofdbmmgkxo:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```

## Step 3: Verify Prisma Schema File

**IMPORTANT**: Make sure the Prisma schema file exists at `prisma/schema.prisma`.

Check if it exists:
```bash
ls prisma/schema.prisma
```

If the file is missing:
1. Make sure you've pulled all changes from git
2. The schema file should be committed to the repository
3. If it's still missing, contact the repository owner

## Step 4: Set Up Database

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Push the schema to your database:**
   ```bash
   npx prisma db push
   ```
   
   This will create all the tables in your Supabase database based on the schema.

3. **Verify the database setup:**
   ```bash
   npx prisma studio
   ```
   
   This opens a web interface where you can view your database tables.

## Step 5: Run the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### "Prisma schema file not found"

**Solution:**
1. Check if the file exists: `ls prisma/schema.prisma`
2. If missing, make sure you've pulled the latest changes from git
3. The schema file should be at: `frontend/prisma/schema.prisma`

### "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
```

### "Database connection failed"

**Solution:**
1. Verify your `DATABASE_URL` in `.env.local` is correct
2. Make sure your Supabase project is active
3. Check that your database password is correct
4. Ensure your IP is allowed in Supabase (if IP restrictions are enabled)

### "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm install
npx prisma generate
```

## Database Schema Overview

The Prisma schema defines the following models:

- **User**: User accounts with authentication
- **UserPreferences**: User preferences and onboarding status
- **Film**: Film/movie data
- **UserFilmLike**: Tracks which films users have liked

## Next Steps

After setup:
1. Create a test account by signing up
2. Like some films to test the functionality
3. Check your profile page to see liked films
4. Explore the codebase structure

## Need Help?

If you encounter any issues:
1. Check the main README.md for more details
2. Verify all environment variables are set correctly
3. Make sure Prisma schema file exists and is valid
4. Check that your database connection is working
