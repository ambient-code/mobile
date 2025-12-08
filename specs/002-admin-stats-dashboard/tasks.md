# Tasks: Admin Statistics Dashboard

**Feature**: 002-admin-stats-dashboard
**Input**: Design documents from `/specs/002-admin-stats-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/backend-api.yaml, quickstart.md

**Tests**: Tests are marked as OPTIONAL. Include test tasks only if your team follows TDD practices.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- File paths are absolute from repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Gifted Charts library setup

- [ ] T001 Install react-native-gifted-charts: `npm install react-native-gifted-charts`
- [ ] T002 Verify react-native-svg is installed (should be v15.12.1 from existing dependencies)
- [ ] T003 [P] Create admin directory structure: `app/admin/`, `components/admin/{charts,metrics,layout,guards}`, `services/analytics/hooks`, `constants/`
- [ ] T004 [P] Create TypeScript types file at `services/analytics/types.ts` from data-model.md
- [ ] T005 [P] Create constants file at `constants/AdminMetrics.ts` (refresh intervals, thresholds, colors)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Prerequisites (Coordinate with Backend Team)

**NOTE**: These backend tasks are blockers for ALL mobile user stories. Backend team must complete these first.

- [ ] T006 [Backend] Set up PostHog Personal API Key and Sentry Auth Token in backend environment variables
- [ ] T007 [Backend] Implement PostHog query service (DAU/MAU, platform detection, OS versions using HogQL Query API)
- [ ] T008 [Backend] Implement Sentry query service (error stats, issue listing, performance metrics)
- [ ] T009 [Backend] Create Redis caching layer with appropriate cache durations (5-30 min)
- [ ] T010 [Backend] Implement backend API endpoints per `contracts/backend-api.yaml`:
  - `/api/admin/analytics/system-health`
  - `/api/admin/analytics/golden-signals?period=7d|30d`
  - `/api/admin/analytics/engagement?period=24h|7d|30d`
  - `/api/admin/analytics/platforms?period=30d`
  - `/api/admin/errors/summary?period=7d|30d`
- [ ] T011 [Backend] Add admin role authorization to all analytics endpoints (check JWT role === 'admin')
- [ ] T012 [Backend] Test all endpoints with Postman/curl before mobile integration

### Mobile Prerequisites

- [ ] T013 Implement AdminGuard component at `components/admin/guards/AdminGuard.tsx` (role check + redirect)
- [ ] T014 Create admin routing layout at `app/admin/_layout.tsx` with AdminGuard and 4-tab navigation (Overview, Signals, Users, Platforms)
- [ ] T015 [P] Create analytics API client wrapper at `services/analytics/client.ts` (wraps existing apiClient)
- [ ] T016 [P] Create ChartContainer wrapper component at `components/admin/charts/ChartContainer.tsx` (title, loading, error states)
- [ ] T017 [P] Create useResponsiveChart hook at `hooks/useResponsiveChart.ts` (mobile/desktop sizing logic)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Real-Time System Health (Priority: P1) 🎯 MVP

**Goal**: Admin can see at-a-glance system health metrics including active users, error rate, latency, and status (healthy/degraded/down)

**Independent Test**: Log in as admin, navigate to /admin/stats, verify Overview dashboard displays active users (total/web/mobile), requests per minute, error rate, p95 latency, and color-coded system status. Verify non-admin users are redirected.

### Tests for User Story 1 (OPTIONAL)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US1] Contract test for `/api/admin/analytics/system-health` in `tests/services/analytics/client.test.ts`
- [ ] T019 [P] [US1] Component test for AdminGuard redirect logic in `components/admin/guards/__tests__/AdminGuard.test.tsx`
- [ ] T020 [P] [US1] Integration test for Overview dashboard in `app/admin/__tests__/index.test.tsx`

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create SystemHealthStatus interface and related types in `services/analytics/types.ts` (if not already from T004)
- [ ] T022 [US1] Implement useSystemHealth React Query hook at `services/analytics/hooks/useSystemHealth.ts` (staleTime: 4min, cacheTime: 15min, refetchInterval: 5min)
- [ ] T023 [P] [US1] Create MetricCard component at `components/admin/metrics/MetricCard.tsx` (label, value, trend, status)
- [ ] T024 [P] [US1] Create StatusIndicator component at `components/admin/metrics/StatusIndicator.tsx` (healthy/degraded/down with colors)
- [ ] T025 [P] [US1] Create DashboardHeader component at `components/admin/layout/DashboardHeader.tsx` (title + last updated timestamp)
- [ ] T026 [P] [US1] Create RefreshControl wrapper at `components/admin/layout/RefreshControl.tsx` (pull-to-refresh gesture)
- [ ] T027 [US1] Implement Overview dashboard screen at `app/admin/index.tsx`:
  - Use useSystemHealth hook
  - Display StatusIndicator
  - Display 4 MetricCards: Active Users (total), Requests/min, Error Rate, Latency P95
  - Show active user breakdown (web/mobile/both) in smaller cards
  - Add pull-to-refresh
  - Handle loading/error states
- [ ] T028 [US1] Add status reason messages display when status !== 'healthy'
- [ ] T029 [US1] Verify admin role check works (redirect non-admins with "Admin access required" message)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Admin can view system health metrics.

---

## Phase 4: User Story 2 - Monitor SRE Golden Signals (Priority: P1)

**Goal**: Admin can view detailed SRE metrics (Latency, Traffic, Errors, Saturation) over time to identify trends and diagnose performance issues

**Independent Test**: Navigate to "Signals" tab, verify 4 panels display: Latency (p50/p95/p99 line chart with 24h data), Traffic (RPM line chart + active sessions), Errors (error rate chart + 4xx/5xx pie + top 5 errors table), Saturation (CPU/memory/DB pool gauges)

### Tests for User Story 2 (OPTIONAL)

- [ ] T030 [P] [US2] Contract test for `/api/admin/analytics/golden-signals` in `tests/services/analytics/client.test.ts`
- [ ] T031 [P] [US2] Component test for LineChart with Victory Native XL in `components/admin/charts/__tests__/LineChart.test.tsx`
- [ ] T032 [P] [US2] Integration test for Golden Signals dashboard in `app/admin/__tests__/signals.test.tsx`

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create GoldenSignalsMetrics interface and related types in `services/analytics/types.ts`
- [ ] T034 [US2] Implement useGoldenSignals React Query hook at `services/analytics/hooks/useGoldenSignals.ts` (with period parameter: 7d|30d)
- [ ] T035 [P] [US2] Create LineChart component at `components/admin/charts/LineChart.tsx` using react-native-gifted-charts `<LineChart />` with curved lines and animations
- [ ] T036 [P] [US2] Create PieChart component at `components/admin/charts/PieChart.tsx` using react-native-gifted-charts `<PieChart />` for error breakdown (4xx vs 5xx)
- [ ] T037 [P] [US2] Create GaugeChart component at `components/admin/charts/GaugeChart.tsx` for saturation metrics (can use progress bars or custom circular gauge)
- [ ] T038 [P] [US2] Create TrendBadge component at `components/admin/metrics/TrendBadge.tsx` (improving/stable/degrading indicator)
- [ ] T039 [P] [US2] Create ErrorTable component at `components/admin/metrics/ErrorTable.tsx` (top 5 errors with message, count, last seen)
- [ ] T040 [US2] Implement Golden Signals dashboard screen at `app/admin/signals.tsx`:
  - Use useGoldenSignals hook
  - **Latency Panel**: LineChart with p50/p95/p99 lines, TrendBadge, current p95 MetricCard
  - **Traffic Panel**: LineChart for RPM over time, MetricCard for current RPM, MetricCard for active sessions
  - **Errors Panel**: LineChart for error rate %, PieChart for 4xx/5xx breakdown, ErrorTable for top 5 errors
  - **Saturation Panel**: 3 GaugeCharts (CPU %, Memory %, DB Pool %) with warning/critical thresholds
  - Add pull-to-refresh
  - Handle loading/error states
- [ ] T041 [US2] Add period selector (7d/30d toggle) to Golden Signals dashboard
- [ ] T042 [US2] Implement responsive chart sizing using useResponsiveChart hook (stack vertically on mobile)
- [ ] T043 [US2] Verify auto-refresh works after 5 minutes without user action

**Checkpoint**: User Story 2 complete. Admin can view all 4 Golden Signals with historical trends.

---

## Phase 5: User Story 3 - Analyze User Engagement Patterns (Priority: P2)

**Goal**: Admin can track DAU, MAU, stickiness, and new vs returning user patterns to measure platform adoption and retention

**Independent Test**: Navigate to "Users" tab, verify displays: DAU trend line chart (hourly for 24h), MAU metric card, stickiness % metric card, new vs returning stacked bar chart

### Tests for User Story 3 (OPTIONAL)

- [ ] T044 [P] [US3] Contract test for `/api/admin/analytics/engagement` in `tests/services/analytics/client.test.ts`
- [ ] T045 [P] [US3] Component test for BarChart (new vs returning) in `components/admin/charts/__tests__/BarChart.test.tsx`
- [ ] T046 [P] [US3] Integration test for Engagement dashboard in `app/admin/__tests__/users.test.tsx`

### Implementation for User Story 3

- [ ] T047 [P] [US3] Create EngagementMetrics interface and related types in `services/analytics/types.ts`
- [ ] T048 [US3] Implement useEngagement React Query hook at `services/analytics/hooks/useEngagement.ts` (with period parameter: 24h|7d|30d)
- [ ] T049 [P] [US3] Create BarChart component at `components/admin/charts/BarChart.tsx` using react-native-gifted-charts `<BarChart />` with built-in stacked bar support for new vs returning users
- [ ] T050 [US3] Implement Engagement dashboard screen at `app/admin/users.tsx`:
  - Use useEngagement hook
  - DAU Trend: LineChart showing hourly unique users over 24h
  - MAU: MetricCard showing 30-day unique users
  - Stickiness: MetricCard showing (DAU/MAU) × 100%, display "N/A" if MAU = 0
  - New vs Returning: BarChart with hourly buckets for last 24h
  - Add pull-to-refresh
  - Handle loading/error states
- [ ] T051 [US3] Handle zero active users edge case (show "No data yet" message instead of empty charts)
- [ ] T052 [US3] Add period selector (24h/7d/30d toggle) for DAU trend

**Checkpoint**: User Story 3 complete. Admin can analyze user engagement metrics.

---

## Phase 6: User Story 4 - Compare Web vs Mobile Usage (Priority: P2)

**Goal**: Admin can see platform-specific metrics (web vs mobile) and OS version distributions to understand how users access the platform

**Independent Test**: Navigate to "Platforms" tab, verify displays: active users pie chart (web/mobile/both), platform-specific error rates, requests/min comparison, OS version breakdowns for iOS/Android/macOS/Windows/Linux

### Tests for User Story 4 (OPTIONAL)

- [ ] T053 [P] [US4] Contract test for `/api/admin/analytics/platforms` in `tests/services/analytics/client.test.ts`
- [ ] T054 [P] [US4] Integration test for Platform Comparison dashboard in `app/admin/__tests__/platforms.test.tsx`

### Implementation for User Story 4

- [ ] T055 [P] [US4] Create PlatformDistribution interface and related types in `services/analytics/types.ts`
- [ ] T056 [US4] Implement usePlatformDistribution React Query hook at `services/analytics/hooks/usePlatformDistribution.ts` (period: 30d)
- [ ] T057 [US4] Implement Platform Comparison dashboard screen at `app/admin/platforms.tsx`:
  - Use usePlatformDistribution hook
  - Active Users: PieChart showing web/mobile/both percentages
  - Platform Stats: 2 MetricCards (web error rate, mobile error rate)
  - Requests/min: BarChart comparing web vs mobile traffic over 24h
  - Mobile OS Versions: Table/list showing iOS and Android versions with count and percentage
  - Web OS Versions: Table/list showing macOS, Windows, Linux versions with count and percentage
  - Add pull-to-refresh
  - Handle loading/error states
- [ ] T058 [US4] Handle unknown OS versions (categorize as "Unknown" and include in totals)
- [ ] T059 [US4] Add sorting to OS version tables (by count descending)

**Checkpoint**: User Story 4 complete. Admin can compare web vs mobile platform usage.

---

## Phase 7: User Story 5 - Navigate Between Dashboard Views (Priority: P1)

**Goal**: Admin can easily switch between different dashboard views (Overview, Signals, Users, Platforms) without friction

**Independent Test**: Verify tab navigation is present on all admin screens with correct icons, tapping tabs navigates correctly, active tab is visually indicated, navigation state persists when leaving and returning

### Implementation for User Story 5

> **NOTE**: Most of this was implemented in Phase 2 (T014), these tasks are refinements

- [ ] T060 [US5] Add tab icons to admin layout navigation in `app/admin/_layout.tsx` (dashboard, chart-line, users, devices icons from @expo/vector-icons)
- [ ] T061 [US5] Implement tab state persistence (return to last viewed tab when navigating back to admin)
- [ ] T062 [US5] Add touch-friendly tab spacing for mobile (minimum 44x44 points touch targets)
- [ ] T063 [US5] Add mouse hover states for desktop tab navigation
- [ ] T064 [US5] Test keyboard navigation for tabs (tab key, arrow keys)

**Checkpoint**: User Story 5 complete. Tab navigation is functional and accessible.

---

## Phase 8: User Story 6 - View Dashboards Responsively Across Devices (Priority: P2)

**Goal**: Admin can view statistics dashboards on both mobile devices (touch) and desktop computers (mouse/keyboard) with appropriate layouts

**Independent Test**: View dashboards on mobile phone (375px width), tablet (768px), and desktop (1024px+). Verify: charts stack vertically on mobile, multi-column layouts on desktop, labels sized appropriately, X-axis labels angled on mobile

### Implementation for User Story 6

> **NOTE**: Much of this was handled by useResponsiveChart hook (T017) and chart implementations, these tasks are refinements

- [ ] T065 [US6] Add responsive layout logic to all dashboard screens:
  - Mobile (< 768px): Single column, charts stacked vertically
  - Tablet (768-1023px): 2 columns
  - Desktop (≥ 1024px): 3 columns for metric cards, 2 columns for charts
- [ ] T066 [US6] Update all chart components to use useResponsiveChart sizing (font sizes, heights, label angles)
- [ ] T067 [US6] Set X-axis label angle to -45° on mobile in LineChart and BarChart components
- [ ] T068 [US6] Remove data point dots from line charts on mobile (performance optimization)
- [ ] T069 [US6] Test charts on iPhone SE (375px width minimum) - verify readability
- [ ] T070 [US6] Test charts on desktop (1920px width) - verify hover states work
- [ ] T071 [US6] Verify all metric cards are readable on smallest supported screen size

**Checkpoint**: User Story 6 complete. Dashboards work responsively across all device sizes.

---

## Phase 9: Edge Cases & Error Handling

**Purpose**: Handle all edge cases identified in spec.md to ensure robust dashboard behavior

- [ ] T072 [P] Implement "Analytics API unavailable" error state (show cached data with "Last updated: X mins ago" if available, else show "Unable to load metrics" with retry button)
- [ ] T073 [P] Implement zero active users handling (show "No data yet" message in engagement dashboard, stickiness shows "N/A")
- [ ] T074 [P] Handle concurrent web+mobile sessions correctly (user counted once in total, once in web, once in mobile, once in "both")
- [ ] T075 [P] Handle malformed OS version data (categorize as "Unknown", include in totals and percentages)
- [ ] T076 [P] Verify error rate threshold boundaries (1% = degraded, 5% = down) - inclusive on upper bound
- [ ] T077 [P] Handle large numbers formatting (comma separators for 1,234,567; abbreviated notation 1M/1K for chart axes)
- [ ] T078 [P] Prevent deep link to specific admin tab for non-admin users (redirect to main app regardless of tab requested)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, performance optimization, and production readiness

### Performance & Optimization

- [ ] T079 [P] Optimize chart render performance (verify 60fps scrolling with full 24h datasets)
- [ ] T080 [P] Test memory usage over 1 hour of continuous dashboard viewing (ensure no memory leaks)
- [ ] T081 [P] Verify dashboard loads < 2s on both mobile and desktop
- [ ] T082 [P] Verify chart render time < 1s for all chart types

### Documentation & Testing

- [ ] T083 [P] Add JSDoc comments to all public components and hooks
- [ ] T084 [P] Create screenshot examples for all 4 dashboards (for PR/documentation)
- [ ] T085 [P] Update CLAUDE.md with new technologies added (Victory Native XL, Redis caching strategy)
- [ ] T086 Update feature branch status to "Complete" in `specs/002-admin-stats-dashboard/spec.md`

### Integration & Deployment

- [ ] T087 Test complete flow as admin user (navigate all 4 dashboards, verify data accuracy, test refresh)
- [ ] T088 Test complete flow as non-admin user (verify redirect + error message on all admin routes)
- [ ] T089 Test offline behavior (turn off WiFi, verify error states, turn on WiFi, verify recovery)
- [ ] T090 Coordinate with backend team to deploy analytics endpoints to staging environment
- [ ] T091 End-to-end testing on staging environment (iOS physical device, Android physical device, desktop browser)
- [ ] T092 Performance profiling with React DevTools (identify any render performance bottlenecks)
- [ ] T093 Submit PR with all changes, test coverage report, and dashboard screenshots

---

## Dependencies & Execution Order

### Critical Path (Blocking Dependencies)

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundation) ← Backend endpoints MUST be ready
  ↓
┌─────────────────────────────────────────────────┐
│ User Stories 1-6 can now run in parallel        │
│ (Each story is independently testable)          │
├─────────────────────────────────────────────────┤
│ US1 (Overview) ← RECOMMENDED MVP                │
│ US2 (Golden Signals)                            │
│ US3 (Engagement)                                │
│ US4 (Platform Comparison)                       │
│ US5 (Navigation) ← Depends on US1-4 screens     │
│ US6 (Responsive) ← Refinement of US1-4          │
└─────────────────────────────────────────────────┘
  ↓
Phase 9 (Edge Cases) ← Can run after any story is complete
  ↓
Phase 10 (Polish) ← All user stories must be complete
```

