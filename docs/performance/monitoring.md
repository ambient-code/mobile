# Performance Monitoring Guide

This guide covers the comprehensive performance monitoring system for acp-mobile.

## Overview

The app includes a complete performance monitoring suite that tracks:

- **Memory Usage** - JS heap allocation, garbage collection, memory leaks
- **Frame Rate (FPS)** - Rendering performance, slow frames, UI jank
- **Component Renders** - React re-render tracking, optimization opportunities
- **React Query** - Cache behavior, query performance, network activity

## Quick Start

### Enable Performance Monitoring

Performance monitoring is **automatically enabled in development mode**. When you run:

```bash
npm start
```

You'll see in the console:

```
✅ QueryClient initialized with optimized settings
✅ why-did-you-render initialized
🔍 Performance monitoring active
📊 Type "performance.report()" in console for metrics
```

### Access Performance Dashboard

1. **Visual Dashboard**: Tap the 📊 button in the bottom-right corner of the app
2. **Console Reports**: Type `performance.report()` in your development console
3. **Individual Reports**:
   - `performance.memory.printReport()` - Memory stats
   - `performance.fps.printReport()` - FPS stats
   - `performance.render.printReport()` - Render stats (not exposed yet)

## Monitoring Features

### 1. Memory Monitoring

**Location**: `utils/performanceMonitor.ts`

Tracks JavaScript heap memory usage to detect memory leaks and high usage.

**Automatic Alerts**:

- ⚠️ Warning at 75% memory usage
- 🔴 Critical at 90% memory usage
- 🚨 Memory leak detection (sustained growth over 10 samples)

**Configuration**:

```typescript
import { startMemoryMonitoring } from '@/utils/performanceMonitor'

const monitor = startMemoryMonitoring({
  checkIntervalMs: 15000, // Check every 15 seconds
  warningThreshold: 0.75, // Warn at 75%
  criticalThreshold: 0.9, // Critical at 90%
  onWarning: (stats) => {
    // Custom warning handler
  },
  onCritical: (stats) => {
    // Custom critical handler
  },
})
```

**API**:

```typescript
const monitor = getMemoryMonitor()

// Get current stats
const stats = monitor.getCurrentStats()
// => { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit, usagePercentage, timestamp }

// Get historical data
const history = monitor.getHistory()

// Detect memory leaks
const hasLeak = monitor.detectMemoryLeak()

// Print formatted report
monitor.printReport()

// Control monitoring
monitor.start()
monitor.stop()
```

**Expected Output**:

```
📊 Memory Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used:       45.3 MB
Total:      128.0 MB
Limit:      2048.0 MB
Usage:      35.4%
Samples:    25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 2. FPS Monitoring

**Location**: `utils/fpsMonitor.ts`

Tracks frame rendering performance to identify UI jank and slow frames.

**Target**: 60 FPS (16.67ms per frame)
**Slow Frame Threshold**: Below 45 FPS

**Automatic Alerts**:

- 🐌 Slow frame detected when FPS drops below 45
- 📉 FPS drop warning every second if below threshold

**Configuration**:

```typescript
import { startFPSMonitoring } from '@/utils/fpsMonitor'

const monitor = startFPSMonitoring({
  targetFPS: 60,
  slowFrameThreshold: 45,
  sampleSize: 60, // Number of frames to average
  onSlowFrame: (fps, frameTime) => {
    console.warn(`Slow frame: ${fps} FPS`)
  },
  onFPSDrop: (stats) => {
    console.warn(`FPS drop: ${stats.current} FPS`)
  },
})
```

**API**:

```typescript
const monitor = getFPSMonitor()

// Get current stats
const stats = monitor.getStats()
// => { current, average, min, max, slowFrameCount, totalFrames, timestamp }

// Check performance quality
const isGood = monitor.isPerformanceGood() // true if >50 FPS avg & <5% slow frames

// Get slow frame percentage
const slowPercent = monitor.getSlowFramePercentage()

// Print formatted report
monitor.printReport()

// Control monitoring
monitor.start()
monitor.stop()
monitor.reset()
```

**Expected Output**:

```
📊 FPS Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current:       58.3 FPS
Average:       59.1 FPS
Min:           45.2 FPS
Max:           60.0 FPS
Total Frames:  3542
Slow Frames:   23 (0.6%)
Performance:   ✅ Good
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 3. React Render Tracking

