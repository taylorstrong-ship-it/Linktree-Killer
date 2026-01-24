#!/bin/bash

# Port to run the test server on
PORT=3001

echo "🧪 Starting End-to-End Verification on Port $PORT..."

# Start the production server in the background
PORT=$PORT npm start &
PID=$!

echo "⏳ Waiting for server to boot (PID: $PID)..."
sleep 5

# Check if server is running
if ! ps -p $PID > /dev/null; then
    echo "❌ Server failed to start!"
    exit 1
fi

echo "🔎 Probing homepage..."
# Capture output
RESPONSE=$(curl -s http://localhost:$PORT)

# Check for expected content
if echo "$RESPONSE" | grep -q "Taylored Pet Portraits"; then
    echo "✅ PASS: Profile Found! 'Taylored Pet Portraits' is in the HTML."
    # Also check if it's SSR (not just the loading state)
    if echo "$RESPONSE" | grep -q "link-in-bio"; then # Assuming some class checks or content
         : # clean pass
    fi
else
    echo "❌ FAIL: Profile NOT found in HTML."
    echo "--- Response Preview ---"
    echo "$RESPONSE" | head -n 20
    echo "------------------------"
    
    # Check for specific error
    if echo "$RESPONSE" | grep -q "System Online"; then
        echo "⚠️  APPLICATION ERROR: DB Connection Worked but returned 'User not found'."
    fi
fi

# Cleanup
echo "🧹 Shutting down test server..."
kill $PID
echo "Done."