### User Story Dependencies

- **US1** (Overview): No dependencies - can be first MVP
- **US2** (Golden Signals): No dependencies - can run in parallel with US1
- **US3** (Engagement): No dependencies - can run in parallel with US1, US2
- **US4** (Platform Comparison): No dependencies - can run in parallel with US1, US2, US3
- **US5** (Navigation): Soft dependency on US1-4 screens existing (can implement early with placeholder screens)
- **US6** (Responsive Design): Refinement of US1-4 implementations

### Parallel Execution Examples

**Scenario 1: Single Developer**

1. Complete Phase 1 (Setup) → Phase 2 (Foundation)
2. Implement US1 (Overview) as MVP → Deploy to staging → Gather feedback
3. Implement US2 (Golden Signals) → Deploy
4. Implement US3 (Engagement) and US4 (Platforms) in parallel (different files)
5. Refine US5 (Navigation) and US6 (Responsive)
6. Complete Phase 9 (Edge Cases) and Phase 10 (Polish)

**Scenario 2: Team of 3 Developers**

Developer A:

- Phase 1-2 (Setup + Foundation)
- US1 (Overview)
- US2 (Golden Signals)

Developer B (in parallel with A after Phase 2):

- US3 (Engagement)
- US4 (Platform Comparison)

Developer C (in parallel with A & B after Phase 2):

