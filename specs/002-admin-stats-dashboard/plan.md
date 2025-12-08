# Implementation Plan: Admin Statistics Dashboard

**Branch**: `002-admin-stats-dashboard` | **Date**: 2025-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-admin-stats-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Admin-only statistics dashboard for the ACP mobile app to track usage across both web and mobile platforms. MVP focusing on essential operational metrics including Google's Golden Signals (Latency, Traffic, Errors, Saturation), user engagement (DAU/MAU), and OS tracking, with 5-minute refresh cycle and responsive design. Built as additional screens in the existing React Native + Expo app, integrating with PostHog for analytics and Sentry for error tracking.

## Technical Context

**Language/Version**: TypeScript 5.x with React Native 0.76
**Primary Dependencies**: Expo SDK 52, Expo Router, React Query v5, PostHog SDK, Sentry SDK, react-native-gifted-charts
**Storage**: React Query cache (in-memory) with 4-minute staleTime, no persistent storage for dashboard data
**Testing**: Jest + React Native Testing Library for components, NEEDS CLARIFICATION: Integration testing strategy for PostHog/Sentry data fetching
**Target Platform**: iOS 15+ and Android 12+ (same as main app)
**Project Type**: Mobile (React Native cross-platform) - feature addition to existing app
**Performance Goals**: Dashboard loads <2s, charts render <1s, 60fps scrolling, 5-minute auto-refresh without UI jank
**Constraints**: Admin-only access (role-based), responsive design (phone + tablet), <200ms UI response time, graceful degradation when analytics APIs unavailable
**Scale/Scope**: 4 dashboard screens (Overview, Golden Signals, Engagement, Platforms), 24-hour data retention for charts, supports displaying metrics for up to 100k+ users and 1M+ events/day

**Integration Requirements**:

- NEEDS CLARIFICATION: PostHog API endpoint structure, authentication method (API key vs project token), query syntax for custom analytics
- NEEDS CLARIFICATION: Sentry API integration approach (REST API vs SDK methods), authentication for fetching error metrics
- RESOLVED: Chart library = react-native-gifted-charts (uses existing react-native-svg dependency, simpler API, good performance)
- NEEDS CLARIFICATION: How to detect user platform (web vs mobile) - PostHog custom properties vs user agent parsing
- NEEDS CLARIFICATION: Backend API endpoints needed - does backend proxy PostHog/Sentry or do we call them directly from mobile?

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: ✅ PASS (No constitution file exists - using established patterns from 001-acp-mobile)

This feature extends the existing acp-mobile app architecture. Following established patterns:

- Expo Router for file-based routing (add app/admin/\* routes)
- React Query for data fetching and caching
- Component-based UI architecture (create components/admin/\*)
- Service layer for API integration (add services/analytics/\*)
- Role-based access control (extend existing auth service)
- Offline-capable with cached data (React Query stale-while-revalidate)

No new architectural patterns required. No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-stats-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── posthog-api.yaml        # PostHog query contracts
│   └── sentry-api.yaml         # Sentry metrics contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Expo Router file-based routing
├── admin/                    # NEW: Admin dashboard routes
│   ├── _layout.tsx           # Admin layout with auth guard + tab navigation
│   ├── index.tsx             # Overview dashboard (system health)
│   ├── signals.tsx           # Golden Signals dashboard
│   ├── users.tsx             # Engagement dashboard (DAU/MAU)
│   └── platforms.tsx         # Platform comparison dashboard

components/                   # Reusable UI components
├── admin/                    # NEW: Admin-specific components
│   ├── charts/               # Chart components
│   │   ├── LineChart.tsx     # Latency, traffic, DAU trends
│   │   ├── PieChart.tsx      # Active users by platform, error breakdown
│   │   ├── BarChart.tsx      # Platform comparison, new vs returning
│   │   ├── GaugeChart.tsx    # Saturation metrics (CPU, memory, DB pool)
│   │   └── ChartContainer.tsx # Responsive wrapper with loading/error states
│   ├── metrics/              # Metric display components
│   │   ├── MetricCard.tsx    # Single metric with label, value, trend
│   │   ├── StatusIndicator.tsx # Health status (healthy/degraded/down)
│   │   ├── TrendBadge.tsx    # Improving/stable/degrading indicator
│   │   └── ErrorTable.tsx    # Top errors table
│   ├── layout/               # Dashboard layout components
│   │   ├── DashboardHeader.tsx # Dashboard title + last updated time
│   │   ├── TabNavigation.tsx  # 4-tab navigation bar
│   │   └── RefreshControl.tsx # Pull-to-refresh wrapper
│   └── guards/               # Access control
│       └── AdminGuard.tsx     # Role check + redirect for non-admins

services/                     # Business logic and API integration
├── analytics/                # NEW: Analytics service layer
│   ├── posthog.ts            # PostHog query service (DAU, MAU, platform detection, OS versions)
│   ├── sentry.ts             # Sentry metrics service (errors, latency)
│   ├── metrics.ts            # Aggregated metrics calculator (system health, Golden Signals)
│   ├── types.ts              # TypeScript types for analytics data
│   └── hooks/                # React Query hooks
│       ├── useSystemHealth.ts    # Overview dashboard data
│       ├── useGoldenSignals.ts   # Golden Signals data
│       ├── useEngagement.ts      # DAU/MAU data
│       └── usePlatforms.ts       # Platform comparison data
├── auth/
│   └── role-checker.ts       # EXTEND: Add admin role validation

hooks/                        # Custom React hooks
└── useResponsiveChart.ts     # NEW: Hook for responsive chart sizing

constants/                    # App constants
└── AdminMetrics.ts           # NEW: Thresholds, refresh intervals, chart configs

tests/
├── components/admin/         # NEW: Component tests for admin dashboards
└── services/analytics/       # NEW: Service layer tests
```

**Structure Decision**: Mobile app structure (Option 3) using Expo Router file-based routing. All admin dashboard screens go in `app/admin/*` following the established pattern from `app/sessions/*`, `app/notifications/*`, and `app/settings/*`. Analytics integration follows the service layer pattern established in `services/auth/` and `services/api/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations. This feature uses established patterns from the existing app architecture.
