#!/bin/bash

# Start Expo in offline mode to bypass network checks
# This is useful when Expo's servers are unreachable

echo "🚀 Starting Expo in offline mode..."
echo "This bypasses network version checks that may fail behind proxies."
echo ""

export EXPO_NO_DOCTOR=1
export EXPO_OFFLINE=1

npx expo start --offline