- Chart components (T035-T039, T049)
- Metric components (T023-T024)
- Edge cases (Phase 9)

**Scenario 3: Frontend + Backend Split**

Backend Team (MUST START FIRST):

- T006-T012 (PostHog/Sentry integration + API endpoints)
- Deploy to staging before mobile team starts Phase 3

Frontend Team (mobile):

- Phase 1-2 (Setup + Foundation) while backend works
- Once backend staging ready: US1-6 in priority order

---

## Testing Checklist

### Manual Testing Scenarios

**Admin User Flow**:

- [ ] Log in as admin user
- [ ] Navigate to /admin/stats (Overview dashboard)
- [ ] Verify Overview displays: status indicator, active users, error rate, latency, requests/min
- [ ] Verify status color matches thresholds (green < 1% error, yellow 1-5%, red > 5%)
- [ ] Pull down to refresh → verify metrics update
- [ ] Navigate to "Signals" tab
- [ ] Verify 4 panels: Latency (3 lines), Traffic (chart + metrics), Errors (chart + pie + table), Saturation (3 gauges)
- [ ] Navigate to "Users" tab
- [ ] Verify DAU trend chart, MAU metric, stickiness %, new vs returning chart
- [ ] Navigate to "Platforms" tab
- [ ] Verify pie chart, error rates, OS version tables
- [ ] Wait 5 minutes → verify auto-refresh triggers
- [ ] Check "Last updated" timestamp changes

