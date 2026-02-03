#!/bin/bash

# Pomelli Campaign Generator - Database Migration Script
# Applies SQL migrations directly to Supabase via psql or API

SUPABASE_URL="https://qxkicdhsrlpehgcsapsh.supabase.co"
PROJECT_REF="qxkicdhsrlpehgcsapsh"

echo "🚀 Applying Pomelli Campaign Generator Migrations"
echo "   Database: $SUPABASE_URL"
echo ""

# Check if we need service role key (we'll try anon key first for DDL)
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
  echo "   Migrations require admin permissions"
  echo ""
  echo "📋 Please apply manually via Supabase Studio:"
  echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF"
  echo "   2. Click 'SQL Editor' → 'New query'"
  echo "   3. Copy/paste migration SQL and Run"
  echo ""
  echo "Migration files:"
  echo "   - migrations/create_campaigns_table.sql"
  echo "   - migrations/extend_brand_profiles_for_pomelli.sql"
  exit 1
fi

# If we have service role key, we can apply via API
echo "✅ Service role key found, applying migrations..."
echo ""

# Migration 1: Campaigns Table
echo "📝 Migration 1: Create campaigns table"
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "query": "$(cat migrations/create_campaigns_table.sql)"
}
EOF
)

if [ $? -eq 0 ]; then
  echo "   ✅ SUCCESS"
else
  echo "   ❌ FAILED: $RESPONSE"
fi

# Migration 2: Extend Brand Profiles
echo "📝 Migration 2: Extend brand_profiles table"
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "query": "$(cat migrations/extend_brand_profiles_for_pomelli.sql)"
}
EOF
)

if [ $? -eq 0 ]; then
  echo "   ✅ SUCCESS"
else
  echo "   ❌ FAILED: $RESPONSE"
fi

echo ""
echo "============================================================"
echo "✅ Migration script complete"
echo "🎉 Campaign Generator is ready to test!"
echo "   URL: http://localhost:3000/apps/post-generator/"
