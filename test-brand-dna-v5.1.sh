#!/bin/bash
# Test Brand DNA v5.1 - Universal Scraper Reliability
# Tests the fixed scraper against diverse website types

set -e

echo "🧪 Testing Brand DNA v5.1 Fixes"
echo "================================"
echo ""

# Supabase Edge Function URL
FUNCTION_URL="https://qxkicdhsrlpehgcsapsh.supabase.co/functions/v1/extract-brand-dna"

# Test websites (diverse types)
WEBSITES=(
    "https://www.hairbyshea.com"
    "https://milliesitalian.com"
    "https://www.hearinglife.com"
)

# Test each website
for SITE in "${WEBSITES[@]}"; do
    echo "📡 Testing: $SITE"
    echo "---"
    
    # Make request
    RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"$SITE\"}")
    
    # Extract key metrics
    BRAND_IMAGES=$(echo "$RESPONSE" | jq -r '.brand_images | length // 0')
    VISUAL_POSTS=$(echo "$RESPONSE" | jq -r '.visual_social_posts | length // 0')
    COMPANY_NAME=$(echo "$RESPONSE" | jq -r '.company_name // "Unknown"')
    
    echo "  ✅ Company: $COMPANY_NAME"
    echo "  📸 Brand Images: $BRAND_IMAGES"
    echo "  🎨 Visual Posts: $VISUAL_POSTS"
    
    # Validation
    if [ "$VISUAL_POSTS" -eq 0 ]; then
        echo "  ❌ FAILED - No visual posts generated!"
    else
        echo "  ✅ SUCCESS - Visual posts generated!"
    fi
    
    echo ""
done

echo "================================"
echo "🏁 Test Suite Complete"