**Non-Admin User Flow**:

- [ ] Log in as developer or regular user (not admin)
- [ ] Attempt to navigate to /admin/stats
- [ ] Verify redirected to main app
- [ ] Verify "Admin access required" message displays

**Error Scenarios**:

- [ ] Turn off WiFi
- [ ] Navigate to admin dashboards
- [ ] Verify "Unable to load metrics" error displays
- [ ] If cached data exists, verify it displays with "Last updated" indicator
- [ ] Tap retry button
- [ ] Turn on WiFi
- [ ] Verify metrics load successfully

**Responsive Design**:

- [ ] Test on iPhone SE (375px width) - verify charts readable
- [ ] Test on iPad (768px width) - verify 2-column layout
- [ ] Test on desktop (1920px width) - verify 3-column layout
- [ ] Verify font sizes: 10-12px mobile, 12-14px desktop
- [ ] Verify X-axis labels angled on mobile, horizontal on desktop
- [ ] Verify touch targets minimum 44x44 points on mobile
- [ ] Verify mouse hover states work on desktop

**Edge Cases**:

- [ ] Test with zero active users (verify "No data yet" message)
- [ ] Test with MAU = 0 (verify stickiness shows "N/A")
- [ ] Test with error rate exactly at thresholds (1%, 5%)
- [ ] Test with large numbers (millions of users) - verify formatting

