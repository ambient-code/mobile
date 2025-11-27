# Quickstart Guide: ACP Mobile Development

**Feature**: 001-acp-mobile
**Date**: 2025-11-26
**Audience**: Developers new to this codebase

## Overview

This guide gets you from zero to running the ACP mobile app on your device in under 10 minutes.

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+**: `node --version` should show v20.x or higher
- **npm**: Included with Node.js
- **iOS Development** (macOS only):
  - Xcode 15+ with Command Line Tools installed
  - iOS Simulator or physical iPhone running iOS 15+
- **Android Development**:
  - Android Studio with Android SDK
  - Android Emulator or physical Android device with USB debugging enabled
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Expo Go App** (for quick testing):
  - Download from App Store (iOS) or Play Store (Android)

## Quick Start (Development)

### 1. Clone and Install

```bash
# Navigate to project directory (already cloned)
cd /Users/jeder/repos/acp-mobile

# Install dependencies
npm install

# Verify installation
npm run lint
```

### 2. Start Development Server

```bash
# Start Expo dev server
npm start

# This opens Expo DevTools in your browser at http://localhost:19000
```

### 3. Run on Device/Simulator

Choose your platform:

**iOS (macOS only)**:

```bash
# Option A: Run in iOS Simulator
npm run ios

# Option B: Scan QR code from Expo Go app on physical iPhone
# 1. Open Expo Go app on iPhone
# 2. Scan QR code from terminal or DevTools
```

**Android**:

```bash
# Option A: Run in Android Emulator (must be running first)
npm run android

# Option B: Scan QR code from Expo Go app on physical Android device
# 1. Open Expo Go app on Android
# 2. Scan QR code from terminal or DevTools
```

### 4. Make Your First Change

1. Open `app/(tabs)/index.tsx` in your editor
2. Find the greeting text and change it
3. Save the file
4. See instant hot reload on your device

## Development Workflow

### File Structure

```
app/               # Screens (Expo Router)
components/        # Reusable UI components
services/          # API integration, business logic
hooks/             # Custom React hooks
types/             # TypeScript type definitions
utils/             # Helper functions
__tests__/         # Tests
```

### Key Commands

```bash
# Start dev server
npm start

# Run on specific platform
npm run ios
npm run android

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check

# Build production app (requires EAS account)
npm run build:ios
npm run build:android
```

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/my-screen.tsx`)
2. Expo Router automatically creates route at `/my-screen`
3. Navigate with `router.push('/my-screen')`

Example:

```typescript
// app/my-screen.tsx
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

export default function MyScreen() {
  const router = useRouter()

  return (
    <View>
      <Text>My New Screen</Text>
    </View>
  )
}
```

### Adding a New Component

1. Create file in `components/` (e.g., `components/ui/MyButton.tsx`)
2. Export component
3. Import and use in screens

Example:

```typescript
// components/ui/MyButton.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface MyButtonProps {
  title: string
  onPress: () => void
}

export function MyButton({ title, onPress }: MyButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: { padding: 16, backgroundColor: '#4f46e5' },
  text: { color: '#fff', fontWeight: '600' }
})
```

### Making API Calls

1. Add endpoint function in `services/api/` (e.g., `services/api/sessions.ts`)
2. Use custom hook to fetch data (e.g., `hooks/useSessions.ts`)
3. Consume in component

Example:

```typescript
// services/api/sessions.ts
import { apiClient } from './client'
import type { Session } from '@/types/session'

export async function fetchSessions() {
  const response = await apiClient.get<{ sessions: Session[] }>('/sessions')
  return response.data.sessions
}

// hooks/useSessions.ts
import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '@/services/api/sessions'

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions
  })
}

// app/sessions/index.tsx
import { useSessions } from '@/hooks/useSessions'

export default function SessionsScreen() {
  const { data: sessions, isLoading } = useSessions()

  if (isLoading) return <LoadingSpinner />

  return (
    <SessionList sessions={sessions} />
  )
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- SessionCard.test.tsx

# Generate coverage report
npm test -- --coverage
```

### Writing Tests

```typescript
// __tests__/components/SessionCard.test.tsx
import { render, screen } from '@testing-library/react-native'
import { SessionCard } from '@/components/session/SessionCard'

describe('SessionCard', () => {
  it('renders session name and status', () => {
    const session = {
      id: '1',
      name: 'Test Session',
      status: 'running',
      progress: 50
    }

    render(<SessionCard session={session} />)

    expect(screen.getByText('Test Session')).toBeTruthy()
    expect(screen.getByText('running')).toBeTruthy()
  })
})
```

## Backend Integration

### Local API Setup

The app requires a running ACP backend. For local development:

1. **Option A: Use staging backend** (default):
   - Already configured in `services/api/client.ts`
   - Points to: `https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com`

2. **Option B: Run backend locally**:
   - Clone ACP platform repo
   - Follow backend setup instructions
   - Update `API_BASE_URL` in `.env.local`:
     ```
     API_BASE_URL=http://localhost:8080/api/v1
     ```

### Authentication

For local development without OAuth:

1. Get a dev token from backend team
2. Add to Expo SecureStore manually:

   ```typescript
   import * as SecureStore from 'expo-secure-store'

   await SecureStore.setItemAsync('auth_access_token', 'your-dev-token')
   ```

3. Restart app

## Troubleshooting

### Common Issues

**Metro bundler not starting**:

```bash
# Clear cache and restart
npx expo start -c
```

**iOS build failing**:

```bash
# Clean build folder
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod install && cd ..
```

**Android emulator not detected**:

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_31
```

**TypeScript errors**:

```bash
# Restart TypeScript server in VS Code
# CMD+Shift+P → "TypeScript: Restart TS Server"

# Or check types manually
npm run type-check
```

**Hot reload not working**:

- Shake device to open dev menu
- Tap "Reload"
- Or press `r` in terminal where `npm start` is running

## Environment Variables

Create `.env.local` for local overrides:

```bash
# API Configuration
API_BASE_URL=http://localhost:8080/api/v1

# Feature Flags
ENABLE_GITHUB_INTEGRATION=true
ENABLE_PUSH_NOTIFICATIONS=true

# Debug
DEBUG_API_CALLS=true
```

Never commit `.env.local` (already in `.gitignore`).

## Next Steps

After completing this quickstart:

1. **Read the spec**: Review `specs/001-acp-mobile/spec.md` for feature requirements
2. **Review data model**: Check `specs/001-acp-mobile/data-model.md` for entity definitions
3. **Study API contracts**: See `specs/001-acp-mobile/contracts/acp-api.yaml` for endpoint details
4. **Explore research**: Read `specs/001-acp-mobile/research.md` for technology decisions

## Additional Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo Router Docs**: https://expo.github.io/router/
- **ACP Platform Repo**: https://github.com/ambient-code/platform
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## Support

- **Questions**: Ask in #acp-mobile Slack channel
- **Bugs**: Create issue in GitHub repo
- **Backend API**: Contact backend team in #acp-backend

---

**You're ready to build!** 🚀

Start with a small change to verify your setup, then dive into implementing features from the spec.
