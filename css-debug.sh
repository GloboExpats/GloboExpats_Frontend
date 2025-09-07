#!/bin/bash

# CSS Debug Script
# Run this inside the container to test CSS serving

echo "=== CSS Debug Information ==="
echo ""

echo "1. Checking if CSS files exist:"
find ./.next/static -name "*.css" -type f 2>/dev/null | head -5

echo ""
echo "2. CSS file contents preview:"
CSS_FILE=$(find ./.next/static -name "*.css" -type f 2>/dev/null | head -1)
if [ -n "$CSS_FILE" ]; then
    echo "File: $CSS_FILE"
    echo "Size: $(stat -c%s "$CSS_FILE" 2>/dev/null || stat -f%z "$CSS_FILE" 2>/dev/null) bytes"
    echo "First 200 characters:"
    head -c 200 "$CSS_FILE" 2>/dev/null || echo "Could not read CSS file"
else
    echo "No CSS files found!"
fi

echo ""
echo "3. Testing CSS accessibility via HTTP:"
if command -v curl >/dev/null 2>&1; then
    CSS_PATH=$(find ./.next/static -name "*.css" -type f 2>/dev/null | head -1 | sed 's|^\./||')
    if [ -n "$CSS_PATH" ]; then
        echo "Testing: http://localhost:3000/$CSS_PATH"
        curl -I "http://localhost:3000/$CSS_PATH" 2>/dev/null | head -3
    fi
fi

echo ""
echo "4. Checking main page for CSS links:"
if command -v curl >/dev/null 2>&1; then
    echo "Looking for CSS links in main page:"
    curl -s http://localhost:3000 2>/dev/null | grep -i "stylesheet\|\.css" | head -3
fi

echo ""
echo "=== Debug Complete ==="
