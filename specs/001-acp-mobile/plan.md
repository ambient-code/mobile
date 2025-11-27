# Implementation Plan: ACP Mobile Companion App

**Branch**: `001-acp-mobile` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-acp-mobile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Mobile companion app for Ambient Code Platform (ACP) enabling software engineers to monitor AI coding sessions, review completed work, respond to GitHub notifications, and interact with Claude from their phones. Built with React Native and Expo for iOS/Android, connecting to existing ACP Go API backend via OAuth-authenticated REST endpoints.

## Technical Context

**Language/Version**: TypeScript 5.x with React Native 0.76
**Primary Dependencies**: Expo SDK 52, Expo Router (file-based routing), React Native, @expo/vector-icons, react-native-svg
**Storage**: AsyncStorage for preferences/cache, no local database (backend is source of truth)
**Testing**: Jest + React Native Testing Library for unit/integration tests, NEEDS CLARIFICATION: E2E testing approach (Detox vs Maestro vs manual)
**Target Platform**: iOS 15+ (primary: iPhone 14) and Android 12+ (API level 31+)
**Project Type**: Mobile (React Native cross-platform)
**Performance Goals**: <2s dashboard load, <3s chat response, <5s notification sync, 60fps UI animations
**Constraints**: <200ms UI response time, offline-capable (cached data), <100MB memory footprint, handles 50 concurrent sessions + 500 notifications without degradation
**Scale/Scope**: 8 primary screens (Login, Dashboard, Sessions, New Session, GitHub Notifications, Interactive Chat, Settings, sub-settings), ~2000 LOC mockup exists in app/(tabs)/index.tsx
**Backend Integration**: NEEDS CLARIFICATION: REST API endpoint structure, authentication flow details (OAuth token exchange, refresh mechanism), WebSocket vs polling for real-time updates
**Push Notifications**: NEEDS CLARIFICATION: Firebase Cloud Messaging vs Apple Push Notification Service direct integration, notification payload structure
**GitHub Integration**: NEEDS CLARIFICATION: GitHub OAuth flow, API rate limits strategy, webhook vs polling for notifications

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: ✅ PASS (No constitution file exists - new project)

This is a new project without an established constitution. No architectural constraints to validate against. Will establish mobile-specific best practices during implementation:

- Component-based architecture (React Native patterns)
- Offline-first data strategy with AsyncStorage
- Cross-platform UI with platform-specific adaptations where needed
- Security-first OAuth integration
- Performance monitoring and optimization

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Expo Router file-based routing
├── (tabs)/                   # Tab-based navigation (if used)
│   └── index.tsx             # Dashboard/Home screen (currently has mockup)
├── login.tsx                 # Login screen
├── sessions/
│   ├── index.tsx             # Sessions list
│   ├── [id].tsx              # Session detail
│   └── new.tsx               # New session creation
├── notifications/
│   └── index.tsx             # GitHub notifications
├── settings/
│   ├── index.tsx             # Settings main
│   ├── notifications.tsx     # Push notification settings
│   ├── repos.tsx             # Connected repositories
│   └── appearance.tsx        # Theme settings
├── chat.tsx                  # Interactive Claude chat modal
└── _layout.tsx               # Root layout with providers

components/                   # Reusable UI components
├── ui/                       # Base components (Button, Card, Badge, etc.)
├── session/                  # Session-specific components
│   ├── SessionCard.tsx       # Session list item
│   ├── SessionProgress.tsx   # Progress bar component
│   └── ModelBadge.tsx        # Model indicator badge
├── notifications/
│   ├── NotificationCard.tsx  # GitHub notification item
│   └── NotificationActions.tsx # Action sheet for notifications
└── layout/
    ├── Header.tsx            # App header with greeting/icons
    ├── FAB.tsx               # Floating action button
    └── UserMenu.tsx          # User menu dropdown

services/                     # Business logic and API integration
├── api/
│   ├── client.ts             # HTTP client with auth interceptor
│   ├── sessions.ts           # Session API endpoints
│   ├── notifications.ts      # GitHub notifications API
│   └── auth.ts               # Authentication API
├── auth/
│   ├── oauth.ts              # Red Hat SSO OAuth flow
│   └── token-manager.ts      # Token storage and refresh
├── github/
│   └── integration.ts        # GitHub API integration
└── storage/
    ├── preferences.ts        # User preferences (AsyncStorage)
    └── cache.ts              # Offline data cache

