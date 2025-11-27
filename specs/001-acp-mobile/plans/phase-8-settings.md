# Phase 8 Implementation Plan: User Story 6 - Manage Settings and Preferences

**Feature**: 001-acp-mobile
**Phase**: 8 (User Story 6 - Priority P3)
**Branch**: `001-acp-mobile`
**Created**: 2025-11-27
**Status**: Ready for Implementation

## Overview

**Story Goal**: Configure notification preferences, connected repositories, appearance settings for customization

**Priority**: P3 - Personalization is important but not critical; app works with defaults

**Tasks**: 12 tasks (T076-T087)

**Dependencies**:

- Phase 2 (Foundation) - Auth, Storage, Theme infrastructure
- Phase 1 (Setup) - Project structure

**Independent Test Criteria**:

- Access Settings from user menu
- Toggle notification preferences and verify they persist
- Add/remove connected repositories
- Switch theme and verify immediate update + persistence across app restart

## Architecture Overview

### Data Flow

```text
User Interaction → Settings Screen → API Service → Backend
                         ↓
                   Local Storage (AsyncStorage)
                         ↓
                   Context Provider Update
                         ↓
                   UI Re-renders with New Settings
```

### Storage Strategy

1. **User Profile** (Read-only from API):
   - Cached in AsyncStorage after fetch
   - TTL: 1 hour
   - Invalidated on logout

2. **User Preferences** (Read/Write):
   - Synced with backend via API
   - Cached locally in AsyncStorage
   - Optimistic updates for instant UI feedback
   - Background sync on change

3. **Theme** (Local-first):
   - Stored in AsyncStorage
   - Applied immediately via ThemeContext
   - No backend sync needed

### Component Hierarchy

```text
Settings (app/settings/index.tsx)
├── ProfileCard
├── SettingsRow (multiple instances)
│   └── Navigates to sub-screens:
│       ├── Push Notifications (app/settings/notifications.tsx)
│       │   └── Toggle (4x instances)
│       ├── Connected Repos (app/settings/repos.tsx)
│       │   └── RepoListItem (multiple)
│       └── Appearance (app/settings/appearance.tsx)
│           └── ThemeSelector (radio group)
└── Action Buttons (Send Feedback, Sign Out)
```

## Acceptance Criteria Validation

### AC1: Settings screen shows profile card + menu items ✓

**Implementation**:

- T081: Main Settings screen with ProfileCard component
- T078: ProfileCard component with avatar, name, role, SSO status

**Test**:

1. Open Settings from user menu
2. Verify profile card displays user avatar, full name, role badge
3. Verify SSO status badge shows provider (e.g., "Red Hat SSO")
4. Verify menu items present: Push Notifications, Quiet Hours*, Connected Repos, GitHub Integration*, API Keys\*, Appearance, Send Feedback, Sign Out
5. (\*) = Placeholder items with "Soon" badge

### AC2: Push Notifications settings has toggles for 4 types ✓

**Implementation**:

- T082: Push Notifications screen
- T080: Toggle component

**Test**:

1. Navigate to Push Notifications from Settings
2. Verify 4 toggles present:
   - "Blocking alerts" (sessions awaiting review)
   - "Review requests" (new review requests from team)
   - "Session updates" (completion/error notifications)
   - "Features & news" (product announcements)
3. Toggle each preference on/off
4. Exit and re-enter screen → verify state persisted
5. Restart app → verify state persisted across sessions

### AC3: Connected Repos shows list with add/remove functionality ✓

**Implementation**:

- T083: Connected Repositories screen
- T076: Repositories API service (fetchRepos, addRepo, removeRepo)

**Test**:

1. Navigate to Connected Repos from Settings
2. Verify list shows connected repositories with names and URLs
3. Tap "+" button → show repo URL input dialog
4. Enter GitHub repo URL → verify repo added to list
5. Tap "Remove" on repo → verify repo removed from list
6. Verify changes sync with backend
7. Restart app → verify repo list persisted

### AC4: Appearance settings has theme selector with immediate effect ✓

**Implementation**:

- T084: Appearance settings screen
- T024 (Phase 2): ThemeContext with light/dark/system support
- T077: Enhanced preferences storage for theme

**Test**:

1. Navigate to Appearance from Settings
2. Verify 3 theme options: Light, Dark, System
3. Select "Dark" → verify immediate UI theme change
4. Select "Light" → verify immediate UI theme change
5. Select "System" → verify theme matches device setting
6. Restart app → verify theme persisted
7. Change device theme (when "System" selected) → verify app theme updates

### AC5: Send Feedback opens Google Form ✓

**Implementation**:

- T087: Send Feedback action with Linking.openURL()

**Test**:

1. Tap "Send Feedback" in Settings
2. Verify Google Form opens in browser
3. URL: `https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform`

### AC6: Sign Out clears tokens and redirects to login ✓

**Implementation**:

- T085: Sign Out flow with confirm dialog

**Test**:

1. Tap "Sign Out" in Settings
2. Verify confirmation dialog appears
3. Tap "Cancel" → verify no action taken
4. Tap "Sign Out" again → tap "Confirm"
5. Verify SecureStore tokens cleared
6. Verify AsyncStorage cache cleared
7. Verify redirect to login screen
8. Verify cannot navigate back to Settings without re-authenticating

---

## Task-by-Task Implementation Guide

### T076: Implement user preferences API [Data Layer]

