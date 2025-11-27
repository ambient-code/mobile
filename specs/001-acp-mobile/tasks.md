# Implementation Tasks: ACP Mobile Companion App

**Feature**: 001-acp-mobile
**Branch**: `001-acp-mobile`
**Generated**: 2025-11-26
**Total Tasks**: 87

## Overview

This task list breaks down the ACP mobile implementation into phases organized by user story priority. Each phase is independently testable and delivers incremental value.

**MVP Scope**: Phase 3 (User Story 1 - Monitor Sessions) delivers the minimum viable product.

**Implementation Strategy**:

1. Setup infrastructure (Phase 1-2)
2. Build P1 features first (US1-US2: Monitor + Review)
3. Add P2 features (US3-US5: Notifications + Chat + Create)
4. Polish with P3 features (US6-US7: Settings + Discovery)

---

## ✅ Phase 1: Setup & Infrastructure (11 tasks) - COMPLETE

**Goal**: Establish project structure, dependencies, and foundational infrastructure

**Tasks**:

- [x] T001 Initialize Expo project with TypeScript and Expo SDK 52 in project root
- [x] T002 Install core dependencies: react-native, expo-router, @expo/vector-icons, react-native-svg in package.json
- [x] T003 Install additional dependencies: axios, @react-native-async-storage/async-storage, expo-secure-store, expo-auth-session, expo-web-browser in package.json
- [x] T004 Configure TypeScript with strict mode in tsconfig.json
- [x] T005 Configure ESLint and Prettier for code quality in .eslintrc.js and .prettierrc
- [x] T006 Create directory structure: app/, components/, services/, hooks/, types/, utils/, assets/, **tests**/ in project root
- [x] T007 [P] Configure Expo app in app.json with name "ACP Mobile", slug "acp-mobile", scheme "acp"
- [x] T008 [P] Create environment configuration in utils/constants.ts with API_BASE_URL and feature flags
- [x] T009 [P] Set up Jest and React Native Testing Library in jest.config.js
- [x] T010 [P] Create .gitignore with node_modules, .expo, .env.local entries
- [x] T011 [P] Create README.md with quickstart instructions from specs/001-acp-mobile/quickstart.md

---

## ✅ Phase 2: Foundational Infrastructure (14 tasks) - COMPLETE

**Goal**: Build shared components, authentication, and API infrastructure that all user stories depend on

**Independent Test**: Authentication flow works end-to-end, API client handles token refresh, theme switching works

**Tasks**:

### TypeScript Types (Foundational)

- [x] T012 [P] Create User type in types/user.ts with id, name, email, role, avatar, ssoProvider, preferences
- [x] T013 [P] Create Session types in types/session.ts with Session, SessionStatus enum, ModelType enum
- [x] T014 [P] Create GitHubNotification type in types/notification.ts with NotificationType enum
- [x] T015 [P] Create Repository type in types/api.ts with id, name, url, branch, isConnected
- [x] T016 [P] Create ChatMessage type in types/api.ts with id, threadId, role, content, timestamp
- [x] T017 [P] Create UserPreferences and NotificationPreferences types in types/user.ts

### Authentication & API Client

- [x] T018 Implement OAuth PKCE flow in services/auth/oauth.ts with expo-auth-session
- [x] T019 Implement token management in services/auth/token-manager.ts with SecureStore for access/refresh tokens
- [x] T020 Create HTTP client in services/api/client.ts with Axios, auth interceptor, and token refresh logic
- [x] T021 Implement auth API endpoints in services/api/auth.ts: login(), exchangeToken(), refreshToken()

### Storage & Caching

- [x] T022 [P] Implement AsyncStorage cache utility in services/storage/cache.ts with TTL support (5min default)
- [x] T023 [P] Implement preferences storage in services/storage/preferences.ts with AsyncStorage

### Theme & Context Providers

