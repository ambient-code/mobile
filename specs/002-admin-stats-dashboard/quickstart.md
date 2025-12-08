# Quickstart: Admin Statistics Dashboard

**Feature**: 002-admin-stats-dashboard
**Date**: 2025-11-27
**For**: Developers implementing the admin statistics dashboard

This guide provides a quick walkthrough for implementing the admin statistics dashboard feature.

## Prerequisites

- ACP mobile app development environment set up
- Access to backend API development environment (for backend team)
- PostHog account with Personal API Key (for backend team)
- Sentry account with Auth Token (for backend team)
- Admin user account for testing

## Installation

### 1. Install Gifted Charts

```bash
npm install react-native-gifted-charts
```

This library uses `react-native-svg` which is already installed in the project, so **no bundle size increase** from additional dependencies.

### 2. Verify Existing Dependencies

These should already be in `package.json`:

```json
{
  "react-native-svg": "15.12.1",
  "react-native-reanimated": "~4.1.1",
  "@tanstack/react-query": "^5.x",
  "posthog-react-native": "^4.14.0",
  "@sentry/react-native": "~7.2.0"
}
```

## Implementation Overview

### Mobile App Changes

```
app/admin/                  # NEW directory
  ├── _layout.tsx           # Admin auth guard + tab navigation
  ├── index.tsx             # Overview dashboard
  ├── signals.tsx           # Golden Signals
  ├── users.tsx             # Engagement (DAU/MAU)
  └── platforms.tsx         # Platform comparison

components/admin/           # NEW directory
  ├── charts/               # Chart components
  ├── metrics/              # Metric displays
  ├── layout/               # Dashboard layout
  └── guards/               # Access control

services/analytics/         # NEW directory
  ├── posthog.ts            # PostHog service
  ├── sentry.ts             # Sentry service
  ├── metrics.ts            # Aggregation logic
  ├── types.ts              # TypeScript types
  └── hooks/                # React Query hooks
```

**Estimated LOC**: ~2,500 lines total

- Routes: ~400 lines
- Components: ~1,200 lines
- Services: ~600 lines
- Types: ~200 lines
- Tests: ~100 lines

### Backend API Changes (Coordinate with Backend Team)

Required backend endpoints:

```
GET /api/admin/analytics/system-health
GET /api/admin/analytics/golden-signals?period=7d|30d
GET /api/admin/analytics/engagement?period=24h|7d|30d
GET /api/admin/analytics/platforms?period=30d
GET /api/admin/errors/summary?period=7d|30d
```

Backend responsibilities:

- Query PostHog Personal API
- Query Sentry REST API
- Implement Redis caching (15-30 min cache duration)
- Enforce admin role authorization
- Handle rate limiting

## Step-by-Step Implementation

### Phase 1: Backend Setup (Backend Team)

**Time estimate**: 2-3 days

1. **Set up environment variables**:

```bash
# Backend .env
POSTHOG_PERSONAL_API_KEY=phx_xxx...
POSTHOG_PROJECT_ID=12345
SENTRY_AUTH_TOKEN=sntrys_xxx...
SENTRY_ORG_SLUG=your-org
SENTRY_PROJECT_SLUG=acp-mobile
REDIS_URL=redis://...
```

2. **Implement PostHog query service**:
   - DAU/MAU calculation using HogQL Query API
   - Platform detection using `$lib`, `$device_type`, `$os` properties
   - OS version breakdown queries

3. **Implement Sentry query service**:
   - Error stats endpoint: `/api/0/projects/{org}/{project}/stats/`
   - Issue listing endpoint: `/api/0/projects/{org}/{project}/issues/`
   - Session statistics for performance metrics

4. **Create backend API endpoints** matching `contracts/backend-api.yaml`

5. **Add Redis caching layer**:

```typescript
const CACHE_DURATIONS = {
  'system-health': 5 * 60,
  'golden-signals': 5 * 60,
  engagement: 15 * 60,
  platforms: 30 * 60,
  errors: 5 * 60,
}
```

6. **Test with Postman/curl** before mobile integration

### Phase 2: Mobile Foundation (Days 1-2)

**Time estimate**: 1-2 days

1. **Create directory structure**:

```bash
mkdir -p app/admin
mkdir -p components/admin/{charts,metrics,layout,guards}
mkdir -p services/analytics/hooks
mkdir -p constants
```

2. **Implement AdminGuard component**:

```typescript
// components/admin/guards/AdminGuard.tsx
import { useAuth } from '@/services/auth/authContext'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/(tabs)')
      // Show toast: "Admin access required"
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
```

3. **Set up admin routing**:

```typescript
// app/admin/_layout.tsx
import { AdminGuard } from '@/components/admin/guards/AdminGuard'
import { Tabs } from 'expo-router'

export default function AdminLayout() {
  return (
    <AdminGuard>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Overview' }} />
        <Tabs.Screen name="signals" options={{ title: 'Signals' }} />
        <Tabs.Screen name="users" options={{ title: 'Users' }} />
        <Tabs.Screen name="platforms" options={{ title: 'Platforms' }} />
      </Tabs>
    </AdminGuard>
  )
}
```

4. **Create TypeScript types**:

```typescript
// services/analytics/types.ts
export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: Date
  metrics: {
    activeUsers: {
      total: number
      web: number
      mobile: number
      both: number
    }
    requestsPerMinute: number
    errorRate: number
    latencyP95: number
  }
  statusReasons: string[]
}

// ... (copy from data-model.md)
```

### Phase 3: Service Layer (Days 3-4)

**Time estimate**: 1-2 days

1. **Create API client wrapper**:

```typescript
// services/analytics/client.ts
import { apiClient } from '@/services/api/client'

export const analyticsApi = {
  getSystemHealth: () =>
    apiClient.get<APIResponse<SystemHealthStatus>>('/api/admin/analytics/system-health'),

  getGoldenSignals: (period: '7d' | '30d') =>
    apiClient.get<APIResponse<GoldenSignalsMetrics>>('/api/admin/analytics/golden-signals', {
      params: { period },
    }),

  // ... other endpoints
}
```

2. **Create React Query hooks**:

```typescript
// services/analytics/hooks/useSystemHealth.ts
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../client'

export function useSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: async () => {
      const response = await analyticsApi.getSystemHealth()
      return response.data
    },
    staleTime: 4 * 60 * 1000, // 4 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes auto-refresh
  })
}
```

3. **Create all hooks** for each dashboard:
   - `useSystemHealth.ts`
   - `useGoldenSignals.ts`
   - `useEngagement.ts`
   - `usePlatformDistribution.ts`
   - `useErrorSummary.ts`

### Phase 4: Chart Components (Days 5-7)

**Time estimate**: 2-3 days

1. **Create ChartContainer wrapper**:

```typescript
// components/admin/charts/ChartContainer.tsx
import { View, Text, ActivityIndicator } from 'react-native'

interface ChartContainerProps {
  title: string
  loading?: boolean
  error?: string
  children: React.ReactNode
}

export function ChartContainer({ title, loading, error, children }: ChartContainerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {loading && <ActivityIndicator />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && children}
    </View>
  )
}
```

2. **Implement LineChart component**:

```typescript
// components/admin/charts/LineChart.tsx
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts'
import { ChartContainer } from './ChartContainer'
import { useResponsiveChart } from '@/hooks/useResponsiveChart'

interface LineChartProps {
  title: string
  data: Array<{ timestamp: Date; value: number }>
  loading?: boolean
  error?: string
  color?: string
}

export function LineChart({ title, data, loading, error, color = '#007AFF' }: LineChartProps) {
  const { chartHeight, fontSize } = useResponsiveChart()

  const chartData = data.map(d => ({
    value: d.value,
    label: formatTime(d.timestamp),
  }))

  return (
    <ChartContainer title={title} loading={loading} error={error}>
      <GiftedLineChart
        data={chartData}
        height={chartHeight}
        color={color}
        thickness={2}
        curved
        animateOnDataChange
        animationDuration={800}
        spacing={40}
        initialSpacing={10}
        noOfSections={5}
        yAxisTextStyle={{ color: 'gray', fontSize }}
        xAxisLabelTextStyle={{ color: 'gray', fontSize: fontSize - 2 }}
      />
    </ChartContainer>
  )
}
```

3. **Implement remaining chart types**:
   - `PieChart.tsx` - Active users by platform (use `<PieChart />` from react-native-gifted-charts)
   - `BarChart.tsx` - Platform comparison (use `<BarChart />` with stacked support)
   - `GaugeChart.tsx` - Saturation metrics (can use progress bars or custom component)

4. **Add responsive sizing hook**:

```typescript
// hooks/useResponsiveChart.ts
import { useWindowDimensions } from 'react-native'

export function useResponsiveChart() {
  const { width } = useWindowDimensions()

  return {
    isMobile: width < 768,
    fontSize: width < 768 ? 10 : 14,
    chartHeight: width < 768 ? 200 : 300,
    labelAngle: width < 768 ? -45 : 0,
  }
}
```

### Phase 5: Metric Display Components (Day 8)

**Time estimate**: 1 day

1. **Create MetricCard**:

```typescript
// components/admin/metrics/MetricCard.tsx
interface MetricCardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  status?: 'success' | 'warning' | 'error'
}

export function MetricCard({ label, value, trend, status }: MetricCardProps) {
  return (
    <View style={[styles.card, statusStyles[status]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && <TrendBadge trend={trend} />}
    </View>
  )
}
```

2. **Create StatusIndicator**:

```typescript
// components/admin/metrics/StatusIndicator.tsx
interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'down'
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const colors = {
    healthy: 'green',
    degraded: 'yellow',
    down: 'red',
  }

  return (
    <View style={[styles.indicator, { backgroundColor: colors[status] }]}>
      <Text style={styles.text}>{status.toUpperCase()}</Text>
    </View>
  )
}
```

3. **Create TrendBadge** and **ErrorTable**

### Phase 6: Dashboard Screens (Days 9-12)

**Time estimate**: 3-4 days

1. **Implement Overview Dashboard**:

```typescript
// app/admin/index.tsx
import { useSystemHealth } from '@/services/analytics/hooks/useSystemHealth'
import { MetricCard } from '@/components/admin/metrics/MetricCard'
import { StatusIndicator } from '@/components/admin/metrics/StatusIndicator'

export default function OverviewDashboard() {
  const { data, isLoading, error, refetch } = useSystemHealth()

  return (
    <ScrollView refreshControl={<RefreshControl onRefresh={refetch} />}>
      <StatusIndicator status={data?.status ?? 'down'} />

      <MetricCard
        label="Active Users"
        value={data?.metrics.activeUsers.total ?? 0}
      />

      <MetricCard
        label="Error Rate"
        value={`${data?.metrics.errorRate.toFixed(2)}%`}
        status={data?.status === 'healthy' ? 'success' : 'warning'}
      />

      {/* ... more metrics */}
    </ScrollView>
  )
}
```

2. **Implement Golden Signals Dashboard** with 4 chart panels:
   - Latency (line chart with p50, p95, p99)
   - Traffic (line chart + active sessions metric)
   - Errors (line chart + pie chart + table)
   - Saturation (3 gauge charts)

3. **Implement Engagement Dashboard**:
   - DAU trend line chart
   - MAU metric card
   - Stickiness metric card
   - New vs Returning bar chart

4. **Implement Platform Comparison Dashboard**:
   - Active users pie chart
   - Platform-specific error rates
   - OS version breakdowns (tables)

### Phase 7: Testing (Days 13-14)

**Time estimate**: 1-2 days

1. **Component tests**:

```typescript
// app/admin/__tests__/index.test.tsx
import { render, screen } from '@testing-library/react-native'
import OverviewDashboard from '../index'

jest.mock('@/services/analytics/hooks/useSystemHealth', () => ({
  useSystemHealth: () => ({
    data: mockHealthData,
    isLoading: false,
    error: null,
  }),
}))

test('displays system status', () => {
  render(<OverviewDashboard />)
  expect(screen.getByText('HEALTHY')).toBeTruthy()
})
```

2. **Integration tests** for React Query hooks

3. **Manual testing checklist**:
   - [ ] Admin user can access all 4 dashboards
   - [ ] Non-admin redirected with message
   - [ ] Pull-to-refresh works on all screens
   - [ ] Auto-refresh every 5 minutes works
   - [ ] Charts display correctly on phone (375px width)
   - [ ] Charts display correctly on tablet (768px+ width)
   - [ ] Loading states show correctly
   - [ ] Error states show "Unable to load metrics" with retry
   - [ ] Cached data shows with "Last updated: X mins ago"
   - [ ] All thresholds work (healthy/degraded/down)

### Phase 8: Polish & Deployment (Day 15)

**Time estimate**: 1 day

1. **Add constants file**:

```typescript
// constants/AdminMetrics.ts
export const ADMIN_METRICS = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 4 * 60 * 1000, // 4 minutes
  CACHE_TIME: 15 * 60 * 1000, // 15 minutes

  HEALTH_THRESHOLDS: {
    ERROR_RATE_WARNING: 1, // 1% = degraded
    ERROR_RATE_CRITICAL: 5, // 5% = down
    LATENCY_WARNING: 100, // 100ms = degraded
    LATENCY_CRITICAL: 500, // 500ms = down
  },

  CHART_COLORS: {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
}
```

2. **Update agent context**:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

3. **Create feature documentation** (optional)

4. **Submit PR** with:
   - All code changes
   - Updated package.json
   - Test coverage report
   - Screenshots of all 4 dashboards

## Testing Your Implementation

### 1. Backend Testing (Backend Team)

Test each endpoint with curl/Postman:

```bash
# System health
curl -H "Authorization: Bearer $JWT" \
  https://api.acp.example.com/api/admin/analytics/system-health

# Golden Signals
curl -H "Authorization: Bearer $JWT" \
  "https://api.acp.example.com/api/admin/analytics/golden-signals?period=7d"

# Expected response format
{
  "data": { ... },
  "cached": false,
  "lastUpdated": "2025-11-27T10:30:00Z",
  "error": null
}
```

### 2. Mobile Testing

**Development mode**:

```bash
npm start
# Press 'i' for iOS or 'a' for Android
```

**Test scenarios**:

1. Log in as admin user → navigate to "Admin" tab
2. Verify all 4 dashboards load
3. Pull down to refresh → verify data updates
4. Wait 5 minutes → verify auto-refresh
5. Log out, log in as non-admin → verify redirect
6. Turn off WiFi → verify error states
7. Turn on WiFi → verify retry works

### 3. Performance Testing

Use React DevTools Profiler to verify:

- Dashboard loads < 2s
- Chart render < 1s
- 60fps scrolling
- No memory leaks over 1 hour

## Common Issues & Solutions

### Issue: "Admin access required" error for admin users

**Solution**: Check JWT token contains `role: "admin"`:

```typescript
// Decode JWT in browser console
const token = localStorage.getItem('jwt')
const decoded = JSON.parse(atob(token.split('.')[1]))
console.log(decoded.role) // should be "admin"
```

### Issue: Charts not rendering

**Solution**: Verify react-native-svg is installed:

```bash
npm list react-native-svg
# Should show: react-native-svg@15.12.1 (or higher)
```

If charts still don't render, check that you're importing from the correct package:

```typescript
// Correct
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts'

// Wrong
import { LineChart } from 'victory-native-xl'
```

### Issue: "Unable to load metrics" even when backend is up

**Solution**: Check CORS headers on backend:

```typescript
// Backend should include:
Access-Control-Allow-Origin: https://your-app.com
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Issue: Auto-refresh not working

**Solution**: React Query refetchInterval requires app to be in foreground:

```typescript
// Add focus refetch
refetchOnWindowFocus: true,
refetchOnMount: true,
```

### Issue: Stale data after backend changes

**Solution**: Invalidate React Query cache:

```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['admin'] })
```

## Next Steps After Implementation

1. **Monitor Performance**:
   - Set up Sentry performance monitoring for dashboard screens
   - Track "Dashboard Load Time" custom metric
   - Monitor chart render performance

2. **Gather Feedback**:
   - Share with admin users for feedback
   - Iterate on dashboard layouts based on usage

3. **Future Enhancements** (not in MVP):
   - Custom date range picker
   - Export metrics to CSV
   - Email alerts for degraded/down status
   - Custom dashboard builder
   - Real-time WebSocket updates (instead of 5-min polling)

## Resources

- **Spec**: `specs/002-admin-stats-dashboard/spec.md`
- **Plan**: `specs/002-admin-stats-dashboard/plan.md`
- **Data Model**: `specs/002-admin-stats-dashboard/data-model.md`
- **API Contract**: `specs/002-admin-stats-dashboard/contracts/backend-api.yaml`
- **Gifted Charts Docs**: https://gifted-charts.web.app/ (interactive examples)
- **Gifted Charts GitHub**: https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts
- **PostHog API Docs**: https://posthog.com/docs/api
- **Sentry API Docs**: https://docs.sentry.io/api/

## Contact

For questions about this implementation:

- Mobile team: Slack #acp-mobile
- Backend team: Slack #acp-backend
- Design questions: Review spec.md and data-model.md first