**Location**: `utils/renderTracker.ts`

Tracks component render counts and identifies unnecessary re-renders using `why-did-you-render`.

**Automatic Tracking**: All components are tracked automatically for render counts and timing.

**Manual Opt-in for Detailed Analysis**:

```typescript
import { enableRenderTracking } from '@/utils/renderTracker'

// Enable why-did-you-render for specific component
const MyComponent = () => {
  /* ... */
}
MyComponent.whyDidYouRender = true

// Or use the helper
enableRenderTracking(MyComponent, 'MyComponent')
```

**Hooks**:

1. **Track Component Renders**:

```typescript
import { useRenderTracker } from '@/utils/renderTracker'

function MyComponent() {
  const { renderCount, getStats } = useRenderTracker('MyComponent')

  // renderCount increments on each render
  // getStats() returns detailed metrics
}
```

2. **Debug Prop Changes**:

```typescript
import { useWhyDidYouUpdate } from '@/utils/renderTracker'

function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props)

  // Logs which props changed between renders
  // Warns if component re-rendered with same props
}
```

**API**:

```typescript
const tracker = getRenderTracker()

// Get stats for a specific component
const stats = tracker.getComponentStats('MyComponent')
// => { componentName, renderCount, lastRenderTime, averageRenderTime, totalRenderTime }

// Get all tracked components
const allStats = tracker.getAllStats()

// Find problematic components
const excessive = tracker.getExcessiveRenders(50) // >50 renders
const slow = tracker.getSlowComponents(16) // >16ms average

// Print formatted report
tracker.printReport()

// Control tracking
tracker.reset()
tracker.resetComponent('MyComponent')
```

**Expected Output**:

```
📊 React Render Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Most Rendered Components:
1. Header: 234 renders (avg: 2.1ms)
2. SessionCard: 156 renders (avg: 5.3ms)
3. Dashboard: 89 renders (avg: 12.7ms)

⚠️  Components with Excessive Renders (>50):
   ThemeProvider: 234 renders
   Header: 234 renders

🐌 Slow Rendering Components (>16ms):
   SessionsList: 18.5ms average

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 4. Visual Performance Dashboard

**Location**: `components/PerformanceMonitor.tsx`

Real-time visual overlay showing all performance metrics.

**Access**: Tap the 📊 floating button in the bottom-right corner (development only)

**Features**:

- Real-time memory usage with progress bar
- Current/Average/Min/Max FPS
- Slow frame count and percentage
- Top 10 most-rendered components
- Print full report to console
- Reset all metrics

**Color Coding**:

- 🟢 Green: Good performance (<80% threshold)
- 🟠 Orange: Warning (80-90% threshold)
- 🔴 Red: Critical (>90% threshold)

---

## Integration with Components

### Track Specific Components

**Option 1: Use `useRenderTracker` hook**

```typescript
import { useRenderTracker } from '@/utils/renderTracker'

export function SessionCard({ session }: SessionCardProps) {
  useRenderTracker('SessionCard')

  // Your component logic
}
```

**Option 2: Enable why-did-you-render**

```typescript
import { memo } from 'react'

const SessionCard = memo(({ session }: SessionCardProps) => {
  // Your component logic
})

// Enable detailed tracking
if (__DEV__) {
  SessionCard.whyDidYouRender = true
}

export default SessionCard
```

**Option 3: Debug prop changes**

```typescript
import { useWhyDidYouUpdate } from '@/utils/renderTracker'

export function Header(props: HeaderProps) {
  useWhyDidYouUpdate('Header', props)

  // If Header re-renders unnecessarily, you'll see:
  // "[Header] Re-rendered with same props (unnecessary re-render)"
  // or
  // "[Header] Props changed: { isRefetching: { from: false, to: true } }"
}
```

---

## React Query Optimizations

The QueryClient has been configured with performance optimizations:

```typescript
{
  queries: {
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000,      // 5 minutes - reduces unnecessary refetches
    gcTime: 10 * 60 * 1000,        // 10 minutes - automatic garbage collection
    networkMode: 'offlineFirst',   // Better offline support
  }
}
```

**Singleton Pattern**: QueryClient is created once and reused across renders, preventing:

- Memory leaks from multiple instances
- Cache loss on re-renders
- Unnecessary re-initialization
- Duplicate API requests

---

## Performance Testing Workflow

### 1. Baseline Metrics

Before making changes:

```typescript
// In development console
performance.report()
```

Save the output for comparison.

### 2. Identify Issues

Look for:

- Memory usage > 75%
- FPS < 50
- Components with >50 renders
- Components with >16ms average render time

### 3. Investigate Root Cause

**For excessive renders**:

```typescript
// Add to component
useWhyDidYouUpdate('MyComponent', props)

