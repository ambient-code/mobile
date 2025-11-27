# Quick Start

Get ACP Mobile running on your device in 5 minutes.

## Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org/))
- **iOS Simulator** (macOS with Xcode) OR **Android Emulator** (Android Studio)
- **Expo Go app** (optional, for testing on physical device)

## Installation

```bash
# Clone the repository
git clone https://github.com/ambient-code/acp-mobile.git
cd acp-mobile

# Install dependencies
npm install

# Start development server
npm start
```

## Run on Device

### iOS Simulator (macOS only)

```bash
npm run ios
```

This opens the app in the iOS Simulator.

### Android Emulator

```bash
npm run android
```

This opens the app in the Android Emulator.

### Physical Device (Easiest)

1. Install **Expo Go** from App Store (iOS) or Google Play (Android)
2. Run `npm start`
3. Scan the QR code displayed in terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## First Launch

The app currently uses mock data for development:

- **Mock Sessions**: Pre-populated with test sessions
- **Mock SSE**: Simulates real-time updates every 10-15 seconds
- **No Backend Required**: Works offline out of the box

### Dashboard Overview

You'll see:

- Time-based greeting (Good morning/afternoon/evening/night)
- Quick action buttons ("Interactive" and "5 Running")
- Active sessions with progress bars
- Model badges (sonnet-4.5, opus-4.5)

### Try These Features

1. **Tap a session card** - View detailed session information
2. **Pull down to refresh** - Refresh session list
3. **Tap "View All"** - See all sessions with filters
4. **Watch progress bars** - Auto-update every 10-15 seconds
5. **Tap avatar (top-right)** - Open user menu

## Switching to Real API

To connect to the actual ACP backend:

1. **Update API URL** in `utils/constants.ts`:

   ```typescript
   export const API_BASE_URL =
     'https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com'
   ```

2. **Disable mock data** in `hooks/useSessions.ts`:

   ```typescript
   const USE_MOCK_DATA = false
   ```

3. **Disable mock SSE** in `hooks/useRealtimeSession.ts`:

   ```typescript
   const USE_MOCK_SSE = false
   ```

4. **Configure OAuth** (see [Setup Guide](setup.md))

## Development Commands

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Run all checks
npm run validate
```

## Next Steps

- [**Detailed Setup Guide**](setup.md) - Complete development environment setup
- [**Troubleshooting**](troubleshooting.md) - Common issues and solutions
- [**Contributing Guide**](../../CONTRIBUTING.md) - How to contribute
- [**API Reference**](../api/index.md) - Explore the codebase

## Getting Help

- **Documentation**: Browse the full docs at the [documentation site](https://ambient-code.github.io/acp-mobile)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/ambient-code/acp-mobile/issues)
- **Questions**: Ask in pull requests or discussions

---

**Ready to build?** Check out the [Development Backlog](../../BACKLOG.md) for upcoming features and improvements.