### Automated Testing (if tests implemented)

- [ ] Run all contract tests: `npm run test services/analytics/client.test.ts`
- [ ] Run all component tests: `npm run test components/admin/`
- [ ] Run all integration tests: `npm run test app/admin/`
- [ ] Verify test coverage ≥ 80% for admin modules

---

## Implementation Strategy

### MVP Scope (Recommended)

**Minimum Viable Product** = Phase 1 + Phase 2 + US1 (Overview Dashboard)

This provides:

- ✅ Admin access control
- ✅ System health monitoring (most critical operational need)
- ✅ Foundation for adding more dashboards incrementally

**Estimated effort**: 3-5 days (1 developer)

### Incremental Delivery Plan

**Week 1**: MVP (US1)

- T001-T029: Setup + Foundation + Overview Dashboard
- Deploy to staging, gather admin user feedback

**Week 2**: Golden Signals (US2)

- T030-T043: Charts + Golden Signals Dashboard
- Deploy to staging, validate metrics accuracy with backend team

**Week 3**: Engagement + Platforms (US3, US4)

- T044-T059: Engagement and Platform dashboards in parallel
- Deploy to staging, validate DAU/MAU calculations

**Week 4**: Polish + Deployment (US5, US6, Phase 9-10)

- T060-T093: Navigation refinements, responsive design, edge cases, polish
- Full QA testing cycle
- Deploy to production

