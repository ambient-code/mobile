# Feature Specification: Admin Statistics Dashboard

**Feature Branch**: `002-admin-stats-dashboard`
**Created**: 2025-11-27
**Status**: Draft
**Input**: User description: "Phase 1: Admin Statistics Dashboard - Implement an admin-only statistics dashboard for the ACP mobile app to track usage across both web and mobile platforms. MVP focusing on essential operational metrics including Golden Signals, user engagement (DAU/MAU), OS tracking, with 5-minute refresh cycle and responsive design."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Real-Time System Health (Priority: P1)

As an admin, I need to see at-a-glance system health metrics so that I can quickly identify if the platform is experiencing issues and respond appropriately.

**Why this priority**: This is the primary operational dashboard for monitoring system health. Without this, admins cannot perform their core responsibility of ensuring system availability and performance.

**Independent Test**: Can be fully tested by logging in as an admin user and navigating to the statistics dashboard. Delivers immediate value by showing current system status without requiring any other features.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I navigate to /admin/stats, **Then** I see a dashboard displaying active users (total, web, mobile), requests per minute, error rate, p95 latency, and overall system status (healthy/degraded/down)
2. **Given** I am viewing the overview dashboard, **When** the error rate exceeds 1% or latency exceeds 100ms, **Then** the system status indicator changes from green (healthy) to yellow (degraded)
3. **Given** I am viewing the overview dashboard, **When** the error rate exceeds 5% or latency exceeds 500ms, **Then** the system status indicator changes to red (down)
4. **Given** I am viewing the overview dashboard with real-time data, **When** I pull down to refresh, **Then** the metrics update immediately with the latest data
5. **Given** I am a non-admin user, **When** I attempt to access /admin/stats, **Then** I am redirected to the main app and see an "Admin access required" message

---

### User Story 2 - Monitor SRE Golden Signals (Priority: P1)

As an admin, I need to view detailed SRE metrics (Latency, Traffic, Errors, Saturation) over time so that I can identify trends, diagnose performance issues, and understand system behavior patterns.

**Why this priority**: Golden Signals are the industry-standard operational metrics. This enables proactive problem detection and data-driven operational decisions.

**Independent Test**: Can be tested independently by navigating to the Golden Signals tab and verifying all four panels display charts with 24-hour historical data. Delivers value by showing operational trends.

**Acceptance Scenarios**:

1. **Given** I am on the Golden Signals dashboard, **When** I view the Latency panel, **Then** I see a line chart showing p50, p95, and p99 latency values over the last 24 hours with timestamps
2. **Given** I am on the Golden Signals dashboard, **When** I view the Traffic panel, **Then** I see a line chart of requests per minute over 24 hours and a metric card showing current active sessions
3. **Given** I am on the Golden Signals dashboard, **When** I view the Errors panel, **Then** I see a line chart of error rate percentage over 24 hours, a pie chart breaking down 4xx vs 5xx errors, and a table listing the top 5 errors with message, count, and last seen timestamp
4. **Given** I am on the Golden Signals dashboard, **When** I view the Saturation panel, **Then** I see gauge charts displaying current CPU usage %, memory usage %, and database connection pool usage %
5. **Given** I am viewing latency metrics, **When** the last hour's average latency is lower than the previous hour, **Then** I see an "improving" trend indicator
6. **Given** the dashboard has cached data from 4 minutes ago, **When** 5 minutes have elapsed, **Then** the metrics automatically refresh with new data

---

### User Story 3 - Analyze User Engagement Patterns (Priority: P2)

As an admin, I need to track daily active users (DAU), monthly active users (MAU), and understand new vs returning user patterns so that I can measure platform adoption and user retention.

**Why this priority**: User engagement metrics are essential for understanding product-market fit and growth trends, but are secondary to operational health monitoring.

**Independent Test**: Can be tested by navigating to the Engagement tab and verifying DAU trend chart, MAU count, stickiness percentage, and new vs returning user breakdown are displayed. Delivers insights into user behavior independent of other features.

**Acceptance Scenarios**:

1. **Given** I am on the Engagement dashboard, **When** I view the DAU trend, **Then** I see a line chart showing hourly unique user counts for the last 24 hours
2. **Given** I am on the Engagement dashboard, **When** I view the MAU metric, **Then** I see a single number representing unique users over the rolling 30-day period
3. **Given** I am on the Engagement dashboard, **When** I view the stickiness metric, **Then** I see the percentage calculated as (current DAU / MAU) × 100
4. **Given** I am on the Engagement dashboard, **When** I view the new vs returning users chart, **Then** I see a stacked bar chart showing new and returning user counts over the last 24 hours with hourly buckets
5. **Given** there are zero active users in the current hour, **When** I view the engagement dashboard, **Then** I see "No data yet" message instead of empty charts
6. **Given** MAU is 0, **When** I view the stickiness metric, **Then** I see "N/A" instead of attempting to divide by zero

