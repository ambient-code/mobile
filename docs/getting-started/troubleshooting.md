# Troubleshooting Guide

Common issues and solutions for acp-mobile development.

## Network Errors on Startup

### Issue: `TypeError: fetch failed` when running `npm start`

**Symptoms:**

```
TypeError: fetch failed
    at fetchWithCredentials
    at getNativeModuleVersionsAsync
```

**Cause:** Expo CLI tries to fetch version information from Expo's servers, which may fail behind corporate proxies or with network issues.

**Solutions:**

#### Option 1: Use Offline Mode (Recommended)

```bash
npm run start:offline
```

This bypasses all network checks while still allowing the development server to run.

#### Option 2: Use the Offline Script

```bash
./start-offline.sh
```

#### Option 3: Set Environment Variables

Create `.env.local`:

```bash
EXPO_NO_DOCTOR=1
EXPO_OFFLINE=1
```

Then run normal start:

```bash
npm start
```

#### Option 4: Clear Expo Cache

```bash
npx expo start -c --offline
```

---

## Port Already in Use

### Issue: `Port 8081 is running this app in another window`

**Solution:**

#### Kill the Process

```bash
# Find the process
lsof -i:8081

# Kill it
kill -9 <PID>
```

#### Or use a different port

```bash
npx expo start --port 8082
```

---

## Performance Monitoring Not Working

### Issue: Can't see performance metrics

**Solutions:**

1. **Check if you're in development mode:**
   - Performance monitoring only works in `__DEV__` mode
   - Run `npm start` (not `npm start --no-dev`)

2. **Access the dashboard:**
   - Tap the 📊 floating button in bottom-right corner
   - Or run `performance.report()` in Metro bundler console

3. **Verify monitoring is initialized:**
   - Check Metro bundler logs for:
     ```
     ✅ QueryClient initialized with optimized settings
     ✅ why-did-you-render initialized
     🔍 Performance monitoring active
     ```

---

## TypeScript Errors After Pulling Updates

### Issue: Type errors after `git pull`

**Solution:**

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run type check
npm run type-check
```

---

## Metro Bundler Issues

### Issue: "Unable to resolve module"

**Solutions:**

#### Clear Metro Cache

```bash
npx expo start -c
```

#### Reset Project

```bash
npm run reset-project
npm install
npx expo start -c
```

#### Check for Missing Dependencies

```bash
npm install
```

---

## iOS Simulator Issues

### Issue: Simulator won't open or app won't install

**Solutions:**

#### Reset Simulator

```bash
# Close all simulators
killall Simulator

# Reset specific device
xcrun simctl erase all
```

#### Rebuild

```bash
npm run ios -- --clean
```

---

## Android Emulator Issues

### Issue: Emulator won't start or app crashes

**Solutions:**

#### Check ADB

```bash
adb devices
```

#### Reverse Port

```bash
adb reverse tcp:8081 tcp:8081
```

#### Rebuild

```bash
npm run android -- --clean
```

---

## Linting/Formatting Errors

### Issue: Pre-commit hook blocks commits

**Solution:**

#### Auto-fix issues

```bash
npm run lint:fix
npm run format
```

#### Verify fixes

```bash
npm run validate
```

#### Bypass hook (not recommended)

```bash
git commit --no-verify
```

---

## Performance Issues During Development

### Issue: App is slow or laggy

**Solutions:**

1. **Check performance metrics:**

   ```typescript
   performance.report()
   ```

2. **Look for specific issues:**
   - Memory usage > 70%? Check for memory leaks
   - FPS < 50? Check for slow components
   - Many re-renders? Check component memoization

3. **Use the performance dashboard:**
   - Tap 📊 button
   - Find components with high render counts
   - Check "Slow Rendering Components" section

---

## React Query Issues

### Issue: Data not caching or excessive refetches

**Check QueryClient configuration:**

The QueryClient should be a singleton:

```typescript
// ✅ Correct - singleton pattern
let queryClient: QueryClient | null = null
function getQueryClient() { ... }

// ❌ Wrong - recreated on every render
const queryClient = new QueryClient()
```

**Verify cache settings:**

```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
gcTime: 10 * 60 * 1000,     // 10 minutes
```

---

## SSE Connection Issues

### Issue: Real-time updates not working

**Solutions:**

1. **Check connection status:**
   - Look for connection indicator in app
   - Check for error messages

2. **Verify SSE endpoint:**
   - Check `utils/constants.ts` for API_BASE_URL
   - Ensure SSE endpoint is accessible

3. **Check console for errors:**
   - Look for SSE connection errors
   - Check for CORS issues

4. **Use mock SSE for testing:**
   - Set `USE_MOCK_SSE = true` in `hooks/useRealtimeSession.ts`

---

## Getting Help

### Debugging Steps

1. **Check console logs:**
   - Metro bundler terminal
   - Browser console (for web)
   - React Native Debugger

2. **Enable verbose logging:**

   ```bash
   EXPO_DEBUG=1 npm start
   ```

3. **Check performance metrics:**

   ```typescript
   performance.report()
   ```

4. **Review recent changes:**
   ```bash
   git log --oneline -10
   ```

### Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Performance Monitoring Guide](../performance/monitoring.md)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)

### Reporting Issues

When reporting issues, include:

1. **Error message** (full stack trace)
2. **Steps to reproduce**
3. **Environment info:**
   ```bash
   npx expo-env-info
   ```
4. **Performance metrics** (if applicable):
   ```typescript
   performance.report()
   ```

---

## Quick Reference

### Start Commands

```bash
npm start                  # Normal start
npm run start:offline      # Bypass network checks
npm run ios               # iOS simulator
npm run android           # Android emulator
```

### Validation Commands

```bash
npm run validate          # Run all checks
npm run type-check        # TypeScript only
npm run lint             # ESLint only
npm run format           # Prettier format
```

### Debug Commands

```bash
npx expo start -c         # Clear cache
npx expo-doctor          # Check project health
npx expo-env-info        # Environment info
```

---

**Last Updated**: 2025-11-26
