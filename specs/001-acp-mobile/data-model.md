# Data Model: ACP Mobile

**Feature**: 001-acp-mobile
**Date**: 2025-11-26
**Source**: Extracted from spec.md "Key Entities" section

## Overview

This document defines the client-side data model for the ACP mobile app. All entities represent data fetched from the ACP backend API and cached locally. The mobile app does not maintain a persistent local database; AsyncStorage is used only for caching and user preferences.

## Core Entities

### User

Represents the authenticated user.

**Attributes**:

- `id`: string - Unique user identifier
- `name`: string - Full name (e.g., "Jeremy Eder")
- `email`: string - Email address
- `role`: string - Job title (e.g., "Distinguished Engineer")
- `avatar`: string | null - Avatar URL or null for placeholder
- `ssoProvider`: string - SSO provider name (e.g., "Red Hat SSO")
- `preferences`: UserPreferences - User settings

**Relationships**:

- Has many `Session` (user's coding sessions)
- Has one `UserPreferences`
- Has many `GitHubNotification` (user's notifications)

**Validation**:

- `email` must be valid email format
- `name` must be non-empty

**TypeScript Interface**:

```typescript
interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
  ssoProvider: string
  preferences: UserPreferences
}
```

---

### UserPreferences

User settings and customization.

**Attributes**:

- `theme`: 'light' | 'dark' | 'system' - UI theme preference
- `notifications`: NotificationPreferences - Push notification settings
- `quietHours`: QuietHours | null - Do not disturb schedule

**TypeScript Interface**:

```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationPreferences
  quietHours: QuietHours | null
}

interface QuietHours {
  enabled: boolean
  start: string // HH:MM format, e.g., "22:00"
  end: string // HH:MM format, e.g., "08:00"
}
```

---

### NotificationPreferences

Push notification settings.

**Attributes**:

- `blockingAlerts`: boolean - Session errors requiring attention
- `reviewRequests`: boolean - Sessions awaiting review
- `sessionUpdates`: boolean - Session completion/progress updates
- `featuresAndNews`: boolean - Platform announcements

**TypeScript Interface**:

```typescript
interface NotificationPreferences {
  blockingAlerts: boolean
  reviewRequests: boolean
  sessionUpdates: boolean
  featuresAndNews: boolean
}
```

**Default Values**:

- All enabled by default except `featuresAndNews` (opt-in)

---

### Session

Represents an AI coding session.

**Attributes**:

- `id`: string - Unique session identifier
- `name`: string - Session name (auto-generated or user-edited)
- `status`: SessionStatus - Current state
- `progress`: number - Completion percentage (0-100)
- `model`: ModelType - AI model used
- `workflowType`: WorkflowType - Type of workflow
- `repository`: Repository - Repository context
- `createdAt`: Date - Creation timestamp
- `updatedAt`: Date - Last update timestamp
- `currentTask`: string | null - Currently executing task description
- `tasksCompleted`: string[] - List of completed tasks
- `errorMessage`: string | null - Error details if status is 'error'

**Enums**:

```typescript
enum SessionStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  DONE = 'done',
  AWAITING_REVIEW = 'awaiting_review',
  ERROR = 'error',
}

enum ModelType {
  SONNET_4_5 = 'sonnet-4.5',
  OPUS_4_5 = 'opus-4.5',
}
```

**Validation**:

- `progress` must be 0-100
- `status` transitions:
  - running → paused | done | awaiting_review | error
  - paused → running | done | error
  - awaiting_review → done | running (after user review)
  - error → running (after retry)
  - done → (terminal state)

**TypeScript Interface**:

```typescript
interface Session {
  id: string
  name: string
  status: SessionStatus
  progress: number
  model: ModelType
  workflowType: WorkflowType
  repository: Repository
  createdAt: Date
  updatedAt: Date
  currentTask: string | null
  tasksCompleted: string[]
  errorMessage: string | null
}
```

---

### WorkflowType

Defines AI workflow type.

**Attributes**:

- `id`: string - Workflow identifier (e.g., 'review', 'bugfix')
- `label`: string - Display name (e.g., 'Review', 'Bugfix')
- `icon`: string - Icon name or SVG identifier
- `description`: string - Workflow purpose
- `enabled`: boolean - Whether workflow is available (some may be "Soon")

**Available Workflows**:

```typescript
const WORKFLOWS: WorkflowType[] = [
  {
    id: 'review',
    label: 'Review',
    icon: 'eye',
    description: 'Code review and analysis',
    enabled: true,
  },
  {
    id: 'bugfix',
    label: 'Bugfix',
    icon: 'tool',
    description: 'Debug and fix issues',
    enabled: true,
  },
  {
    id: 'plan',
    label: 'Plan a Feature',
    icon: 'clipboard',
    description: 'Feature planning and design',
    enabled: true,
  },
  {
    id: 'research',
    label: 'Research',
    icon: 'book',
    description: 'Explore and document code',
    enabled: true,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'message-circle',
    description: 'Interactive conversation',
    enabled: true,
  },
  {
    id: 'ideate',
    label: 'Ideate',
    icon: 'lightbulb',
    description: 'Brainstorm and ideate',
    enabled: true,
  },
  { id: 'new', label: 'New...', icon: 'plus', description: 'Coming soon', enabled: false },
]
```

**TypeScript Interface**:

```typescript
interface WorkflowType {
  id: string
  label: string
  icon: string
  description: string
  enabled: boolean
}
```

---

### Repository

GitHub repository used as session context.

**Attributes**:

- `id`: string - Repository identifier
- `name`: string - Repository name (e.g., "ambient-code/platform")
- `url`: string - GitHub URL
- `branch`: string - Branch name (e.g., "main")
- `isConnected`: boolean - Whether saved to user's "Connected Repos"

**Validation**:

- `url` must be valid GitHub URL format: `https://github.com/{owner}/{repo}`
- `branch` must be non-empty

**TypeScript Interface**:

```typescript
interface Repository {
  id: string
  name: string
  url: string
  branch: string
  isConnected: boolean
}
```

---

### GitHubNotification

GitHub notification (PR, issue, mention, etc.).

**Attributes**:

- `id`: string - Notification identifier
- `type`: NotificationType - Notification category
- `repository`: string - Repository name (e.g., "ambient-code/platform")
- `itemNumber`: number - PR/Issue number
- `title`: string - Notification title
- `author`: string - Author username
- `timestamp`: Date - Notification timestamp
- `isUnread`: boolean - Read/unread status
- `suggestedWorkflow`: WorkflowType - Suggested ACP workflow
- `url`: string - GitHub URL for the item

**Enums**:

```typescript
enum NotificationType {
  PULL_REQUEST = 'pull_request',
  PULL_REQUEST_REVIEW = 'pull_request_review',
  ISSUE = 'issue',
  ISSUE_COMMENT = 'issue_comment',
  COMMIT_COMMENT = 'commit_comment',
  MENTION = 'mention',
  RELEASE = 'release',
  SECURITY_ALERT = 'security_alert',
}
```

**Workflow Mapping**:

```typescript
const NOTIFICATION_WORKFLOW_MAP: Record<NotificationType, WorkflowType> = {
  pull_request: 'review',
  pull_request_review: 'review',
  issue: 'bugfix',
  issue_comment: 'chat',
  commit_comment: 'review',
  mention: 'chat',
  release: 'research',
  security_alert: 'bugfix',
}
```

**TypeScript Interface**:

```typescript
interface GitHubNotification {
  id: string
  type: NotificationType
  repository: string
  itemNumber: number
  title: string
  author: string
  timestamp: Date
  isUnread: boolean
  suggestedWorkflow: WorkflowType
  url: string
}
```

---

### ChatMessage

Message in interactive Claude conversation.

**Attributes**:

- `id`: string - Message identifier
- `threadId`: string - Conversation thread identifier
- `role`: 'user' | 'assistant' - Message sender
- `content`: string - Message text
- `timestamp`: Date - When message was sent

**TypeScript Interface**:

```typescript
interface ChatMessage {
  id: string
  threadId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatThread {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}
```

---

### Announcement

Platform feature announcement.

**Attributes**:

- `id`: string - Announcement identifier
- `title`: string - Announcement title
- `description`: string - Announcement description
- `isNew`: boolean - Whether marked as "NEW"
- `timestamp`: Date - When published

**TypeScript Interface**:

```typescript
interface Announcement {
  id: string
  title: string
  description: string
  isNew: boolean
  timestamp: Date
}
```

---

## Client-Side Storage Strategy

### Expo SecureStore (Encrypted)

Used for sensitive data:

- OAuth access token
- OAuth refresh token
- Expo Push Token

**Keys**:

- `auth_access_token`
- `auth_refresh_token`
- `expo_push_token`

### AsyncStorage (Unencrypted Cache)

Used for non-sensitive cached data and preferences:

- User preferences (theme, notifications)
- Connected repositories
- Cached session list (with TTL)
- Cached GitHub notifications (with TTL)

**Keys**:

- `user_preferences`
- `connected_repos`
- `cache_sessions` (TTL: 5 minutes)
- `cache_notifications` (TTL: 5 minutes)

### Cache Invalidation

- **On user action**: Invalidate related cache (e.g., create session → invalidate sessions cache)
- **On app foreground**: Check cache age, refresh if stale
- **On network error**: Serve stale cache, show "Using cached data" banner
- **On logout**: Clear all AsyncStorage and SecureStore

---

## API Response Mapping

All API responses are transformed from backend DTOs to client-side models using mapper functions:

**Example: Session Mapper**

```typescript
function mapSessionFromAPI(dto: SessionDTO): Session {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status as SessionStatus,
    progress: dto.progress_percentage,
    model: dto.model as ModelType,
    workflowType: WORKFLOWS.find((w) => w.id === dto.workflow_type_id)!,
    repository: mapRepositoryFromAPI(dto.repository),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    currentTask: dto.current_task,
    tasksCompleted: dto.tasks_completed || [],
    errorMessage: dto.error_message,
  }
}
```

---

## State Management

**Approach**: React Context + Custom Hooks (no Redux)

**Contexts**:

- `AuthContext`: User authentication state, login/logout functions
- `ThemeContext`: Current theme (light/dark), theme toggle function
- `SessionsContext`: Sessions list, create/update functions
- `NotificationsContext`: GitHub notifications, mark read function

**Why No Redux**:

- App state is simple (mostly server-synced data)
- Context + hooks sufficient for sharing state
- Reduces bundle size and complexity
- Easier to debug and maintain

---

## Data Flow

1. **User opens app** → Check SecureStore for auth tokens
2. **If authenticated** → Fetch user profile, preferences, sessions, notifications
3. **Cache responses** → Store in AsyncStorage with TTL
4. **User takes action** (e.g., create session) → Optimistic UI update + API call
5. **API response** → Update context state + invalidate cache
6. **Background refresh** → Long poll sessions every 5s (active) / 30s (background)
7. **Push notification** → Deep link to relevant screen, refresh data

---

## Error Handling

**Network Errors**:

- Show cached data if available
- Display "Offline" banner
- Queue write operations for retry

**Validation Errors** (400):

- Show inline error messages
- Highlight invalid fields

**Authentication Errors** (401):

- Attempt token refresh
- If refresh fails, logout and redirect to login

**Server Errors** (500):

- Show generic error message
- Provide retry button
- Log error to monitoring service

---

## Summary

The data model is designed for:

- **Simplicity**: No local database, server is source of truth
- **Offline resilience**: AsyncStorage caching with TTLs
- **Security**: Sensitive tokens in SecureStore
- **Performance**: Optimistic updates, background refresh
- **Type safety**: Comprehensive TypeScript interfaces

All entities map directly to backend API responses, with client-side transformations handled by mapper functions.
