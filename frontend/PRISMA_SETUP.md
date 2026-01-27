# Prisma Schema Setup Guide

## Quick Check

First, verify you have the Prisma schema file:

```bash
# From the frontend directory
ls prisma/schema.prisma
```

If this file doesn't exist, you need to get it from the repository owner.

## What is the Prisma Schema?

The Prisma schema file (`prisma/schema.prisma`) defines your database structure. It's **essential** for the application to work.

## File Location

The schema file should be located at:
```
frontend/prisma/schema.prisma
```

## Setting Up Prisma

Once you have the schema file, follow these steps:

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

This reads the schema file and generates the Prisma Client code.

### 3. Set Up Your Database Connection

Make sure you have a `.env.local` file with your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres.ipexktsgctofdbmmgkxo:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### 4. Push Schema to Database

```bash
npx prisma db push
```

This creates all the tables in your database based on the schema.

### 5. Verify Setup

```bash
npx prisma studio
```

This opens a web interface to view your database.

## Schema File Contents

The schema file should contain models for:
- `User` - User accounts
- `UserPreferences` - User preferences
- `Film` - Film data
- `UserFilmLike` - User film likes

## If Schema File is Missing

1. **Check if it's in git:**
   ```bash
   git ls-files | grep schema.prisma
   ```

2. **Pull latest changes:**
   ```bash
   git pull
   ```

3. **If still missing, ask the repository owner** to ensure the file is committed:
   ```bash
   git add prisma/schema.prisma
   git commit -m "Add Prisma schema file"
   git push
   ```

## Common Issues

### "Schema file not found"
- Make sure you're in the `frontend` directory
- Check that the file exists: `ls prisma/schema.prisma`
- Verify it's not in `.gitignore`

### "Prisma Client not generated"
- Run: `npx prisma generate`
- Make sure the schema file exists first

### "Database connection failed"
- Check your `DATABASE_URL` in `.env.local`
- Verify your Supabase credentials

## Need the Schema File?

If you don't have the schema file, contact the repository owner. The file is essential and should be:
- Located at `frontend/prisma/schema.prisma`
- Committed to the git repository
- Not in `.gitignore`
