#!/bin/bash

# dev.sh - Expo React Native Development Environment Manager
# Usage: ./dev.sh [start|stop|restart|clean|rebuild|status|help]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if a port is in use
check_port() {
    local port=$1
    lsof -i :$port -sTCP:LISTEN -t >/dev/null 2>&1
}

# Kill processes on a specific port
kill_port() {
    local port=$1
    if check_port $port; then
        log_warn "Killing process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Stop all development processes
stop_dev() {
    log_info "Stopping all development processes..."

    # Kill Metro bundler (port 8081)
    kill_port 8081

    # Kill Expo dev tools (port 19000, 19001, 19002)
    kill_port 19000
    kill_port 19001
    kill_port 19002

    # Kill any Expo/Metro/React Native processes
    pkill -f "expo start" 2>/dev/null || true
    pkill -f "expo run:ios" 2>/dev/null || true
    pkill -f "metro" 2>/dev/null || true
    pkill -f "react-native" 2>/dev/null || true

    # Kill any node processes related to this project
    pgrep -f "node.*$PROJECT_DIR" | xargs kill -9 2>/dev/null || true

    log_success "All development processes stopped"
}

# Clean caches
clean_caches() {
    log_info "Cleaning development caches..."

    # Clean Watchman
    if command -v watchman &> /dev/null; then
        log_info "Cleaning Watchman watches..."
        watchman watch-del-all 2>/dev/null || true
        log_success "Watchman cleaned"
    fi

    # Clean Metro cache
    log_info "Cleaning Metro bundler cache..."
    rm -rf $HOME/.metro 2>/dev/null || true
    rm -rf /tmp/metro-* 2>/dev/null || true
    rm -rf /tmp/haste-* 2>/dev/null || true
    rm -rf /tmp/react-* 2>/dev/null || true

    # Clean node_modules cache
    log_info "Cleaning node_modules cache..."
    rm -rf node_modules/.cache 2>/dev/null || true

    # Clean Expo cache
    log_info "Cleaning Expo cache..."
    rm -rf .expo 2>/dev/null || true

    # Clean iOS build artifacts (optional - can be slow)
    if [ "$1" == "deep" ]; then
        log_info "Deep clean: Removing iOS build artifacts..."
        rm -rf ios/build 2>/dev/null || true
        rm -rf ~/Library/Developer/Xcode/DerivedData/ACPMobile-* 2>/dev/null || true
    fi

    log_success "Caches cleaned"
}

# Full rebuild (reinstall dependencies)
rebuild() {
    log_info "Starting full rebuild..."

    stop_dev
    clean_caches deep

    log_info "Removing node_modules and package-lock.json..."
    rm -rf node_modules
    rm -f package-lock.json

    log_info "Reinstalling dependencies..."
    npm install

    log_success "Rebuild complete"
}

# Start development environment
start_dev() {
    log_info "Starting development environment..."

    # Make sure no stray processes are running
    stop_dev
    sleep 2

    # Start Expo in a new terminal window
    log_info "Starting Metro bundler..."
    osascript <<EOF
tell application "Terminal"
    do script "cd '$PROJECT_DIR' && npx expo start --clear"
    activate
end tell
EOF

    # Wait for Metro to start
    log_info "Waiting for Metro bundler to start..."
    local max_wait=30
    local waited=0
    while ! check_port 8081; do
        if [ $waited -ge $max_wait ]; then
            log_error "Metro bundler failed to start after ${max_wait}s"
            exit 1
        fi
        sleep 1
        waited=$((waited + 1))
    done
    log_success "Metro bundler started on port 8081"

    # Wait a bit more for Metro to fully initialize
    sleep 3

    # Start iOS simulator in another terminal window
    log_info "Starting iOS simulator..."
    osascript <<EOF
tell application "Terminal"
    do script "cd '$PROJECT_DIR' && npm run ios"
end tell
EOF

    log_success "Development environment started!"
    log_info "Metro bundler running in terminal 1"
    log_info "iOS build running in terminal 2"
}

# Restart development environment
restart_dev() {
    log_info "Restarting development environment..."
    stop_dev
    sleep 2
    start_dev
}

# Show status of development processes
show_status() {
    log_info "Development Environment Status:"
    echo ""

    # Check Metro bundler
    if check_port 8081; then
        log_success "Metro bundler: RUNNING (port 8081)"
    else
        log_warn "Metro bundler: NOT RUNNING"
    fi

    # Check Expo dev server
    if check_port 19000; then
        log_success "Expo dev server: RUNNING (port 19000)"
    else
        log_warn "Expo dev server: NOT RUNNING"
    fi

    # Check for iOS Simulator
    if pgrep -x "Simulator" > /dev/null; then
        log_success "iOS Simulator: RUNNING"
        # Show which device
        xcrun simctl list devices | grep Booted || true
    else
        log_warn "iOS Simulator: NOT RUNNING"
    fi

    # Check for running processes
    echo ""
    log_info "Related processes:"
    ps aux | grep -E "expo|metro|node.*$PROJECT_DIR" | grep -v grep || echo "  None found"

    # Check ports
    echo ""
    log_info "Port status:"
    echo "  8081 (Metro):  $(lsof -i :8081 -sTCP:LISTEN -t >/dev/null 2>&1 && echo '✓ In use' || echo '✗ Free')"
    echo "  19000 (Expo):  $(lsof -i :19000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo '✓ In use' || echo '✗ Free')"
    echo "  19001 (Expo):  $(lsof -i :19001 -sTCP:LISTEN -t >/dev/null 2>&1 && echo '✓ In use' || echo '✗ Free')"
}

# Show help
show_help() {
    cat << EOF
${BLUE}Expo React Native Development Environment Manager${NC}

${GREEN}Usage:${NC}
  ./dev.sh [command]

${GREEN}Commands:${NC}
  ${YELLOW}start${NC}        Start Metro bundler and iOS simulator in new terminal windows
  ${YELLOW}stop${NC}         Stop all development processes (Metro, Expo, iOS builds)
  ${YELLOW}restart${NC}      Stop and restart the development environment
  ${YELLOW}clean${NC}        Clean all caches (Metro, Watchman, Expo, node_modules/.cache)
  ${YELLOW}deep-clean${NC}   Clean caches + iOS build artifacts (slower)
  ${YELLOW}rebuild${NC}      Full rebuild (stop, deep-clean, reinstall dependencies)
  ${YELLOW}status${NC}       Show status of development processes and ports
  ${YELLOW}help${NC}         Show this help message

${GREEN}Examples:${NC}
  ./dev.sh start          # Start development environment
  ./dev.sh stop           # Stop everything
  ./dev.sh clean          # Clean caches when things are acting weird
  ./dev.sh rebuild        # Nuclear option - full reinstall

${GREEN}Common Issues:${NC}
  "Port already in use"     → Run: ./dev.sh stop
  "Module not found"        → Run: ./dev.sh rebuild
  "Bundler acting weird"    → Run: ./dev.sh clean && ./dev.sh restart
  "Nothing works"           → Run: ./dev.sh rebuild

${GREEN}Quick Reference:${NC}
  Metro bundler runs on port 8081
  Expo dev tools run on ports 19000-19002
  Press 'r' in Metro terminal to reload
  Press 'i' in Metro terminal to open iOS simulator

EOF
}

# Show component relationships
show_architecture() {
    cat << 'EOF'
╔════════════════════════════════════════════════════════════════════════════╗
║                   EXPO REACT NATIVE ARCHITECTURE                           ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                          YOUR DEVELOPMENT MACHINE                        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ 1. METRO BUNDLER (JavaScript Bundler)                        │     │
│  │    Port: 8081                                                │     │
│  │    • Takes your React Native code (JS/TSX)                   │     │
│  │    • Bundles it into a single JavaScript file                │     │
│  │    • Serves it to the iOS/Android app                        │     │
│  │    • Watches for file changes (Fast Refresh)                 │     │
│  │    • Command: npx expo start                                 │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ 2. EXPO CLI (Development Orchestrator)                       │     │
│  │    Ports: 19000-19002                                        │     │
│  │    • Manages Metro bundler                                   │     │
│  │    • Provides dev tools UI                                   │     │
│  │    • Handles platform-specific builds                        │     │
│  │    • Manages native dependencies                             │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                ↓                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ 3. XCODE BUILD TOOLS (Native iOS Build)                      │     │
│  │    • Compiles native iOS code (Objective-C/Swift)            │     │
│  │    • Links native modules (Expo modules, etc.)               │     │
│  │    • Creates .app bundle for simulator/device                │     │
│  │    • Command: npx expo run:ios (or npm run ios)              │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                ↓                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                            iOS SIMULATOR                                 │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ 4. SIMULATOR APP (Virtual iPhone/iPad)                       │     │
│  │    • Runs your compiled .app bundle                          │     │
│  │    • Connects to Metro on localhost:8081                     │     │
│  │    • Downloads JavaScript bundle                             │     │
│  │    • Executes React Native JavaScript                        │     │
│  │    • Renders UI using native iOS components                  │     │
│  └──────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════╗
║                          DATA FLOW EXPLAINED                               ║
╚════════════════════════════════════════════════════════════════════════════╝

1. You write code in src/ (TypeScript/React)
                ↓
2. Watchman detects file changes (macOS file watching service)
                ↓
3. Metro Bundler re-bundles your JavaScript
                ↓
4. Fast Refresh sends update to simulator via WebSocket
                ↓
5. React Native runtime updates UI without full reload

╔════════════════════════════════════════════════════════════════════════════╗
║                        COMMON PORT USAGE                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

8081    Metro Bundler (JavaScript served here)
19000   Expo Dev Server (main)
19001   Expo Dev Server (alternative)
19002   Expo Dev Tools UI

╔════════════════════════════════════════════════════════════════════════════╗
║                    WHAT EACH TOOL DOES                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

METRO BUNDLER
• JavaScript bundler (like webpack for React Native)
• Converts your ES6/TypeScript → ES5 JavaScript
• Handles module resolution (imports/requires)
• Serves bundle to app over HTTP
• Watches files for changes

EXPO CLI
• Wrapper around Metro with extra features
• Manages Expo SDK modules (camera, location, etc.)
• Provides QR code for Expo Go app
• Handles iOS/Android builds
• Manages native dependencies automatically

XCODE
• Apple's native iOS development tools
• Compiles native iOS code (C/Objective-C/Swift)
• Links native libraries
• Signs the app bundle
• Required for iOS simulator/device builds

WATCHMAN
• Facebook's file watching service
• Detects when you save files
• Triggers Metro to rebuild
• More efficient than Node's fs.watch

REACT NATIVE
• JavaScript framework for native mobile apps
• Your code runs in JavaScript engine (JSC/Hermes)
• Communicates with native iOS via "bridge"
• Native components render iOS UI (not WebView!)

╔════════════════════════════════════════════════════════════════════════════╗
║                      TROUBLESHOOTING GUIDE                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

"Port 8081 already in use"
  → Metro is already running or crashed
  → Fix: ./dev.sh stop

"Unable to load script from assets"
  → Metro not running or app can't connect
  → Fix: ./dev.sh restart

"Invariant Violation: Module AppRegistry is not registered"
  → Metro cache corrupted
  → Fix: ./dev.sh clean

"Build failed" / "Xcode errors"
  → iOS dependencies out of sync
  → Fix: cd ios && pod install && cd .. (if using pods)
  → Fix: ./dev.sh rebuild

"Watchman warning about recrawl"
  → Watchman database corrupted
  → Fix: watchman watch-del-all

"Changes not reflecting"
  → Metro not detecting changes
  → Fix: Press 'r' in Metro terminal to reload
  → Fix: ./dev.sh clean && ./dev.sh restart

EOF
}

# Main command handler
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    clean)
        stop_dev
        clean_caches
        log_success "Ready to start fresh with: ./dev.sh start"
        ;;
    deep-clean)
        stop_dev
        clean_caches deep
        log_success "Deep clean complete. Ready to start: ./dev.sh start"
        ;;
    rebuild)
        rebuild
        log_success "Rebuild complete. Start with: ./dev.sh start"
        ;;
    status)
        show_status
        ;;
    arch|architecture)
        show_architecture
        ;;
    help|--help|-h)
        show_help
        show_architecture
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