**File**: `services/api/user.ts`

**Dependencies**:

- T020 (Phase 2): HTTP client with auth interceptor

**API Endpoints** (from `contracts/acp-api.yaml`):

```typescript
GET /user/profile
Response: {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  ssoProvider: string
}

GET /user/preferences
Response: {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    blockingAlerts: boolean
    reviewRequests: boolean
    sessionUpdates: boolean
    featuresNews: boolean
  }
  quietHours: {
    enabled: boolean
    start: string  // "22:00"
    end: string    // "08:00"
  }
}

PUT /user/preferences
Request: UserPreferences (same as GET response)
Response: UserPreferences
```

**Implementation**:

```typescript
import { apiClient } from './client'
import type { User, UserPreferences } from '../../types/user'

export const userApi = {
  /**
   * Fetch user profile information
   * Cached for 1 hour in AsyncStorage
   */
  async fetchProfile(): Promise<User> {
    const response = await apiClient.get<User>('/user/profile')
    return response.data
  },

  /**
   * Fetch user preferences (theme, notifications, quiet hours)
   * Cached locally with optimistic updates
   */
  async fetchPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<UserPreferences>('/user/preferences')
    return response.data
  },

  /**
   * Update user preferences
   * Returns updated preferences from backend
   */
  async updatePreferences(preferences: UserPreferences): Promise<UserPreferences> {
    const response = await apiClient.put<UserPreferences>('/user/preferences', preferences)
    return response.data
  },
}
```

**Testing**:

- Unit test: Mock apiClient calls
- Integration test: Verify request/response structure matches API contract
- Error handling: Verify 401 triggers re-auth, 500 shows error message

**Completion Criteria**:

- [ ] All 3 methods implemented
- [ ] TypeScript types match `types/user.ts`
- [ ] Error handling for network failures
- [ ] Unit tests pass

---

### T077: Enhance preferences storage [Data Layer]

**File**: `services/storage/preferences.ts`

**Dependencies**:

- T023 (Phase 2): Existing preferences storage with AsyncStorage
- T076: User preferences API

**Existing Implementation** (from Phase 2):

- Basic AsyncStorage wrapper for user preferences

**Enhancements Needed**:

1. Add theme preference storage
2. Add notification preferences storage
3. Add quiet hours storage
4. Implement optimistic update pattern
5. Add sync status tracking

**Implementation**:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { UserPreferences, NotificationPreferences } from '../../types/user'

const PREFERENCES_KEY = 'user_preferences'
const PROFILE_KEY = 'user_profile'
const PROFILE_TTL = 60 * 60 * 1000 // 1 hour

export const preferencesStorage = {
  /**
   * Get user preferences from local storage
   * Returns null if not found
   */
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load preferences:', error)
      return null
    }
  },

  /**
   * Save user preferences to local storage
   * Used for optimistic updates and offline caching
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save preferences:', error)
      throw error
    }
  },

  /**
   * Update specific notification preference
   * Optimistic update - saves locally immediately
   */
  async updateNotificationPreference(
    key: keyof NotificationPreferences,
    value: boolean
  ): Promise<void> {
    const prefs = await this.getPreferences()
    if (!prefs) return

    prefs.notifications[key] = value
    await this.savePreferences(prefs)
  },

  /**
   * Update theme preference
   * Optimistic update - saves locally immediately
   */
  async updateTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    const prefs = await this.getPreferences()
    if (!prefs) return

    prefs.theme = theme
    await this.savePreferences(prefs)
  },

  /**
   * Clear all preferences (on logout)
   */
  async clearPreferences(): Promise<void> {
    await AsyncStorage.removeItem(PREFERENCES_KEY)
    await AsyncStorage.removeItem(PROFILE_KEY)
  },

  /**
   * Cache user profile with TTL
   */
  async cacheProfile(profile: User): Promise<void> {
    const data = {
      profile,
      timestamp: Date.now(),
    }
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data))
  },

  /**
   * Get cached profile if not expired
   */
  async getCachedProfile(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY)
      if (!data) return null

      const { profile, timestamp } = JSON.parse(data)
      const age = Date.now() - timestamp

      if (age > PROFILE_TTL) {
        // Expired - clear cache
        await AsyncStorage.removeItem(PROFILE_KEY)
        return null
      }

      return profile
    } catch (error) {
      console.error('Failed to load cached profile:', error)
      return null
    }
  },
}
```

**Testing**:

- Unit test: Verify AsyncStorage operations
- Test optimistic updates don't corrupt data
- Test TTL expiration for profile cache
- Test clearPreferences removes all data

**Completion Criteria**:

- [ ] Theme storage implemented
- [ ] Notification preferences storage implemented
- [ ] Quiet hours storage implemented
- [ ] Optimistic update pattern working
- [ ] Profile caching with TTL working
- [ ] Unit tests pass

---

### T078: Create ProfileCard component [UI Component]

**File**: `components/settings/ProfileCard.tsx`

**Dependencies**: None (uses types from `types/user.ts`)

**Design Spec**:

- Avatar (circular, 80x80px)
- Name (large bold text)
- Role badge (pill-shaped, gray background)
- SSO status badge (pill-shaped, green background, "Red Hat SSO" text)

**Implementation**:

```typescript
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import type { User } from '../../types/user'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image
        source={{ uri: user.avatar || 'https://ui-avatars.com/api/?name=' + user.name }}
        style={styles.avatar}
      />

      {/* Name */}
      <Text style={styles.name}>{user.name}</Text>

      {/* Role Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{user.role}</Text>
      </View>

      {/* SSO Status Badge */}
      <View style={[styles.badge, styles.ssoBadge]}>
        <View style={styles.ssoIndicator} />
        <Text style={styles.ssoBadgeText}>{user.ssoProvider}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  ssoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
  },
  ssoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  ssoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
})
```

**Testing**:

- Snapshot test: Verify rendered output
- Test with missing avatar (uses placeholder)
- Test with different roles
- Test with different SSO providers

**Completion Criteria**:

- [ ] Component renders correctly
- [ ] Avatar fallback works
- [ ] Styles match design spec
- [ ] TypeScript types correct
- [ ] Snapshot test passes

---

### T079: Create SettingsRow component [UI Component]

**File**: `components/ui/SettingsRow.tsx`

**Dependencies**: None

**Design Spec**:

- Left icon (optional)
- Label (primary text)
- Badge (optional, e.g., "Soon")
- Chevron right icon
- Tap target entire row
- Disabled state (grayed out)

**Implementation**:

```typescript
import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SettingsRowProps {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  badge?: string
  onPress?: () => void
  disabled?: boolean
}

