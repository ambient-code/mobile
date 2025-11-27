# External Integrations

## Feedback Integration

The app integrates with Google Forms for collecting user feedback.

### Google Form URL

```
https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform
```

### Access Points

Users can access the feedback form from multiple locations:

1. **Dashboard**: "Send Feedback" button at bottom
2. **Present (Gift) Menu**: "Send Feedback" link
3. **User Menu**: "Send Feedback" quick action
4. **Settings Screen**: "Send Feedback" button

### Implementation

The feedback form opens in the device's default browser using `Linking.openURL()`:

```typescript
import { Linking } from 'react-native'

const FEEDBACK_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform'

const handleFeedback = async () => {
  await Linking.openURL(FEEDBACK_URL)
}
```

### Feedback Categories

The Google Form includes categories for:

- **Bug Reports**: Issues, crashes, unexpected behavior
- **Feature Requests**: New features or improvements
- **User Experience**: UI/UX feedback
- **Performance**: Speed, responsiveness issues
- **General Feedback**: Other comments or suggestions

## GitHub Integration

### OAuth Integration

The app uses GitHub OAuth for:

1. **Repository Access**: Fetching connected repositories
2. **Notifications**: Reading GitHub notifications
3. **Pull Requests**: Accessing PR details for review workflow

### OAuth Scopes

Required GitHub OAuth scopes:

- `repo` - Access to repositories
- `notifications` - Read notifications
- `user:email` - User email address

### GitHub Notifications

The app displays GitHub notifications with intelligent workflow suggestions:

#### Notification Type Mapping

| Notification Type     | Suggested Workflow | Icon Color |
| --------------------- | ------------------ | ---------- |
| `pull_request`        | Review             | Blue       |
| `pull_request_review` | Review             | Blue       |
| `issue`               | Bugfix             | Red        |
| `issue_comment`       | Chat               | Purple     |
| `commit_comment`      | Review             | Blue       |
| `mention`             | Chat               | Purple     |
| `release`             | Research           | Green      |
| `security_alert`      | Bugfix             | Red        |

#### Notification Actions

From the notification action sheet, users can:

1. **Start [Workflow] Workflow** - Auto-suggested based on type (Coming Soon)
2. **Choose Different Workflow...** - Manual workflow selection (Coming Soon)
3. **Mark as Read** - Mark notification as read without action
4. **Open in GitHub** - Open in browser
5. **Mute Thread** - Stop receiving notifications for this thread
6. **Cancel** - Dismiss action sheet

### Connected Repositories

Users can manage connected repositories in Settings > Connected Repos:

- **Add Repository**: Enter GitHub URL or select from authorized repos
- **Remove Repository**: Swipe to delete or tap remove button
- **Branch Selection**: Default branch is selected automatically
- **Quick Access**: Used for fast context selection in New Session screen

### Repository Picker

When creating a new session, users can:

1. Select from connected repos (quick access)
2. Enter a GitHub URL manually
3. Manage repository list

**URL Format**:

```
https://github.com/{owner}/{repo}
https://github.com/{owner}/{repo}/tree/{branch}
```

## Red Hat SSO Integration

### Authentication Flow

The app integrates with Red Hat's Single Sign-On (SSO) service for enterprise authentication.

### OAuth 2.0 + PKCE

- **Protocol**: OAuth 2.0 with Proof Key for Code Exchange (PKCE)
- **Grant Type**: Authorization Code
- **Redirect URI**: `acp://oauth/callback` (custom URL scheme)

**Note**: Will migrate to Universal Links for production security.

### User Profile

After authentication, the app fetches user profile data:

```typescript
interface User {
  name: string // e.g., "Jeremy Eder"
  email: string // e.g., "jeder@redhat.com"
  role: string // e.g., "Distinguished Engineer"
  avatar?: string // URL to profile photo
}
```

### SSO Logout

Signing out clears:

1. OAuth access token (from SecureStore)
2. OAuth refresh token (from SecureStore)
3. User profile data (from memory)
4. Cached sessions (from AsyncStorage)

## ACP Platform API Integration

### Base URL

**Staging**: `https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com`

**Production**: TBD

### API Endpoints

See [API Reference](../api/index.md) for detailed endpoint documentation.

Key integrations:

1. **Sessions API**: `/api/sessions`
   - List sessions
   - Get session details
   - Create new session
   - Update session (pause/resume)

2. **SSE Endpoint**: `/sse/sessions`
   - Real-time session updates
   - Progress events
   - Status changes

3. **User Profile**: `/api/user/profile`
   - Get authenticated user info

### Request Headers

All API requests include:

```
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

### Error Handling

API errors are handled gracefully:

- **401 Unauthorized**: Token refresh or re-authentication
- **403 Forbidden**: Permission error, show message
- **404 Not Found**: Resource not found, show fallback UI
- **500 Server Error**: Retry with exponential backoff
- **Network Error**: Show offline mode, use cached data

## Analytics Integration (Planned)

### Privacy-First Analytics

Planned integration with privacy-focused analytics:

- **No PII Tracking**: No personally identifiable information
- **Aggregate Metrics Only**: Usage patterns, feature adoption
- **Opt-out Option**: Users can disable analytics in settings

### Metrics to Track

- Screen views
- Feature usage (buttons clicked, workflows started)
- Session creation patterns
- Error rates
- App crashes (via Sentry)

## Push Notifications (Planned)

### Firebase Cloud Messaging

Future integration for push notifications:

#### Notification Types

1. **Blocking Issues**: Critical errors requiring attention
2. **Review Requests**: Pull requests awaiting review
3. **Session Completions**: AI sessions finished
4. **Features & News**: App updates and announcements

#### Settings Control

Users can control notifications in Settings > Push Notifications:

- **Enable/Disable** per notification type
- **Quiet Hours**: Silence notifications during specific times
- **Badge Count**: Show/hide app icon badge

### Implementation Plan

```bash
# Install Firebase dependencies
npm install @react-native-firebase/app @react-native-firebase/messaging

# Configure Firebase
# - Add google-services.json (Android)
# - Add GoogleService-Info.plist (iOS)
```

## Deep Linking (Planned)

### Universal Links (iOS) / App Links (Android)

Future implementation for secure deep linking:

#### Link Format

```
https://acp.redhat.com/sessions/{sessionId}
https://acp.redhat.com/notifications/{notificationId}
```

#### Use Cases

- **Email Links**: Open specific session from email notification
- **GitHub Integration**: Deep link from GitHub PR to ACP review workflow
- **Web Handoff**: Seamless transition from web app to mobile

See [Universal Links Setup Guide](../getting-started/universal-links.md) for implementation details.

---

For more details on API integrations, see:

- [API Overview](../api/index.md)
- [API Reference](../api/index.md) - Authentication, Sessions, and Realtime APIs
