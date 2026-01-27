#!/bin/bash
# Database Connection Test Script

echo "🔍 Testing Database Connection..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ Error: .env.local file not found"
  echo "   Create it with your DATABASE_URL and DIRECT_URL"
  exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

echo "📋 Connection Details:"
DIRECT_PORT=$(echo $DIRECT_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p' | head -1)
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p' | head -1)
echo "   DIRECT_URL port: ${DIRECT_PORT:-not found}"
echo "   DATABASE_URL port: ${DB_PORT:-not found}"
echo ""

# Test DIRECT_URL (port 5432)
if [ -n "$DIRECT_URL" ]; then
  echo "🔌 Testing DIRECT_URL (port 5432 - direct connection)..."
  # Extract host and port (macOS compatible)
  HOST=$(echo $DIRECT_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  PORT=$(echo $DIRECT_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  
  echo "   Host: $HOST"
  echo "   Port: $PORT"
  
  # Test network connectivity
  if timeout 5 bash -c "echo > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo "   ✅ Network connection successful"
  else
    echo "   ❌ Cannot reach $HOST:$PORT"
    echo "   Possible issues:"
    echo "      - Supabase project might be paused"
    echo "      - Network/firewall blocking connection"
    echo "      - Wrong host/port in connection string"
  fi
else
  echo "❌ DIRECT_URL not set in .env.local"
fi

echo ""
echo "💡 Next Steps:"
echo "   1. Check Supabase dashboard - is your project active?"
echo "   2. Verify connection strings in Supabase Settings → Database"
echo "   3. Make sure DIRECT_URL uses port 5432 (not 6543)"
echo "   4. Check if your IP is allowed (Settings → Database → Connection Pooling)"
echo ""