export function SettingsRow({
  label,
  icon,
  badge,
  onPress,
  disabled = false,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Left Icon */}
      {icon && (
        <Ionicons
          name={icon}
          size={24}
          color={disabled ? '#9ca3af' : '#6b7280'}
          style={styles.icon}
        />
      )}

      {/* Label */}
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
      </Text>

      {/* Badge */}
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Chevron */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={disabled ? '#d1d5db' : '#9ca3af'}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  disabledText: {
    color: '#9ca3af',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
})
```

**Testing**:

- Snapshot test: Normal state, disabled state, with badge, with icon
- Test onPress callback
- Test disabled state prevents tap

**Completion Criteria**:

- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] Styles match design spec
- [ ] Snapshot tests pass

---

### T080: Create Toggle component [UI Component]

**File**: `components/ui/Toggle.tsx`

**Dependencies**: None

**Design Spec**:

- Label (primary text)
- Description (secondary text, optional)
- Switch control (React Native Switch)
- Horizontal layout

**Implementation**:

```typescript
import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'

interface ToggleProps {
  label: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export function Toggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
        thumbColor={value ? '#8b5cf6' : '#f3f4f6'}
        ios_backgroundColor="#d1d5db"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
  },
})
```

**Testing**:

- Snapshot test: Normal, with description, disabled
- Test onValueChange callback
- Test disabled state

**Completion Criteria**:

- [ ] Component renders correctly
- [ ] Switch works correctly
- [ ] Styles match design spec
- [ ] Snapshot tests pass

---

### T081: Implement Settings main screen [Screen]

**File**: `app/settings/index.tsx`

**Dependencies**:

- T078: ProfileCard
- T079: SettingsRow
- T076: User API service

**Screen Structure**:

1. ScrollView container
2. ProfileCard at top
3. Settings sections:
   - Notifications section (Push Notifications, Quiet Hours\*)
   - Integrations section (Connected Repos, GitHub Integration*, API Keys*)
   - Preferences section (Appearance)
4. Action buttons (Send Feedback, Sign Out)

**Implementation**:

```typescript
import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { ProfileCard } from '../../components/settings/ProfileCard'
import { SettingsRow } from '../../components/ui/SettingsRow'
import { useAuth } from '../../hooks/useAuth'
import { userApi } from '../../services/api/user'
import type { User } from '../../types/user'

