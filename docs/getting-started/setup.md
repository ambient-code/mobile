# Development Setup Guide

Complete guide for setting up the ACP Mobile development environment.

## Prerequisites

### Required Software

#### Node.js 20+

```bash
# Check version
node --version

# Should output v20.x.x or higher
```

Download from [nodejs.org](https://nodejs.org/) if needed.

#### iOS Development (macOS Only)

1. **Xcode** (latest version from App Store)
2. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

#### Android Development

1. **Android Studio** ([Download](https://developer.android.com/studio))
2. **Android SDK** (installed via Android Studio)
3. **Android Emulator** (created via Android Studio AVD Manager)

#### Git

```bash
# Check version
git --version
```

### Optional but Recommended

- **Expo Go** app on physical device (iOS/Android)
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - React Native Tools
  - TypeScript and JavaScript Language Features

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/ambient-code/acp-mobile.git
cd acp-mobile
```

### 2. Install Dependencies

```bash
npm install
```

This installs all Node.js dependencies defined in `package.json`.

### 3. Environment Configuration

Create `.env` file (optional for development):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com

# OAuth Configuration
EXPO_PUBLIC_OAUTH_CLIENT_ID=your-client-id
EXPO_PUBLIC_OAUTH_REDIRECT_URI=acp://oauth/callback

# Feature Flags
EXPO_PUBLIC_USE_MOCK_DATA=true
EXPO_PUBLIC_USE_MOCK_SSE=true
```

**Note**: Mock data is enabled by default, so `.env` is optional for initial development.

### 4. iOS Setup (macOS Only)

Install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

### 5. Start Development Server

```bash
npm start
```

This starts the Expo dev server. You'll see options to:

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app

## Platform-Specific Setup

### iOS Simulator

1. **Open Xcode** → Preferences → Locations
2. Ensure **Command Line Tools** is selected
3. **Open Simulator**: Xcode → Open Developer Tool → Simulator
4. **Run app**:
   ```bash
   npm run ios
   ```

#### Choosing a Simulator

```bash
# List available simulators
xcrun simctl list devices

# Run on specific device
npx expo run:ios --device "iPhone 14"
```

### Android Emulator

1. **Open Android Studio** → Tools → AVD Manager
2. **Create Virtual Device**:
   - Device: Pixel 5 or similar
   - System Image: Latest Android version (API 33+)
   - AVD Name: Pixel_5_API_33
3. **Start emulator** from AVD Manager
4. **Run app**:
   ```bash
   npm run android
   ```

#### Troubleshooting Android

If emulator doesn't start:

```bash
# Check adb connection
adb devices

# Start adb server if needed
adb start-server
```

### Physical Device Testing

#### iOS (via Expo Go)

1. Install **Expo Go** from App Store
2. Ensure iPhone and Mac are on same WiFi network
3. Run `npm start`
4. Open Camera app and scan QR code

#### Android (via Expo Go)

1. Install **Expo Go** from Google Play
2. Ensure Android device and computer are on same WiFi network
3. Run `npm start`
4. Open Expo Go and scan QR code

## Verifying Installation

### Run Validation Checks

```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Format check
npm run format:check

# Run all checks
npm run validate
```

All checks should pass without errors.

### Test Build

```bash
# iOS
npm run ios

# Android
npm run android
```

The app should launch in the simulator/emulator and display the dashboard with mock sessions.

## OAuth Configuration (Production)

For connecting to the real ACP backend with OAuth authentication:

### 1. Register OAuth Application

Contact the ACP platform team to register your development OAuth application.

You'll receive:

- **Client ID**
- **Redirect URI**: `acp://oauth/callback`

### 2. Update Environment

Add to `.env`:

```env
EXPO_PUBLIC_OAUTH_CLIENT_ID=your-actual-client-id
EXPO_PUBLIC_OAUTH_REDIRECT_URI=acp://oauth/callback
```

### 3. Disable Mock Data

In `hooks/useSessions.ts`:

```typescript
const USE_MOCK_DATA = false
```

In `hooks/useRealtimeSession.ts`:

```typescript
const USE_MOCK_SSE = false
```

### 4. Test Authentication

1. Launch app
2. You'll be redirected to Red Hat SSO login
3. Authenticate with your Red Hat credentials
4. App should redirect back and display real sessions

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit code in your editor. The app will hot-reload automatically.

### 3. Run Checks Before Commit

```bash
npm run validate
```

This runs TypeScript type checking, ESLint, and Prettier.

### 4. Commit Changes

Pre-commit hooks will automatically:

- Format code with Prettier
- Lint code with ESLint
- Block commit if there are errors

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Editor Configuration

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Recommended Extensions

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension msjsdiag.vscode-react-native
```

## Debugging

### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Run app in development mode
3. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
4. Select "Debug" from menu

### Chrome DevTools

1. Run app
2. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
3. Select "Debug Remote JS"
4. Open Chrome DevTools at `http://localhost:8081/debugger-ui`

### Logging

```typescript
import { logger } from '@/utils/logger'

// Development only logging
logger.debug('Debug message', { data })
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error message', error)
```

Logs are stripped in production builds.

## Performance Monitoring

The app includes a performance monitoring suite in development mode:

### Access Performance Dashboard

1. Run app in dev mode
2. Tap the 📊 button (top-right)
3. View real-time metrics:
   - Memory usage
   - FPS (frames per second)
   - Render count
   - React Query cache stats

### Performance Commands

```typescript
// In development console
performance.report() // Full performance report
```

See [Performance Monitoring Guide](../performance/monitoring.md) for details.

## Build Requirements

### For App Store Submission

- **Apple Developer Account** ($99/year)
- **Xcode** (latest version)
- **Mac with macOS 13+**

### For Google Play Submission

- **Google Play Developer Account** ($25 one-time)
- **Android Studio**
- **Keystore** for app signing

### Expo Application Services (EAS)

For over-the-air updates and cloud builds:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

See [Expo EAS documentation](https://docs.expo.dev/eas/) for details.

## Common Issues

See [Troubleshooting Guide](troubleshooting.md) for solutions to common problems.

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Next Steps**:

- [Quick Start Guide](quickstart.md) - Get running quickly
- [Contributing Guide](../../CONTRIBUTING.md) - Contribution guidelines
- [API Reference](../api/index.md) - Explore the codebase