### Parallelization Opportunities

**High parallelization** (different files, no dependencies):

- All chart component tasks: T035-T039, T049
- All metric component tasks: T023-T024, T038
- Backend API endpoints: T007-T010 (backend team)
- User Story 3 and 4 implementations: T047-T052 (US3) and T055-T059 (US4)
- Edge case handling tasks: T072-T078
- Polish tasks: T079-T085

**Must be sequential**:

- Setup → Foundation → User Stories
- Hook implementation → Screen implementation (within same story)
- Backend endpoints → Mobile integration

---

## Summary

**Total Tasks**: 93 tasks

- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundation): 12 tasks (7 backend, 5 mobile)
- Phase 3 (US1): 12 tasks (3 optional tests + 9 implementation)
- Phase 4 (US2): 14 tasks (3 optional tests + 11 implementation)
- Phase 5 (US3): 9 tasks (3 optional tests + 6 implementation)
- Phase 6 (US4): 8 tasks (2 optional tests + 6 implementation)
- Phase 7 (US5): 5 tasks
- Phase 8 (US6): 7 tasks
- Phase 9 (Edge Cases): 7 tasks
- Phase 10 (Polish): 14 tasks

**User Story Task Breakdown**:

- US1 (View System Health): 12 tasks → **MVP Focus**
- US2 (Golden Signals): 14 tasks → **High Value**
- US3 (Engagement): 9 tasks
- US4 (Platform Comparison): 8 tasks
- US5 (Navigation): 5 tasks → **Quick Win**
- US6 (Responsive Design): 7 tasks → **Polish**

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel (51% of total)

**Independent Test Criteria**: Each user story phase has clear "Independent Test" criteria for verification

**Estimated Timeline**:

- Single developer: 3-4 weeks (MVP in 3-5 days)
- Team of 3: 1.5-2 weeks (MVP in 2-3 days)
- Backend + Frontend teams: 2 weeks total (1 week backend prep + 1 week mobile implementation in parallel)

**Success Criteria**: All tasks completed = Feature meets all 42 functional requirements and 20 success criteria from spec.md
