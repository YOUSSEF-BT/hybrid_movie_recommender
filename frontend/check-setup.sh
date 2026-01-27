#!/bin/bash

echo "🔍 Checking Prisma Schema Setup..."
echo ""

# Check if schema file exists
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema file found: prisma/schema.prisma"
    echo "   File size: $(wc -l < prisma/schema.prisma) lines"
else
    echo "❌ ERROR: Prisma schema file NOT FOUND!"
    echo "   Expected location: prisma/schema.prisma"
    echo "   Please get this file from the repository owner."
    exit 1
fi

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ Environment file found: .env.local"
    if grep -q "DATABASE_URL" .env.local; then
        echo "✅ DATABASE_URL is set in .env.local"
    else
        echo "⚠️  WARNING: DATABASE_URL not found in .env.local"
    fi
else
    echo "⚠️  WARNING: .env.local not found"
    echo "   Copy .env.example to .env.local and add your credentials"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed (node_modules exists)"
else
    echo "⚠️  WARNING: Dependencies not installed"
    echo "   Run: npm install"
fi

# Check if Prisma Client is generated
if [ -d "node_modules/.prisma/client" ] || [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma Client appears to be generated"
else
    echo "⚠️  WARNING: Prisma Client may not be generated"
    echo "   Run: npx prisma generate"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Make sure .env.local has your DATABASE_URL"
echo "   2. Run: npx prisma generate"
echo "   3. Run: npx prisma db push"
echo "   4. Run: npm run dev"