export default function SettingsScreen() {
  const { user: authUser, logout } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const data = await userApi.fetchProfile()
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
      // Fallback to auth user data
      setProfile(authUser)
    } finally {
      setLoading(false)
    }
  }

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/login')
          },
        },
      ]
    )
  }

  if (loading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      {profile && <ProfileCard user={profile} />}

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Notifications</Text>
        <SettingsRow
          label="Push Notifications"
          icon="notifications-outline"
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsRow
          label="Quiet Hours"
          icon="moon-outline"
          badge="Soon"
          disabled
        />
      </View>

      {/* Integrations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Integrations</Text>
        <SettingsRow
          label="Connected Repositories"
          icon="git-branch-outline"
          onPress={() => router.push('/settings/repos')}
        />
        <SettingsRow
          label="GitHub Integration"
          icon="logo-github"
          badge="Soon"
          disabled
        />
        <SettingsRow
          label="API Keys"
          icon="key-outline"
          badge="Soon"
          disabled
        />
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Preferences</Text>
        <SettingsRow
          label="Appearance"
          icon="color-palette-outline"
          onPress={() => router.push('/settings/appearance')}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <SettingsRow
          label="Send Feedback"
          icon="chatbubbles-outline"
          onPress={() => {
            // T087 implementation
            Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform')
          }}
        />
        <SettingsRow
          label="Sign Out"
          icon="log-out-outline"
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actions: {
    marginTop: 16,
    marginBottom: 32,
  },
})
```

**Testing**:

- Integration test: Verify navigation to sub-screens
- Test profile loading (success and error states)
- Test sign out flow
- Test disabled items don't navigate

**Completion Criteria**:

- [ ] Screen renders correctly
- [ ] Profile loads and displays
- [ ] Navigation works
- [ ] Sign out confirmation works
- [ ] Integration tests pass

---

### T082: Implement Push Notifications settings [Screen]

**File**: `app/settings/notifications.tsx`

**Dependencies**:

- T080: Toggle component
- T076: User preferences API
- T077: Enhanced preferences storage

**Screen Structure**:

- 4 toggle switches for notification types
- Optimistic updates (instant UI feedback)
- Background sync with backend
- Error handling with retry

**Implementation**:

```typescript
import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native'
import { Toggle } from '../../components/ui/Toggle'
import { userApi } from '../../services/api/user'
import { preferencesStorage } from '../../services/storage/preferences'
import type { NotificationPreferences } from '../../types/user'

export default function NotificationsSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    blockingAlerts: true,
    reviewRequests: true,
    sessionUpdates: true,
    featuresNews: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    try {
      // Try API first
      const prefs = await userApi.fetchPreferences()
      setPreferences(prefs.notifications)
      await preferencesStorage.savePreferences(prefs)
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Fallback to local cache
      const cached = await preferencesStorage.getPreferences()
      if (cached) {
        setPreferences(cached.notifications)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(
    key: keyof NotificationPreferences,
    value: boolean
  ) {
    // Optimistic update
    setPreferences(prev => ({ ...prev, [key]: value }))

    try {
      // Update local storage immediately
      await preferencesStorage.updateNotificationPreference(key, value)

      // Sync with backend
      const fullPrefs = await preferencesStorage.getPreferences()
      if (fullPrefs) {
        await userApi.updatePreferences(fullPrefs)
      }
    } catch (error) {
      console.error('Failed to update preference:', error)

      // Revert optimistic update on error
      setPreferences(prev => ({ ...prev, [key]: !value }))

      Alert.alert(
        'Update Failed',
        'Failed to save notification preference. Please try again.',
        [{ text: 'OK' }]
      )
    }
  }

  if (loading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.description}>
        Choose which notifications you want to receive on your device.
      </Text>

      <View style={styles.section}>
        <Toggle
          label="Blocking alerts"
          description="Sessions awaiting your review that block team progress"
          value={preferences.blockingAlerts}
          onValueChange={value => handleToggle('blockingAlerts', value)}
        />
        <Toggle
          label="Review requests"
          description="New review requests from your team members"
          value={preferences.reviewRequests}
          onValueChange={value => handleToggle('reviewRequests', value)}
        />
        <Toggle
          label="Session updates"
          description="Completion and error notifications for your sessions"
          value={preferences.sessionUpdates}
          onValueChange={value => handleToggle('sessionUpdates', value)}
        />
        <Toggle
          label="Features & news"
          description="Product announcements and new feature releases"
          value={preferences.featuresNews}
          onValueChange={value => handleToggle('featuresNews', value)}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
})
```

**Testing**:

- Test optimistic updates (instant UI change)
- Test backend sync after toggle
- Test error handling (network failure)
- Test revert on error
- Test persistence across screen navigation

**Completion Criteria**:

- [ ] All 4 toggles work
- [ ] Optimistic updates instant
- [ ] Backend sync works
- [ ] Error handling works
- [ ] Persistence works
- [ ] Integration tests pass

---

### T083: Implement Connected Repositories screen [Screen]

**File**: `app/settings/repos.tsx`

**Dependencies**:

- T076: User API service (need to add repositories endpoint)
- Reuse from Phase 7 T065: Repositories API service

**Note**: This task requires the repositories API service from Phase 7 (T065). If Phase 7 hasn't been implemented yet, we'll need to implement the API service first.

**API Endpoints** (from `contracts/acp-api.yaml`):

```typescript
GET /repositories
Response: Repository[]

POST /repositories
Request: { url: string }
Response: Repository

DELETE /repositories/{id}
Response: 204 No Content
```

**Screen Structure**:

- List of connected repositories
- "+" button to add new repo
- Swipe-to-delete or delete button on each repo
- Empty state when no repos

**Implementation**:

```typescript
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { repositoriesApi } from '../../services/api/repositories'
import type { Repository } from '../../types/api'

export default function ConnectedReposScreen() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepos()
  }, [])

  async function loadRepos() {
    try {
      const data = await repositoriesApi.fetchRepos()
      setRepos(data)
    } catch (error) {
      console.error('Failed to load repos:', error)
      Alert.alert('Error', 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  function handleAddRepo() {
    Alert.prompt(
      'Add Repository',
      'Enter GitHub repository URL',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (url) => {
            if (!url) return

            try {
              const newRepo = await repositoriesApi.addRepo(url)
              setRepos(prev => [...prev, newRepo])
            } catch (error) {
              console.error('Failed to add repo:', error)
              Alert.alert('Error', 'Failed to add repository')
            }
          },
        },
      ],
      'plain-text'
    )
  }

  async function handleRemoveRepo(repo: Repository) {
    Alert.alert(
      'Remove Repository',
      `Remove ${repo.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await repositoriesApi.removeRepo(repo.id)
              setRepos(prev => prev.filter(r => r.id !== repo.id))
            } catch (error) {
              console.error('Failed to remove repo:', error)
              Alert.alert('Error', 'Failed to remove repository')
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>
  }

  return (
    <View style={styles.container}>
      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddRepo}>
        <Ionicons name="add-circle" size={24} color="#8b5cf6" />
        <Text style={styles.addButtonText}>Add Repository</Text>
      </TouchableOpacity>

      {/* Repository List */}
      {repos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="git-branch-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No repositories connected</Text>
          <Text style={styles.emptySubtext}>
            Add a repository to start creating sessions
          </Text>
        </View>
      ) : (
        <FlatList
          data={repos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.repoItem}>
              <View style={styles.repoInfo}>
                <Text style={styles.repoName}>{item.name}</Text>
                <Text style={styles.repoUrl}>{item.url}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveRepo(item)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  repoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  repoInfo: {
    flex: 1,
  },
  repoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  repoUrl: {
    fontSize: 13,
    color: '#6b7280',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
})
```

**Testing**:

- Test add repository flow
- Test remove repository flow
- Test empty state
- Test error handling
- Test list rendering

**Completion Criteria**:

- [ ] List displays correctly
- [ ] Add repo works
- [ ] Remove repo works
- [ ] Empty state shows
- [ ] Error handling works
- [ ] Integration tests pass

---

### T084: Implement Appearance settings [Screen]

**File**: `app/settings/appearance.tsx`

**Dependencies**:

- T024 (Phase 2): ThemeContext
- T077: Enhanced preferences storage

**Screen Structure**:

- Radio button group for theme selection
- Immediate theme change on selection
- Persistence to local storage

**Implementation**:

```typescript
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'
import { preferencesStorage } from '../../services/storage/preferences'

type ThemeOption = 'light' | 'dark' | 'system'

export default function AppearanceSettingsScreen() {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(theme)

  async function handleThemeChange(newTheme: ThemeOption) {
    setSelectedTheme(newTheme)
    setTheme(newTheme)

    // Persist to storage
    await preferencesStorage.updateTheme(newTheme)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Choose how ACP Mobile appears on your device.
      </Text>

      <View style={styles.section}>
        <ThemeOption
          label="Light"
          description="Use light theme"
          value="light"
          selected={selectedTheme === 'light'}
          onSelect={() => handleThemeChange('light')}
        />
        <ThemeOption
          label="Dark"
          description="Use dark theme"
          value="dark"
          selected={selectedTheme === 'dark'}
          onSelect={() => handleThemeChange('dark')}
        />
        <ThemeOption
          label="System"
          description="Match device theme"
          value="system"
          selected={selectedTheme === 'system'}
          onSelect={() => handleThemeChange('system')}
        />
      </View>
    </View>
  )
}

interface ThemeOptionProps {
  label: string
  description: string
  value: ThemeOption
  selected: boolean
  onSelect: () => void
}

function ThemeOption({
  label,
  description,
  selected,
  onSelect,
}: ThemeOptionProps) {
  return (
    <TouchableOpacity
      style={styles.option}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#8b5cf6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
  },
})
```

**Testing**:

- Test theme selection changes immediately
- Test theme persists across navigation
- Test theme persists across app restart
- Test "System" option matches device theme

**Completion Criteria**:

- [ ] All 3 theme options work
- [ ] Immediate theme change
- [ ] Persistence works
- [ ] System theme detection works
- [ ] Integration tests pass

---

### T085: Implement Sign Out flow [Integration]

**File**: `app/settings/index.tsx` (already implemented in T081)

**Dependencies**:

- T019 (Phase 2): Token manager with SecureStore
- T023 (Phase 2): Preferences storage
- T025 (Phase 2): AuthContext with logout method

**Sign Out Flow**:

1. User taps "Sign Out" in Settings
2. Confirmation dialog appears
3. User confirms
4. Clear SecureStore (access token, refresh token)
5. Clear AsyncStorage (preferences, cache, profile)
6. Clear AuthContext user state
7. Navigate to login screen
8. Prevent back navigation to Settings

**Implementation** (extends T081):

```typescript
// In app/settings/index.tsx
import { tokenManager } from '../../services/auth/token-manager'
import { preferencesStorage } from '../../services/storage/preferences'
import { cacheStorage } from '../../services/storage/cache'

