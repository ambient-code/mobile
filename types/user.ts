export interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  avatar: string | null
  ssoProvider: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationPreferences
  quietHours: QuietHours | null
}

export interface NotificationPreferences {
  blockingAlerts: boolean
  reviewRequests: boolean
  sessionUpdates: boolean
  featuresAndNews: boolean
}

export interface QuietHours {
  enabled: boolean
  start: string // HH:MM format
  end: string // HH:MM format
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: {
    blockingAlerts: true,
    reviewRequests: true,
    sessionUpdates: true,
    featuresAndNews: false,
  },
  quietHours: null,
}