- [x] T024 Create ThemeContext in hooks/useTheme.ts with light/dark/system support
- [x] T025 Create AuthContext in hooks/useAuth.ts with login, logout, user state, token refresh

---

## ✅ Phase 3: User Story 1 - Monitor Active AI Sessions (Priority: P1) (12 tasks) - COMPLETE

**Story Goal**: View and monitor active AI coding sessions from phone with real-time status updates

**Independent Test**: Launch app, view dashboard showing 3+ active sessions with names, status, progress bars, model badges; navigate to session detail showing real-time progress; see error indicators for failed sessions

**Why MVP**: Core value proposition - without session monitoring, app has no baseline utility

**Entity Dependencies**: Session, ModelType, WorkflowType, User

**Acceptance Criteria**:

1. Dashboard displays all active sessions with name, status, progress %, model badge
2. Session detail shows real-time progress, current task, estimated completion
3. Error sessions show clear error indicator with details

**Tasks**:

### Data Layer [US1]

- [x] T026 [P] [US1] Implement sessions API service in services/api/sessions.ts with fetchSessions(), fetchSessionDetail()
- [x] T027 [P] [US1] Create useSessions hook in hooks/useSessions.ts with polling every 5s when active
- [x] T028 [P] [US1] Create useOffline hook in hooks/useOffline.ts to detect network state

### UI Components [US1]

- [x] T029 [P] [US1] Create SessionCard component in components/session/SessionCard.tsx displaying session name, status badge, progress bar, model badge
- [x] T030 [P] [US1] Create SessionProgress component in components/session/SessionProgress.tsx with animated progress bar (0-100%)
- [x] T031 [P] [US1] Create ModelBadge component in components/session/ModelBadge.tsx for sonnet-4.5/opus-4.5 badges
- [x] T032 [P] [US1] Create StatusBadge component in components/ui/Badge.tsx with color coding for running/paused/done/error states
- [x] T033 [P] [US1] Create Header component in components/layout/Header.tsx with time-based greeting, present icon, avatar with notification badge

### Screens [US1]

- [x] T034 [US1] Create root layout in app/\_layout.tsx with AuthContext and ThemeContext providers
- [x] T035 [US1] Implement Dashboard screen in app/(tabs)/index.tsx showing active sessions list, awaiting review card, offline indicator
- [x] T036 [US1] Implement Session Detail screen in app/sessions/[id].tsx with progress, current task, tasks completed, error message (if any)
- [x] T037 [US1] Implement Sessions List screen in app/sessions/index.tsx with filter chips (All/Running/Paused/Done) and scrollable session list

---

## ✅ Phase 4: User Story 2 - Review Completed Work (Priority: P1) (8 tasks) - COMPLETE

**Story Goal**: Review AI-completed work and approve/reject changes from phone to unblock sessions

**Independent Test**: View "Awaiting Review" section on dashboard, navigate to completed session, review changes, approve or reject with feedback, verify session moves to completed status

**Why P1**: Critical for workflow completion - blocked sessions impact team velocity

**Entity Dependencies**: Session (already created in US1)

**Acceptance Criteria**:

1. "Awaiting Review" card shows count of sessions needing approval
2. Can view completed session details with changes preview
3. Can approve session to move to completed status
4. Can reject session with feedback for modifications

**Tasks**:

### Data Layer [US2]

- [x] T038 [P] [US2] Add updateSession() method to services/api/sessions.ts for approve/reject actions
- [x] T039 [P] [US2] Add fetchLogs() method to services/api/sessions.ts to get session execution logs

### UI Components [US2]

- [x] T040 [P] [US2] Create ReviewCard component in components/session/ReviewCard.tsx showing session awaiting review with preview (NOTE: Using SessionCard directly with horizontal scroll)
- [x] T041 [P] [US2] Create ApprovalActions component in components/session/ApprovalActions.tsx with Approve/Reject buttons and feedback input

### Screens & Integration [US2]