async function handleSignOut() {
  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Sign Out',
      style: 'destructive',
      onPress: async () => {
        try {
          // 1. Clear tokens from SecureStore
          await tokenManager.clearTokens()

          // 2. Clear preferences from AsyncStorage
          await preferencesStorage.clearPreferences()

          // 3. Clear cache from AsyncStorage
          await cacheStorage.clearAll()

          // 4. Clear auth context (calls backend /logout endpoint)
          await logout()

          // 5. Navigate to login (replace to prevent back navigation)
          router.replace('/login')
        } catch (error) {
          console.error('Sign out failed:', error)
          Alert.alert('Sign Out Failed', 'Failed to sign out. Please try again.', [{ text: 'OK' }])
        }
      },
    },
  ])
}
```

**Token Manager Enhancement** (if needed):

```typescript
// In services/auth/token-manager.ts
export const tokenManager = {
  // ... existing methods ...

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token')
    await SecureStore.deleteItemAsync('refresh_token')
  },
}
```

**Cache Storage** (if not already implemented):

```typescript
// In services/storage/cache.ts
export const cacheStorage = {
  async clearAll(): Promise<void> {
    // Clear all AsyncStorage keys except those we want to keep
    const keys = await AsyncStorage.getAllKeys()
    const keysToRemove = keys.filter(
      (key) => !key.startsWith('app_') // Keep app-level settings if any
    )
    await AsyncStorage.multiRemove(keysToRemove)
  },
}
```

**Testing**:

- Test confirmation dialog appears
- Test cancel doesn't sign out
- Test confirm clears all storage
- Test navigation to login
- Test cannot navigate back after sign out
- Test sign out error handling

**Completion Criteria**:

- [ ] Confirmation dialog works
- [ ] All storage cleared on sign out
- [ ] Navigation works
- [ ] Back navigation prevented
- [ ] Error handling works
- [ ] Integration tests pass

---

### T086: Add Settings access from user menu [Integration]

**File**: `components/layout/Header.tsx`

**Dependencies**:

- T033 (Phase 3): Header component with avatar

**Enhancement**:

- Add tap handler to avatar
- Show user menu action sheet
- Menu options: Settings, Sign Out

**Implementation**:

```typescript
// In components/layout/Header.tsx
import { ActionSheetIOS, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  function showUserMenu() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Settings', 'Sign Out', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            router.push('/settings')
          } else if (buttonIndex === 1) {
            handleSignOut()
          }
        }
      )
    } else {
      // Android: Show custom menu or navigate directly
      Alert.alert(
        'Account',
        '',
        [
          { text: 'Settings', onPress: () => router.push('/settings') },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: handleSignOut
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      )
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/login')
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* ... existing header content ... */}

      <TouchableOpacity onPress={showUserMenu}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  )
}
```

**Testing**:

- Test avatar tap shows menu
- Test Settings navigation
- Test Sign Out from menu
- Test cancel dismisses menu
- Test on both iOS and Android

**Completion Criteria**:

- [ ] Avatar tap shows menu
- [ ] Settings navigation works
- [ ] Sign out works
- [ ] Platform-specific menus work
- [ ] Integration tests pass

---

### T087: Implement "Send Feedback" action [Integration]

**File**: `app/settings/index.tsx` (already implemented in T081)

**Dependencies**: None (uses React Native Linking API)

**Implementation**:

```typescript
import { Linking } from 'react-native'

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform'

