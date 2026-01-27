# Database Connection Troubleshooting

## Error: P1001 - Can't reach database server

If you're getting this error, try these solutions:

### 1. Verify Connection Strings

Make sure your `.env.local` has both URLs:

```env
# For Prisma migrations and schema operations (direct connection, port 5432)
DIRECT_URL="postgresql://postgres.ipexktsgctofdbmmgkxo:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# For application runtime (pgbouncer, port 6543)
DATABASE_URL="postgresql://postgres.ipexktsgctofdbmmgkxo:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Important**: 
- `DIRECT_URL` uses port **5432** (direct PostgreSQL connection)
- `DATABASE_URL` uses port **6543** (pgbouncer connection pooler)

### 2. Check Supabase Project Status

1. Go to your Supabase dashboard
2. Check if your project is active and running
3. Verify the region matches your connection string (`eu-west-1` vs `us-east-1`)

### 3. Verify Database Password

Make sure the password in your connection string is correct:
- Go to Supabase Dashboard → Settings → Database
- Check "Connection string" → "URI"
- Copy the exact connection string and update your `.env.local`

### 4. Test Connection Manually

```bash
# Test direct connection (port 5432)
psql "postgresql://postgres.ipexktsgctofdbmmgkxo:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# Or test with Prisma
cd frontend
npx prisma db pull
```

### 5. Check Network/Firewall

- Ensure your IP is allowed in Supabase (Settings → Database → Connection Pooling)
- Check if you're behind a VPN or firewall that might block connections
- Try from a different network

### 6. Use Direct Connection for Prisma Operations

For Prisma migrations and schema operations, always use `DIRECT_URL` (port 5432):

```bash
# This should use DIRECT_URL automatically via prisma.config.ts
npx prisma db push
npx prisma migrate dev
```

### 7. Common Issues

**Issue**: Connection works in Supabase dashboard but not from Prisma
- **Solution**: Make sure you're using `DIRECT_URL` with port 5432, not `DATABASE_URL` with port 6543

**Issue**: "Connection refused" error
- **Solution**: Check if your Supabase project is paused (free tier projects pause after inactivity)

**Issue**: Wrong region in connection string
- **Solution**: Verify your Supabase project region and update the connection string accordingly

### 8. Reset Connection

If nothing works:

1. **Get fresh connection strings from Supabase:**
   - Dashboard → Settings → Database
   - Copy both "Connection string" (URI) for direct and pooler

2. **Update `.env.local`:**
   ```bash
   # Replace with fresh connection strings
   DIRECT_URL="postgresql://..."
   DATABASE_URL="postgresql://..."
   ```

3. **Test again:**
   ```bash
   npx prisma db pull
   ```

### Quick Fix Commands

```bash
# Regenerate Prisma Client
cd frontend
npx prisma generate

# Try to connect
npx prisma db pull

# If that works, push schema
npx prisma db push
```