hooks/                        # Custom React hooks
├── useAuth.ts                # Authentication state
├── useSessions.ts            # Session data fetching
├── useNotifications.ts       # Notifications with real-time updates
├── useTheme.ts               # Theme management
└── useOffline.ts             # Offline state detection

types/                        # TypeScript type definitions
├── api.ts                    # API request/response types
├── session.ts                # Session entity types
├── notification.ts           # Notification types
└── user.ts                   # User types

utils/                        # Utility functions
├── formatting.ts             # Date/time formatting
├── validation.ts             # Input validation
└── constants.ts              # App constants

assets/                       # Static assets
├── icons/                    # Custom SVG icons
│   ├── lightbulb.svg         # Ideate workflow icon
│   └── present.svg           # Gift/present icon
└── images/

__tests__/                    # Tests
├── components/               # Component tests
├── services/                 # Service/API tests
├── hooks/                    # Hook tests
└── integration/              # Integration tests

app.json                      # Expo configuration
package.json                  # Dependencies
tsconfig.json                 # TypeScript configuration
```

**Structure Decision**: React Native with Expo Router for file-based routing. This structure follows Expo conventions with screens in `app/` directory, reusable components in `components/`, and business logic in `services/`. The existing mockup in `app/(tabs)/index.tsx` will be refactored into proper component structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations (new project with no constitution file)

---

## Phase Completion Summary

### Phase 0: Research ✅

**Completed**: 2025-11-26

**Outputs**:

- `research.md` - Technology decisions and rationale

**Key Decisions**:

1. **E2E Testing**: Maestro (simple YAML-based tests)
2. **Authentication**: OAuth 2.0 + PKCE with Red Hat SSO, JWT bearer tokens
3. **Real-time Updates**: Hybrid long polling + push notifications
4. **Push Notifications**: Expo Push Notifications (abstracts FCM/APNS)
5. **GitHub Integration**: Backend-managed OAuth, polling for notifications

All NEEDS CLARIFICATION items from Technical Context resolved.

### Phase 1: Design & Contracts ✅

**Completed**: 2025-11-26

**Outputs**:

- `data-model.md` - Client-side entity definitions, storage strategy, state management
- `contracts/acp-api.yaml` - OpenAPI 3.0 specification for ACP mobile API
- `quickstart.md` - Developer onboarding guide
- `CLAUDE.md` - Updated agent context file

**Key Artifacts**:

- **9 Core Entities**: User, Session, WorkflowType, Repository, GitHubNotification, ChatMessage, UserPreferences, NotificationPreferences, Announcement
- **24 API Endpoints**: Auth (3), Sessions (5), Notifications (3), Repositories (3), Chat (2), User (3)
- **Storage Strategy**: SecureStore (tokens), AsyncStorage (cache/preferences), no local DB
- **State Management**: React Context + hooks (no Redux)

### Constitution Check Re-evaluation ✅

**Status**: ✅ PASS (No violations)

Post-design review confirms:

- Architecture follows React Native + Expo best practices
- Component-based structure is appropriate for mobile app
- Offline-first strategy with AsyncStorage caching is sound
- Security-first approach with SecureStore for sensitive data
- No over-engineering: simple context-based state management
- No new principles to add (new project)

### Next Steps

**Ready for**: `/speckit.tasks` command to generate implementation tasks

**Implementation priorities** (from spec P1-P3):

1. **P1 (Critical)**: Monitor sessions, Review work
2. **P2 (High value)**: GitHub notifications, Interactive chat, Create sessions
3. **P3 (Refinement)**: Settings management, Feature discovery

**Backend coordination needed**:

- Confirm API endpoint structure matches `contracts/acp-api.yaml`
- Verify OAuth token TTLs (15min access, 7d refresh)
- Ensure `/user/push-token` endpoint exists for Expo tokens
- Clarify GitHub notification polling strategy (backend vs mobile)