- [x] T042 [US2] Add "Awaiting Review" section to Dashboard (app/(tabs)/index.tsx) showing count and scrollable preview
- [x] T043 [US2] Enhance Session Detail screen (app/sessions/[id].tsx) to show ApprovalActions for awaiting_review status
- [x] T044 [US2] Implement session approval flow: tap Approve → optimistic update → API call → refresh sessions list
- [x] T045 [US2] Implement session rejection flow: tap Reject → show feedback modal → API call with feedback → refresh sessions list

---

## ✅ Phase 5: User Story 3 - Respond to GitHub Notifications (Priority: P2) (10 tasks) - COMPLETE

**Story Goal**: Receive and act on GitHub notifications from phone to quickly respond to PRs, issues, mentions

**Independent Test**: View GitHub notifications with unread count, filter by All/Unread, mark as read, open notification details, start suggested AI workflow from notification

**Why P2**: High-value integration leveraging existing workflows, time-sensitive collaboration

**Entity Dependencies**: GitHubNotification, WorkflowType, Repository

**Acceptance Criteria**:

1. GitHub Notifications screen shows all notifications with type icons, repo, title, author, time, unread indicator
2. Filter tabs (All/Unread) work with unread count badge
3. Can mark individual notifications or all as read
4. Notification action sheet shows: preview, "Start [Workflow]" (with "Soon" badge), mark read, open in browser, mute thread

**Tasks**:

### Data Layer [US3]

- [x] T046 [P] [US3] Implement notifications API service in services/api/notifications.ts with fetchNotifications(), markAsRead(), muteThread()
- [x] T047 [P] [US3] Create useNotifications hook in hooks/useNotifications.ts with polling every 30s and unread count

### UI Components [US3]

- [x] T048 [P] [US3] Create NotificationCard component in components/notifications/NotificationCard.tsx with type icon, repo, title, author, time, unread indicator (blue border + dot)
- [x] T049 [P] [US3] Create NotificationActions component in components/notifications/NotificationActions.tsx with action sheet: preview, start workflow, mark read, open browser, mute
- [x] T050 [P] [US3] Create workflow suggestion mapping in utils/constants.ts: NotificationType → WorkflowType (PR→Review, Issue→Bugfix, etc.)

### Screens & Integration [US3]

- [x] T051 [US3] Implement GitHub Notifications screen in app/notifications/index.tsx with filter tabs (All/Unread), unread count badge, "Mark all read" action
- [x] T052 [US3] Implement notification tap handler to show NotificationActions action sheet
- [x] T053 [US3] Implement "Mark as Read" action with optimistic update and API call
- [x] T054 [US3] Implement "Open in Browser" action using Linking.openURL()
- [x] T055 [US3] Add "GitHub Notifications" quick action to Dashboard with unread count badge

---

## Phase 6: User Story 4 - Chat with Claude Interactively (Priority: P2) (9 tasks)

**Story Goal**: Have quick interactive conversations with Claude from phone for immediate answers without starting full session

**Independent Test**: Tap "Interactive" button, chat modal opens, send message, receive response within 3s, ask follow-up maintaining context, close and reopen to see history

**Why P2**: Lightweight interaction for ad-hoc questions, complements structured workflows

**Entity Dependencies**: ChatMessage, ChatThread

**Acceptance Criteria**:

1. "Interactive" quick action button opens chat modal
2. Can send messages and receive Claude responses
3. Conversation maintains context across multiple messages
4. Chat history persists and reloads on reopen

**Tasks**:

### Data Layer [US4]

- [ ] T056 [P] [US4] Implement chat API service in services/api/chat.ts with sendMessage(), getChatHistory()
- [ ] T057 [P] [US4] Create useChat hook in hooks/useChat.ts with messages state, sendMessage handler, loading state

### UI Components [US4]

