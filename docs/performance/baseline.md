# Performance Baseline Metrics

**Collection Date**: 2025-11-26 (Pre-optimization)
**Branch**: 001-acp-mobile

## How to Collect Baseline

```bash
# 1. Start the app
npm start

# 2. Use the app normally for 2-3 minutes:
#    - Navigate to dashboard
#    - Open session details
#    - Switch between tabs
#    - Pull to refresh
#    - Return to dashboard

# 3. In development console, run:
performance.report()

# 4. Copy the output and paste below
```

## Expected Baseline (Pre-optimization)

Based on code analysis, we expect:

### Memory Usage

- **Initial**: 30-50 MB (30-40% of heap)
- **After 2-3 min use**: 50-80 MB (50-70% of heap)
- **Memory Leak Risk**: Medium-High
  - ❌ QueryClient recreated on render (FIXED in monitoring setup)
  - ❌ Theme context not memoized
  - ❌ Event listeners in Header

### Frame Rate

- **Average FPS**: 52-58 FPS
- **Slow Frames**: 5-10% of total
- **Jank Events**: During theme changes, navigation, session list scrolling

### Component Renders

Expected high render counts:

- **Header**: 150-300 renders (re-renders every minute + every refetch)
- **ThemeProvider consumers**: 100-200 renders (every theme context change)
- **SessionCard**: 50-100 renders (map recreation on dashboard)
- **Dashboard**: 30-50 renders (filter recreation)

### Network Performance

- **React Query Cache Hits**: 40-60% (suboptimal due to no staleTime)
- **Unnecessary Refetches**: High (no memoization)
- **SSE Reconnections**: Moderate

---

## Actual Baseline Results

### Memory Report

```
[Paste performance.memory.printReport() output here]
```

### FPS Report

```
[Paste performance.fps.printReport() output here]
```

### Render Report

```
[Paste getRenderTracker().printReport() output here]
```

### Full Performance Report

```
[Paste performance.report() output here]
```

---

## Post-Optimization Target Metrics

After implementing P0 fixes, we should see:

### Memory

- **Usage**: < 40 MB (< 40% of heap)
- **Leak Detection**: None
- **Growth Pattern**: Stable after initial load

### FPS

- **Average**: > 58 FPS
- **Slow Frames**: < 2%
- **Jank Events**: Minimal

### Renders

- **Header**: < 30 renders
- **ThemeProvider consumers**: < 20 renders
- **SessionCard**: < 20 renders per card
- **Dashboard**: < 15 renders

### Network

- **Cache Hits**: > 85%
- **Unnecessary Refetches**: Minimal
- **SSE Reconnections**: Stable

---

## Comparison Template

| Metric                 | Baseline | Post-P0  | Improvement |
| ---------------------- | -------- | -------- | ----------- |
| Memory Usage (avg)     | \_\_\_MB | \_\_\_MB | \_\_\_%     |
| Memory Leaks Detected  | Yes/No   | No       | -           |
| Average FPS            | \_\_\_   | \_\_\_   | \_\_\_%     |
| Slow Frame %           | \_\_\_%  | \_\_\_%  | \_\_\_%     |
| Header Renders         | \_\_\_   | \_\_\_   | \_\_\_%     |
| Theme Consumer Renders | \_\_\_   | \_\_\_   | \_\_\_%     |
| Cache Hit Rate         | \_\_\_%  | \_\_\_%  | \_\_\_%     |

---

**Instructions**:

1. Collect baseline before implementing P0 fixes
2. Save this file with actual metrics
3. After P0 implementation, collect new metrics
4. Calculate improvement percentages
5. Update Performance Analysis Report