// Check logs to see what's changing
```

**For memory leaks**:

```typescript
const monitor = getMemoryMonitor()
const hasLeak = monitor.detectMemoryLeak()

if (hasLeak) {
  // Check for:
  // - Event listeners not cleaned up
  // - Subscriptions not unsubscribed
  // - Closures holding references
  // - Large objects in state
}
```

**For slow renders**:

```typescript
// Add Profiler to component
import { Profiler } from 'react'

<Profiler id="MyComponent" onRender={(id, phase, actualDuration) => {
  if (actualDuration > 16) {
    console.warn(`Slow render in ${id}: ${actualDuration}ms`)
  }
}}>
  <MyComponent />
</Profiler>
```

### 4. Apply Optimizations

Based on the [Performance Analysis Report](./analysis.md), implement fixes.

### 5. Verify Improvements

```typescript
// Reset metrics
performance.memory.reset?.()
performance.fps.reset()

// Use the app for a typical session

// Check new metrics
performance.report()
```

Compare before/after metrics to quantify improvement.

---

## Common Performance Patterns

### ✅ Good Patterns

**Memoized Context Values**:

```typescript
const contextValue = useMemo(
  () => ({ user, isAuthenticated, login, logout }),
  [user, isAuthenticated, login, logout]
)

return <Context.Provider value={contextValue}>{children}</Context.Provider>
```

**Stable Callbacks**:

```typescript
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies])
```

**Proper FlatList Configuration**:

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={15}
  maxToRenderPerBatch={15}
  windowSize={7}
  removeClippedSubviews={true}
/>
```

### ❌ Anti-patterns to Avoid

**Creating Objects in Render**:

```typescript
// Bad
<Provider value={{ user, login, logout }}>

// Good
const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
<Provider value={value}>
```

**Inline Function Props**:

```typescript
// Bad
<Button onPress={() => handlePress(item.id)} />

// Good
const handlePress = useCallback((id) => {/* ... */}, [])
<Button onPress={() => handlePress(item.id)} />
```

**Missing Cleanup**:

```typescript
// Bad
useEffect(() => {
  const subscription = subscribe()
  // Missing cleanup!
}, [])

// Good
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])
```

---

## Monitoring in Production

Performance monitoring is **disabled in production builds** to avoid overhead.

To enable production monitoring:

```typescript
// In app/_layout.tsx
const ENABLE_PROD_MONITORING = false // Set to true to enable

if (__DEV__ || ENABLE_PROD_MONITORING) {
  // Monitoring code
}
```

**Warning**: Production monitoring adds runtime overhead. Use sparingly and only for debugging specific issues.

---

## Troubleshooting

### "Performance stats not available"

Some metrics (like `performance.memory`) are only available in Chrome/V8-based environments. On iOS, memory stats may not be available.

**Solution**: Use Android emulator or Chrome debugger for full metrics.

### "No render data collected yet"

Render tracking requires components to render at least once.

**Solution**: Navigate through the app to generate render data, then check metrics.

### High memory usage immediately on launch

This is often normal as the app loads initial data and renders components.

**Solution**: Monitor for 30-60 seconds. If memory continues growing, investigate for leaks.

### FPS drops only during animations

Expected during complex animations. Check if FPS recovers after animation completes.

**Solution**: Consider using `react-native-reanimated` for smoother animations on UI thread.

---

## Next Steps

1. ✅ **Set up monitoring** (you're here!)
2. 📊 **Collect baseline metrics** - Run app and save `performance.report()` output
3. 🔍 **Review Performance Analysis** - See [Performance Analysis Report](./analysis.md)
4. 🛠️ **Implement optimizations** - Apply P0 fixes first
5. ✅ **Verify improvements** - Compare before/after metrics

---

## Resources

- [React DevTools Profiler](https://react.dev/learn/react-developer-tools#profiler)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)
- [why-did-you-render](https://github.com/welldone-software/why-did-you-render)