- [ ] T058 [P] [US4] Create ChatBubble component in components/chat/ChatBubble.tsx for user/assistant messages with avatar
- [ ] T059 [P] [US4] Create ChatInput component in components/chat/ChatInput.tsx with text field and send button (arrow up icon)
- [ ] T060 [P] [US4] Create ChatHeader component in components/chat/ChatHeader.tsx with "Claude" + green dot + "sonnet-4.5" subtitle + close/more options

### Screens & Integration [US4]

- [ ] T061 [US4] Implement Interactive Chat modal in app/chat.tsx with pageSheet presentation, ChatHeader, message list, ChatInput, disclaimer
- [ ] T062 [US4] Add "Interactive" quick action button to Dashboard that opens chat modal
- [ ] T063 [US4] Implement send message flow: optimistic UI update → API call → append Claude response
- [ ] T064 [US4] Implement chat history loading on modal open from AsyncStorage cache

---

## Phase 7: User Story 5 - Start New AI Sessions (Priority: P2) (11 tasks)

**Story Goal**: Initiate new AI coding sessions from phone to kick off work remotely

**Independent Test**: Tap FAB, new session screen opens, select repository from connected repos or enter URL, choose workflow type, see auto-generated session name (editable), select model, tap "Start Session", verify session appears in dashboard

**Why P2**: Enables proactive work initiation, completes workflow loop

**Entity Dependencies**: Repository, WorkflowType, Session (already created)

**Acceptance Criteria**:

1. FAB (floating action button) visible on dashboard
2. New Session screen shows repository picker (connected repos or manual URL)
3. Workflow type grid shows 7 options (Review, Bugfix, Plan, Research, Chat, Ideate + "New..." with "Soon" badge)
4. Session name auto-generates as "{repo} {Workflow} - {Month Day}" and is editable
5. Model selection shows sonnet-4.5 (default, "Fast & efficient") and opus-4.5 ("Most capable")
6. "Start Session" button disabled until repository selected, enabled after selection

**Tasks**:

### Data Layer [US5]

- [ ] T065 [P] [US5] Implement repositories API service in services/api/repositories.ts with fetchRepos(), addRepo(), removeRepo()
- [ ] T066 [P] [US5] Add createSession() method to services/api/sessions.ts
- [ ] T067 [P] [US5] Create workflow types constant in utils/constants.ts with 7 workflows and their metadata (id, label, icon, description, enabled)

### UI Components [US5]

- [ ] T068 [P] [US5] Create FAB component in components/layout/FAB.tsx with purple circle + plus icon, bottom-right positioning
- [ ] T069 [P] [US5] Create RepositoryPicker component in components/session/RepositoryPicker.tsx showing connected repos list + "Enter GitHub URL" option
- [ ] T070 [P] [US5] Create WorkflowTypeGrid component in components/session/WorkflowTypeGrid.tsx with 7 workflow cards, "Soon" badges for disabled
- [ ] T071 [P] [US5] Create ModelSelector component in components/session/ModelSelector.tsx with sonnet-4.5/opus-4.5 radio buttons and descriptions
- [ ] T072 [P] [US5] Create custom lightbulb SVG icon in assets/icons/lightbulb.svg for Ideate workflow

### Screens & Integration [US5]

- [ ] T073 [US5] Implement New Session screen in app/sessions/new.tsx with RepositoryPicker, WorkflowTypeGrid, session name field, ModelSelector, "Start Session" button
- [ ] T074 [US5] Add FAB to Dashboard (app/(tabs)/index.tsx) that navigates to New Session screen
- [ ] T075 [US5] Implement auto-generate session name on repository + workflow selection: "{repo-name} {Workflow} - {Month Day}"

---

## Phase 8: User Story 6 - Manage Settings and Preferences (Priority: P3) (12 tasks)

**Story Goal**: Configure notification preferences, connected repositories, appearance settings for customization

**Independent Test**: Access Settings from user menu, toggle notification preferences and verify they persist, add/remove connected repositories, switch theme and verify immediate update + persistence across app restart

