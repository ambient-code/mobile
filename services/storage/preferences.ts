import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/user'
import { Repository } from '@/types/api'

const KEYS = {
  USER_PREFERENCES: 'user_preferences',
  CONNECTED_REPOS: 'connected_repos',
}

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

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEYS.USER_PREFERENCES, KEYS.CONNECTED_REPOS])
    } catch (error) {
      console.error('Error clearing preferences:', error)
    }
  }
}