---

### User Story 4 - Compare Web vs Mobile Usage (Priority: P2)

As an admin, I need to see platform-specific metrics (web vs mobile) and OS version distributions so that I can understand how users access the platform and prioritize development efforts accordingly.

**Why this priority**: Platform comparison helps with strategic planning and resource allocation, but is less urgent than operational health monitoring.

**Independent Test**: Can be tested by navigating to the Platforms tab and verifying web/mobile active user breakdown, platform-specific error rates, and OS version distributions are displayed. Delivers strategic insights independently.

**Acceptance Scenarios**:

1. **Given** I am on the Platform Comparison dashboard, **When** I view active users by platform, **Then** I see a pie chart showing percentages for web, mobile, and users active on both platforms
2. **Given** I am on the Platform Comparison dashboard, **When** I view requests per minute by platform, **Then** I see side-by-side bar charts comparing web and mobile traffic volumes over 24 hours
3. **Given** I am on the Platform Comparison dashboard, **When** I view error rates, **Then** I see separate metric cards displaying error percentage for web and mobile platforms
4. **Given** I am on the Platform Comparison dashboard, **When** I view mobile OS distribution, **Then** I see a breakdown showing iOS and Android versions with count and percentage for each
5. **Given** I am on the Platform Comparison dashboard, **When** I view web OS distribution, **Then** I see a breakdown showing macOS, Windows, and Linux versions with count and percentage for each
6. **Given** a user's OS version cannot be detected, **When** viewing OS distributions, **Then** I see it categorized as "Unknown" with its count included in the totals

---

### User Story 5 - Navigate Between Dashboard Views (Priority: P1)

As an admin, I need to easily switch between different dashboard views (Overview, Golden Signals, Engagement, Platforms) so that I can access the specific metrics I need without friction.

**Why this priority**: Tab navigation is essential infrastructure for the multi-dashboard interface. Without it, other dashboards cannot be accessed.

**Independent Test**: Can be tested by verifying tab navigation is present and functional on all dashboard screens, and that navigation state persists correctly. Essential for accessing all features.

**Acceptance Scenarios**:

1. **Given** I am viewing any admin stats dashboard, **When** I look at the navigation, **Then** I see tabs labeled "Overview", "Signals", "Users", and "Platforms" with appropriate icons
2. **Given** I am on the Overview tab, **When** I tap/click the Signals tab, **Then** I navigate to the Golden Signals dashboard and the tab indicator updates
3. **Given** I am on a specific dashboard tab, **When** I navigate away and return to admin stats, **Then** I return to the same tab I was viewing previously
4. **Given** I am using a mobile device, **When** I view the tab navigation, **Then** the tabs are touch-friendly with adequate spacing for finger taps
5. **Given** I am using a desktop browser, **When** I view the tab navigation, **Then** the tabs support mouse hover states and keyboard navigation

---

### User Story 6 - View Dashboards Responsively Across Devices (Priority: P2)

As an admin, I need the statistics dashboards to work on both mobile devices (touch) and desktop computers (mouse/keyboard) so that I can monitor system health from anywhere.

**Why this priority**: Responsive design is important for usability but secondary to having functional dashboards. Admins can initially work around desktop-only limitations.

**Independent Test**: Can be tested by viewing dashboards on different screen sizes (mobile phone, tablet, desktop) and verifying layouts adapt appropriately. Delivers improved accessibility across devices.

**Acceptance Scenarios**:

1. **Given** I am viewing charts on a mobile device (width < 768px), **When** the page renders, **Then** charts stack vertically, labels are sized appropriately (10-12px), and touch targets are adequately sized
2. **Given** I am viewing charts on a desktop (width ≥ 1024px), **When** the page renders, **Then** charts are arranged in multi-column layouts, labels are standard size (12-14px), and mouse hover states work
3. **Given** I am viewing a line chart on mobile, **When** the chart renders, **Then** X-axis labels are angled at -45 degrees to prevent overlap
4. **Given** I am viewing a line chart on desktop, **When** the chart renders, **Then** X-axis labels are horizontal and data points show visible dots
5. **Given** I am using a tablet (width 768-1023px), **When** I view the dashboards, **Then** the layout adapts to the medium screen size with appropriate spacing