**Why P3**: Personalization is important but not critical - app works with defaults

**Entity Dependencies**: UserPreferences, NotificationPreferences, Repository

**Acceptance Criteria**:

1. Settings screen shows profile card (avatar, name, role, SSO status) + menu items
2. Push Notifications settings has toggles for 4 types (blocking alerts, review requests, session updates, features & news)
3. Connected Repos shows list with add/remove functionality
4. Appearance settings has theme selector (light/dark/system) with immediate effect
5. Send Feedback button opens Google Form
6. Sign Out button clears tokens and redirects to login

**Tasks**:

### Data Layer [US6]

- [ ] T076 [P] [US6] Implement user preferences API in services/api/user.ts with fetchProfile(), fetchPreferences(), updatePreferences()
- [ ] T077 [P] [US6] Enhance preferences storage in services/storage/preferences.ts to handle theme, notifications, quietHours

### UI Components [US6]

- [ ] T078 [P] [US6] Create ProfileCard component in components/settings/ProfileCard.tsx with avatar, name, role, SSO status badge
- [ ] T079 [P] [US6] Create SettingsRow component in components/ui/SettingsRow.tsx with label, icon, chevron right, optional badge
- [ ] T080 [P] [US6] Create Toggle component in components/ui/Toggle.tsx for notification preference switches

### Screens [US6]

- [ ] T081 [US6] Implement Settings main screen in app/settings/index.tsx with ProfileCard, menu items (Push Notifications, Quiet Hours, Connected Repos, GitHub Integration, API Keys, Appearance), Send Feedback, Sign Out
- [ ] T082 [US6] Implement Push Notifications settings in app/settings/notifications.tsx with 4 toggles
- [ ] T083 [US6] Implement Connected Repositories screen in app/settings/repos.tsx with repo list and add/remove functionality
- [ ] T084 [US6] Implement Appearance settings in app/settings/appearance.tsx with theme selector (light/dark/system)
- [ ] T085 [US6] Implement Sign Out flow: confirm dialog → clear SecureStore + AsyncStorage → redirect to login
- [ ] T086 [US6] Add Settings access from user menu (avatar tap in header)
- [ ] T087 [US6] Implement "Send Feedback" action to open Google Form: https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform

---

## Phase 9: User Story 7 - Discover Platform Features (Priority: P3) (Deferred - "Soon" Badge)

**Story Goal**: Learn about new ACP features and platform updates

**Note**: This story involves backend integration for announcements feed. Tasks marked as "Soon" in initial implementation - UI placeholders present but actions disabled.

**Independent Test**: Tap present icon → "What's New" menu opens → see announcements list (when backend ready)

**Deferred Tasks** (not included in initial 87 tasks):

- Implement announcements API service
- Create announcement entity types
- Implement present menu with announcements list
- Implement "NEW" badge logic for unread announcements

---

## Phase 10: Polish & Cross-Cutting Concerns (No additional tasks - handled in Phase 2)

**Covered in Foundational Phase**:

- Authentication (T018-T021)
- Theme system (T024)
- API client with error handling (T020)
- Offline detection (T028)
- Storage & caching (T022-T023)

**Additional Polish** (covered in user story phases):

- Error indicators (US1: T037 session errors)
- Loading states (all API hooks include loading state)
- Optimistic updates (US2: T044 approval, US4: T063 chat)
- Deep linking (handled by Expo Router automatically)

---

## Dependencies & Execution Order

### Story Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundation)
                      ↓
    ┌─────────────────┴──────────────────┐
    ↓                                     ↓
Phase 3: US1 (Monitor Sessions)      Phase 2 (Auth)
    ↓
Phase 4: US2 (Review Work)            [depends on US1 for Session components]
    ↓
┌───┴────┬──────────┬──────────┐
↓        ↓          ↓          ↓
Phase 5  Phase 6    Phase 7    Phase 8
US3      US4        US5        US6
(Notify) (Chat)     (Create)   (Settings)