async function handleSendFeedback() {
  try {
    const canOpen = await Linking.canOpenURL(FEEDBACK_FORM_URL)
    if (canOpen) {
      await Linking.openURL(FEEDBACK_FORM_URL)
    } else {
      Alert.alert(
        'Cannot Open Link',
        'Unable to open the feedback form. Please try again later.',
        [{ text: 'OK' }]
      )
    }
  } catch (error) {
    console.error('Failed to open feedback form:', error)
    Alert.alert(
      'Error',
      'Failed to open feedback form. Please try again.',
      [{ text: 'OK' }]
    )
  }
}

// In Settings screen JSX:
<SettingsRow
  label="Send Feedback"
  icon="chatbubbles-outline"
  onPress={handleSendFeedback}
/>
```

**Testing**:

- Test link opens in browser
- Test error handling if URL cannot open
- Test on both iOS and Android
- Verify correct Google Form opens

**Completion Criteria**:

- [ ] Link opens correctly
- [ ] Error handling works
- [ ] Works on both platforms
- [ ] Correct form opens
- [ ] Integration tests pass

---

## Testing Strategy

### Unit Tests

**Target Coverage**: 80%+ for all new code

**Test Files**:

- `__tests__/services/api/user.test.ts` - API service tests
- `__tests__/services/storage/preferences.test.ts` - Storage tests
- `__tests__/components/settings/ProfileCard.test.tsx` - Component tests
- `__tests__/components/ui/SettingsRow.test.tsx` - Component tests
- `__tests__/components/ui/Toggle.test.tsx` - Component tests

**Key Scenarios**:

- API success/error responses
- Storage read/write/clear operations
- Component rendering with various props
- Optimistic updates and rollback

### Integration Tests

**Test Files**:

- `__tests__/integration/settings-flow.test.ts` - Full settings flow

**Key Scenarios**:

1. **Settings Navigation Flow**:
   - Open Settings from user menu
   - Navigate to sub-screens
   - Verify back navigation

2. **Notification Preferences Flow**:
   - Load preferences
   - Toggle preference
   - Verify optimistic update
   - Verify backend sync
   - Verify persistence

3. **Theme Change Flow**:
   - Select theme
   - Verify immediate UI update
   - Navigate to other screens
   - Verify theme persists
   - Restart app
   - Verify theme persists

4. **Sign Out Flow**:
   - Tap Sign Out
   - Confirm
   - Verify storage cleared
   - Verify navigation to login
   - Verify cannot navigate back

### E2E Tests (Maestro)

**Test File**: `maestro/settings.yaml`

**Scenarios**:

```yaml
appId: com.acp.mobile
---
# Test Settings Access
- launchApp
- tapOn: 'avatar' # Header avatar
- tapOn: 'Settings'
- assertVisible: 'Push Notifications'
- assertVisible: 'Connected Repositories'
- assertVisible: 'Appearance'

# Test Notification Preferences
- tapOn: 'Push Notifications'
- tapOn: 'Blocking alerts' # Toggle off
- tapOn: 'Back'
- tapOn: 'Push Notifications' # Re-enter
- assertVisible: 'Blocking alerts' # Verify toggle state persisted

# Test Theme Change
- tapOn: 'Appearance'
- tapOn: 'Dark'
- assertVisible: 'Dark theme' # Verify theme applied
- tapOn: 'Back'
# Visual verification needed here