---

### Edge Cases

- What happens when PostHog API is unavailable and metrics cannot be fetched?
  - Dashboard shows "Unable to load metrics" error message with a retry button
  - Cached data (if available) is displayed with a "Last updated: [time]" indicator
  - System does not crash or show blank screens

- How does the system handle zero active users?
  - Engagement dashboard displays "No data yet" message
  - Charts show empty state placeholders
  - Stickiness metric shows "N/A"

- What happens when a user has both web and mobile sessions active simultaneously?
  - User is counted once in total active users
  - User is counted once in web active users
  - User is counted once in mobile active users
  - "Both platforms" metric shows count of users with concurrent sessions

- How does the system handle malformed or missing OS version data?
  - OS versions that cannot be parsed are categorized as "Unknown"
  - Unknown versions are included in the total count
  - Percentage calculations include unknowns in the denominator

- What happens when error rate is exactly at threshold boundaries (1%, 5%)?
  - 1% error rate triggers "degraded" status (not healthy)
  - 5% error rate triggers "down" status (not degraded)
  - Thresholds are inclusive on the upper bound

- How does the dashboard handle extremely large numbers (millions of users)?
  - Numbers are formatted with comma separators (e.g., 1,234,567)
  - Charts scale appropriately to accommodate large values
  - Y-axis labels use abbreviated notation if needed (1M, 1K)

- What happens when a non-admin user attempts to deep link to a specific dashboard tab?
  - User is redirected to main app regardless of which admin tab was requested
  - "Admin access required" message is shown
  - No sensitive data is exposed during redirect

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST restrict access to all admin statistics dashboards to users with role="admin"
- **FR-002**: System MUST redirect non-admin users attempting to access /admin/stats/\* to the main app with an unauthorized message
- **FR-003**: System MUST display active user counts separated by platform (web, mobile, total) on the overview dashboard
- **FR-004**: System MUST calculate and display requests per minute based on the last hour of activity
- **FR-005**: System MUST display error rate as a percentage calculated from the last hour of requests
- **FR-006**: System MUST display p95 latency in milliseconds calculated from the last hour of requests
- **FR-007**: System MUST determine system status as "healthy" (error rate < 1% AND latency < 100ms), "degraded" (error rate 1-5% OR latency 100-500ms), or "down" (error rate > 5% OR latency > 500ms)
- **FR-008**: System MUST automatically refresh all metrics every 5 minutes
- **FR-009**: System MUST support manual refresh via pull-to-refresh gesture on mobile and pull-down action on desktop
- **FR-010**: System MUST display latency metrics showing p50, p95, and p99 percentiles over the last 24 hours as a line chart
- **FR-011**: System MUST display traffic metrics showing requests per minute over the last 24 hours as a line chart
- **FR-012**: System MUST display error metrics showing error rate percentage over 24 hours, breakdown of 4xx vs 5xx errors, and top 5 errors with message, count, and last seen time
- **FR-013**: System MUST display saturation metrics showing current CPU usage %, memory usage %, and database connection pool usage % as gauges or progress bars
- **FR-014**: System MUST calculate and display latency trend (improving/stable/degrading) by comparing last hour average vs previous hour average
- **FR-015**: System MUST display DAU as hourly unique user counts over the last 24 hours on a line chart
- **FR-016**: System MUST display MAU as a single number representing unique users over the rolling 30-day period
- **FR-017**: System MUST calculate and display stickiness as (current DAU / MAU) × 100, or "N/A" if MAU is zero
- **FR-018**: System MUST display new vs returning users over the last 24 hours as a stacked bar chart with hourly buckets
- **FR-019**: System MUST identify new users based on first-seen timestamp or PostHog cohort data
- **FR-020**: System MUST display active users by platform as a pie chart showing web, mobile, and both-platforms percentages
- **FR-021**: System MUST display platform-specific requests per minute as side-by-side bar charts for web and mobile
- **FR-022**: System MUST display platform-specific error rates as separate metric cards for web and mobile
- **FR-023**: System MUST detect platform type (web/mobile) from PostHog user agent data
- **FR-024**: System MUST parse and display mobile OS versions (iOS, Android) with version number, count, and percentage
- **FR-025**: System MUST parse and display web OS versions (macOS, Windows, Linux) with version number, count, and percentage
- **FR-026**: System MUST use PostHog $os and $os_version properties to determine operating system details
- **FR-027**: System MUST categorize unparseable OS versions as "Unknown" and include them in totals and percentages
- **FR-028**: System MUST provide tab navigation with four tabs: Overview, Signals (Golden Signals), Users (Engagement), Platforms (Platform Comparison)
- **FR-029**: System MUST display appropriate icons for each tab (dashboard, chart-line, users, devices)
- **FR-030**: System MUST preserve tab navigation state when user navigates away and returns
- **FR-031**: System MUST adapt chart layouts for mobile screens (< 768px width) by stacking vertically, reducing font sizes to 10-12px, angling X-axis labels at -45 degrees, and removing data point dots
- **FR-032**: System MUST adapt chart layouts for desktop screens (≥ 1024px width) by using multi-column layouts, standard font sizes (12-14px), horizontal X-axis labels, and visible data point dots
- **FR-033**: System MUST ensure touch targets on mobile are adequately sized for finger interaction
- **FR-034**: System MUST support mouse hover states and keyboard navigation on desktop
- **FR-035**: System MUST track API request duration and status code for all requests to calculate latency and error metrics
- **FR-036**: System MUST retain 24 hours of request timing data for historical charts
- **FR-037**: System MUST format large numbers with comma separators and use abbreviated notation (K, M) when appropriate
- **FR-038**: System MUST display "No data yet" message when engagement metrics show zero users
- **FR-039**: System MUST display "Unable to load metrics" error with retry button when analytics APIs are unavailable
- **FR-040**: System MUST show cached data with "Last updated: [time]" indicator when fresh data cannot be fetched
- **FR-041**: System MUST cache metrics for 4 minutes (staleTime) in React Query
- **FR-042**: System MUST refetch metrics every 5 minutes (refetchInterval) in React Query

