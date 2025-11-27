import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  NotificationPreferences,
  User,
} from '@/types/user'
import { Repository } from '@/types/api'

const KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CONNECTED_REPOS: 'connected_repos',
  USER_PROFILE: 'user_profile',
}

const PROFILE_TTL = 60 * 60 * 1000 // 1 hour

export class PreferencesService {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const stored = await AsyncStorage.getItem(KEYS.USER_PREFERENCES)
      if (!stored) return DEFAULT_PREFERENCES

      return JSON.parse(stored)
    } catch (error) {
      console.error('Error getting preferences:', error)
      return DEFAULT_PREFERENCES
    }
  }

  static async setPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error setting preferences:', error)
    }
  }

  static async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences()
    const updated = { ...current, ...updates }
    await this.setPreferences(updated)
    return updated
  }

  static async getConnectedRepos(): Promise<Repository[]> {
    try {
      const stored = await AsyncStorage.getItem(KEYS.CONNECTED_REPOS)
      if (!stored) return []

      return JSON.parse(stored)
    } catch (error) {
      console.error('Error getting connected repos:', error)
      return []
    }
  }

  static async setConnectedRepos(repos: Repository[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CONNECTED_REPOS, JSON.stringify(repos))
    } catch (error) {
      console.error('Error setting connected repos:', error)
    }
  }

  static async addConnectedRepo(repo: Repository): Promise<void> {
    const repos = await this.getConnectedRepos()
    const updated = [...repos.filter((r) => r.id !== repo.id), repo]
    await this.setConnectedRepos(updated)
  }

  static async removeConnectedRepo(repoId: string): Promise<void> {
    const repos = await this.getConnectedRepos()
    const updated = repos.filter((r) => r.id !== repoId)
    await this.setConnectedRepos(updated)
  }

  /**
   * Update specific notification preference
   * Optimistic update - saves locally immediately
   */
  static async updateNotificationPreference(
    key: keyof NotificationPreferences,
    value: boolean
  ): Promise<void> {
    const prefs = await this.getPreferences()
    prefs.notifications[key] = value
    await this.setPreferences(prefs)
  }

  /**
   * Update theme preference
   * Optimistic update - saves locally immediately
   */
  static async updateTheme(
    theme: 'light' | 'dark' | 'system'
  ): Promise<void> {
    const prefs = await this.getPreferences()
    prefs.theme = theme
    await this.setPreferences(prefs)
  }

  /**
   * Cache user profile with TTL
   */
  static async cacheProfile(profile: User): Promise<void> {
    try {
      const data = {
        profile,
        timestamp: Date.now(),
      }
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching profile:', error)
    }
  }

  /**
   * Get cached profile if not expired
   * Returns null if cache is expired or doesn't exist
   */
  static async getCachedProfile(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE)
      if (!data) return null

      const { profile, timestamp } = JSON.parse(data)
      const age = Date.now() - timestamp

      if (age > PROFILE_TTL) {
        // Expired - clear cache
        await AsyncStorage.removeItem(KEYS.USER_PROFILE)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error getting cached profile:', error)
      return null
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.USER_PREFERENCES,
        KEYS.CONNECTED_REPOS,
        KEYS.USER_PROFILE,
      ])
    } catch (error) {
      console.error('Error clearing preferences:', error)
    }
  }
}