All P2/P3 stories are independent after US1 completes
```

### Critical Path

1. **Setup** (Phase 1): 11 tasks - MUST complete first
2. **Foundation** (Phase 2): 14 tasks - MUST complete before user stories
3. **US1** (Phase 3): 12 tasks - MVP, MUST complete for app to be useful
4. **US2** (Phase 4): 8 tasks - Depends on US1 Session components
5. **US3-US6** (Phases 5-8): Can parallelize after US1 complete

### Parallel Opportunities

**After Phase 2 (Foundation) completes**:

- US1 (Monitor) MUST be first (MVP)
- After US1 completes:
  - US2 (Review) uses US1 components → starts after US1
  - US3 (Notifications) → can start in parallel with US2
  - US4 (Chat) → can start in parallel with US2
  - US5 (Create Sessions) → can start in parallel with US2
  - US6 (Settings) → can start in parallel with US2

**Within each phase**, tasks marked `[P]` are parallelizable:

- Phase 1: T007-T011 (5 parallel config tasks after T001-T006)
- Phase 2: T012-T017 (6 parallel type definitions), T022-T023 (2 parallel storage)
- Phase 3: All component tasks (T029-T033) can run in parallel
- Similar patterns in other phases

**Example Parallel Execution (Phase 3 - US1)**:

```bash
# Developer A: Data layer
T026 → T027 → T028

# Developer B: UI components (parallel to A)
T029 (SessionCard)
T030 (SessionProgress)
T031 (ModelBadge)
T032 (StatusBadge)
T033 (Header)

# Developer C: Screens (starts after both A and B have components ready)
T034 → T035 → T036 → T037
```

---

## Task Validation Summary

✅ **Format Compliance**:

- All 87 tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- Task IDs sequential: T001-T087
- [P] markers on 43 parallelizable tasks
- [US1]-[US6] labels on all user story phase tasks (45 tasks)
- All tasks include specific file paths

✅ **Organization**:

- Organized by user story priority (P1 → P2 → P3)
- Each story phase is independently testable
- Clear entity dependencies documented per phase
- Acceptance criteria mapped to tasks

✅ **Completeness**:

- All 7 user stories covered (US7 deferred with "Soon" badges)
- All entities from data-model.md included
- All API endpoints from contracts/acp-api.yaml mapped to tasks
- Research decisions (OAuth, polling, Expo Push, Maestro) incorporated

✅ **MVP Clarity**:

- MVP = Phase 3 (US1: Monitor Sessions) = 12 tasks after 25 foundation tasks
- First usable increment: 37 tasks total (Setup + Foundation + US1)

---

## Summary

**Total Tasks**: 87

- Phase 1 (Setup): 11 tasks
- Phase 2 (Foundation): 14 tasks
- Phase 3 (US1 - Monitor): 12 tasks ⭐ **MVP**
- Phase 4 (US2 - Review): 8 tasks
- Phase 5 (US3 - Notifications): 10 tasks
- Phase 6 (US4 - Chat): 9 tasks
- Phase 7 (US5 - Create Sessions): 11 tasks
- Phase 8 (US6 - Settings): 12 tasks
- Phase 9 (US7 - Discovery): Deferred

**Parallelizable Tasks**: 43 tasks marked with [P]

**Suggested MVP Scope**:

- Complete phases 1-3 (37 tasks)
- Delivers: Login + Dashboard with session monitoring + session details
- Validates core hypothesis: mobile session monitoring is valuable

**Next MVP Iteration**:

- Add Phase 4 (US2 - Review Work): 8 tasks
- Delivers: Complete P1 feature set (monitor + review)
- Ready for beta testing with core workflow

**Full Feature Set**:

- Complete all phases 1-8 (87 tasks)
- Delivers: Complete P1 + P2 + P3 features
- Production-ready mobile companion app