# Test Sign Out
- tapOn: 'Sign Out'
- tapOn: 'Sign Out' # Confirm
- assertVisible: 'Login' # Verify redirected to login
```

## Error Handling

### Network Errors

**Scenario**: API request fails during preference update

**Handling**:

1. Optimistic update already applied to UI
2. Rollback optimistic update on error
3. Show error alert with retry option
4. Log error for debugging

**Code**:

```typescript
catch (error) {
  // Rollback
  setPreferences(prev => ({ ...prev, [key]: !value }))

  // Alert user
  Alert.alert(
    'Update Failed',
    'Failed to save preference. Please try again.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: () => handleToggle(key, value) },
    ]
  )

  // Log
  console.error('Preference update failed:', error)
}
```

### Storage Errors

**Scenario**: AsyncStorage write fails

**Handling**:

1. Log error
2. Continue with in-memory state
3. Attempt to sync on next app launch
4. Show warning to user if critical

### Authentication Errors

**Scenario**: User token expired during settings update

**Handling**:

1. API client interceptor catches 401
2. Attempt token refresh
3. Retry original request
4. If refresh fails, redirect to login

## Performance Considerations

### Optimistic Updates

**Why**: Instant UI feedback improves perceived performance

**Implementation**:

- Update local state immediately
- Save to AsyncStorage in background
- Sync with backend asynchronously
- Rollback on error

**Measurement**: UI should respond <50ms to toggle

### Profile Caching

**Why**: Reduce API calls on Settings screen load

**Implementation**:

- Cache profile in AsyncStorage with 1-hour TTL
- Load from cache first
- Fetch from API in background
- Update cache on success

**Measurement**: Settings screen should load <500ms with cache

### Theme Switching

**Why**: Theme change should be instant

**Implementation**:

- Theme stored in Context (in-memory)
- Context update triggers immediate re-render
- AsyncStorage save happens in background
- No API call needed (local preference)

**Measurement**: Theme switch should complete <100ms

## Accessibility

### Screen Readers

**Requirements**:

- All interactive elements have `accessibilityLabel`
- All toggles have `accessibilityRole="switch"`
- All buttons have `accessibilityRole="button"`
- Profile card has semantic structure

**Implementation**:

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Sign out of your account"
  onPress={handleSignOut}
>
  <Text>Sign Out</Text>
</TouchableOpacity>

<Switch
  accessibilityRole="switch"
  accessibilityLabel="Enable blocking alerts"
  accessibilityState={{ checked: value }}
  value={value}
  onValueChange={onValueChange}
/>
```

### High Contrast

**Requirements**:

- Text contrast ratio ≥4.5:1 for normal text
- Text contrast ratio ≥3:1 for large text
- Focus indicators visible

**Testing**:

- Use iOS Accessibility Inspector
- Use Android Accessibility Scanner

## Security Considerations

### Token Storage

**Critical**: Access tokens and refresh tokens MUST be stored in SecureStore (encrypted), never in AsyncStorage

**Implementation**:

```typescript
// ✅ Correct
await SecureStore.setItemAsync('access_token', token)

// ❌ NEVER do this
await AsyncStorage.setItem('access_token', token)
```

### Sign Out

**Critical**: Sign out MUST clear all sensitive data

**Checklist**:

- [ ] Clear SecureStore tokens
- [ ] Clear AsyncStorage cache
- [ ] Clear AsyncStorage preferences
- [ ] Clear AuthContext state
- [ ] Navigate to login screen
- [ ] Prevent back navigation

### Preference Validation

**Critical**: Validate all user input before sending to backend

**Implementation**:

```typescript
function validateRepoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'github.com'
  } catch {
    return false
  }
}

// In add repo handler:
if (!validateRepoUrl(url)) {
  Alert.alert('Invalid URL', 'Please enter a valid GitHub repository URL')
  return
}
```

## Dependencies on Other Phases

### Phase 2 (Foundation) - REQUIRED

**Must Complete First**:

- T019: Token manager (for sign out)
- T023: Preferences storage (enhanced in T077)
- T024: ThemeContext (used in T084)
- T025: AuthContext with logout (used in T085, T086)

### Phase 7 (Create Sessions) - OPTIONAL

**If Implemented**:

- T065: Repositories API service (reused in T083)

**If NOT Implemented**:

- Must implement repositories API service as part of T083

## Implementation Order

### Recommended Sequence

**Week 1: Data Layer**

1. T076: User preferences API
2. T077: Enhanced preferences storage

**Week 2: UI Components** 3. T078: ProfileCard component 4. T079: SettingsRow component 5. T080: Toggle component

**Week 3: Screens (Part 1)** 6. T081: Settings main screen 7. T082: Push Notifications settings 8. T084: Appearance settings

**Week 4: Screens (Part 2) + Integration** 9. T083: Connected Repositories screen 10. T085: Sign Out flow 11. T086: Settings access from user menu 12. T087: Send Feedback action

### Parallel Opportunities

**Can Work in Parallel**:

- T078, T079, T080 (all UI components, no dependencies on each other)
- T082, T084 (both sub-screens, independent)

**Must Be Sequential**:

- T076 → T077 (storage depends on API types)
- T076, T077 → T081, T082, T083, T084 (screens depend on data layer)
- T078, T079 → T081 (Settings screen uses components)
- T080 → T082 (Notifications screen uses Toggle)

## Success Metrics

### Functional Metrics

- [ ] All 6 acceptance criteria pass
- [ ] All 12 tasks completed
- [ ] Unit test coverage ≥80%
- [ ] Integration tests pass
- [ ] E2E tests pass

### Performance Metrics