### Key Entities

- **User**: Represents individuals using the platform, tracked by unique identifier. Key attributes include role (admin/developer/user), platform type (web/mobile), OS type, OS version, first seen timestamp, last active timestamp.

- **Metric Data Point**: Represents a single measurement at a point in time. Key attributes include timestamp, metric type (latency/traffic/error/saturation), value, platform (web/mobile/combined).

- **Request**: Represents a single API call to the platform. Key attributes include timestamp, duration (milliseconds), status code, platform source (web/mobile), user identifier.

- **Error Event**: Represents a failed request or system error. Key attributes include timestamp, error message, error type (4xx/5xx), count, platform source, user identifier.

- **System Health Status**: Represents the overall platform health at a point in time. Key attributes include status (healthy/degraded/down), error rate %, p95 latency, timestamp.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Dashboard loads and displays all overview metrics within 2 seconds on both mobile and desktop platforms
- **SC-002**: All four dashboard tabs (Overview, Golden Signals, Engagement, Platforms) render correctly on iOS mobile, Android mobile, and desktop browsers (Chrome, Safari, Firefox)
- **SC-003**: Non-admin users are prevented from accessing admin statistics 100% of the time and are redirected appropriately
- **SC-004**: Metrics automatically refresh every 5 minutes without user intervention
- **SC-005**: Pull-to-refresh gesture successfully triggers immediate data refresh on mobile devices
- **SC-006**: All charts display accurate 24-hour historical data matching the source data from PostHog and Sentry
- **SC-007**: System status indicator correctly reflects "healthy" when error rate < 1% AND latency < 100ms
- **SC-008**: System status indicator correctly reflects "degraded" when error rate is 1-5% OR latency is 100-500ms
- **SC-009**: System status indicator correctly reflects "down" when error rate > 5% OR latency > 500ms
- **SC-010**: Touch targets on mobile dashboards are large enough for comfortable finger interaction (minimum 44x44 points)
- **SC-011**: Charts remain readable and usable on mobile screens as small as 375px width (iPhone SE)
- **SC-012**: Latency percentile calculations (p50, p95, p99) match manual calculations from raw request timing data
- **SC-013**: DAU and MAU counts match unique user counts from PostHog raw event data
- **SC-014**: Platform detection correctly identifies web vs mobile for 95% of requests based on user agent data
- **SC-015**: OS version parsing successfully categorizes 90% of users into specific OS/version combinations
- **SC-016**: Dashboard handles zero active users gracefully without crashes or blank screens
- **SC-017**: Dashboard handles API unavailability gracefully by showing error messages and cached data
- **SC-018**: Memory usage remains stable over 1 hour of continuous dashboard viewing (no memory leaks)
- **SC-019**: Chart rendering maintains smooth performance at 60 FPS when displaying full 24-hour datasets
- **SC-020**: All metrics are technology-agnostic and understandable by non-technical stakeholders