- [ ] Settings screen loads <500ms (with cache)
- [ ] Theme switch completes <100ms
- [ ] Toggle response <50ms
- [ ] Profile load <1s (without cache)

### Quality Metrics

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Accessibility audit passes
- [ ] Security audit passes

---

## Appendix A: API Contract Reference

### User Profile Endpoint

```yaml
/user/profile:
  get:
    summary: Get user profile
    responses:
      200:
        description: User profile
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
                name:
                  type: string
                email:
                  type: string
                avatar:
                  type: string
                  nullable: true
                role:
                  type: string
                ssoProvider:
                  type: string
```

### User Preferences Endpoint

```yaml
/user/preferences:
  get:
    summary: Get user preferences
    responses:
      200:
        description: User preferences
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserPreferences'
  put:
    summary: Update user preferences
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UserPreferences'
    responses:
      200:
        description: Updated preferences
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserPreferences'
```

### Schemas

```yaml
components:
  schemas:
    UserPreferences:
      type: object
      properties:
        theme:
          type: string
          enum: [light, dark, system]
        notifications:
          $ref: '#/components/schemas/NotificationPreferences'
        quietHours:
          type: object
          properties:
            enabled:
              type: boolean
            start:
              type: string
              pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'
            end:
              type: string
              pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$'

    NotificationPreferences:
      type: object
      properties:
        blockingAlerts:
          type: boolean
        reviewRequests:
          type: boolean
        sessionUpdates:
          type: boolean
        featuresNews:
          type: boolean
```

---

## Appendix B: TypeScript Type Definitions

### User Types

```typescript
// types/user.ts

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  ssoProvider: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationPreferences
  quietHours: QuietHours
}

export interface NotificationPreferences {
  blockingAlerts: boolean
  reviewRequests: boolean
  sessionUpdates: boolean
  featuresNews: boolean
}

export interface QuietHours {
  enabled: boolean
  start: string // "22:00"
  end: string // "08:00"
}
```

---

## Appendix C: Troubleshooting Guide

### Issue: Preferences not persisting across app restarts

**Symptoms**: Toggle settings, restart app, settings reset to defaults

**Diagnosis**:

1. Check AsyncStorage is being called
2. Verify no errors in console during save
3. Check AsyncStorage keys exist

**Fix**:

```typescript
// Add debug logging
async savePreferences(preferences: UserPreferences): Promise<void> {
  console.log('Saving preferences:', preferences)
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))

  // Verify save
  const saved = await AsyncStorage.getItem(PREFERENCES_KEY)
  console.log('Verified save:', saved)
}
```

### Issue: Theme change not applying immediately

**Symptoms**: Select theme, UI doesn't update until navigation

**Diagnosis**:

1. Check ThemeContext is updating
2. Verify components are consuming ThemeContext
3. Check for cached styles

**Fix**:

```typescript
// Ensure all screens use theme from context
const { theme, colors } = useTheme()

// Use dynamic styles
const styles = useMemo(
  () =>
    StyleSheet.create({
      container: {
        backgroundColor: colors.background,
      },
    }),
  [colors]
)
```

### Issue: Optimistic update not reverting on error

**Symptoms**: Toggle fails but UI stays in new state

**Diagnosis**:

1. Check error catch block
2. Verify setState called in catch
3. Check previous value available

**Fix**:

```typescript
async function handleToggle(key: string, value: boolean) {
  const previousValue = preferences[key]

  // Optimistic update
  setPreferences((prev) => ({ ...prev, [key]: value }))

  try {
    await api.update({ ...preferences, [key]: value })
  } catch (error) {
    // Revert to previous value
    setPreferences((prev) => ({ ...prev, [key]: previousValue }))
    Alert.alert('Update Failed', 'Please try again')
  }
}
```

### Issue: Sign out doesn't clear all data

**Symptoms**: Sign out, login as different user, see old data

**Diagnosis**:

1. Check SecureStore.deleteItemAsync called for both tokens
2. Check AsyncStorage.multiRemove called
3. Verify all cache keys cleared

**Fix**:

```typescript
async function clearAllData() {
  // Clear tokens
  await SecureStore.deleteItemAsync('access_token')
  await SecureStore.deleteItemAsync('refresh_token')

  // Clear all AsyncStorage
  const keys = await AsyncStorage.getAllKeys()
  await AsyncStorage.multiRemove(keys)

  // Verify cleared
  const remaining = await AsyncStorage.getAllKeys()
  console.log('Remaining keys:', remaining) // Should be []
}
```

---

## Quick Start

**Ready to implement? Follow this checklist:**

1. ✅ **Verify dependencies**: Phase 2 complete (T018-T025)
2. ✅ **Create branch**: `git checkout -b feature/phase-8-settings`
3. ✅ **Start with data layer**: Implement T076, T077
4. ✅ **Build UI components**: Implement T078, T079, T080
5. ✅ **Create screens**: Implement T081, T082, T083, T084
6. ✅ **Add integrations**: Implement T085, T086, T087
7. ✅ **Run tests**: `npm test`
8. ✅ **Test manually**: Follow acceptance criteria
9. ✅ **Update tasks.md**: Mark Phase 8 tasks complete
10. ✅ **Create PR**: Reference this plan in description

**Estimated effort**: 4 weeks (1 developer) or 2 weeks (2 developers working in parallel)

**Ready to start?** Begin with T076 (User preferences API) 🚀
