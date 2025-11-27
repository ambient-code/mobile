import { apiClient } from './client'
import type { User, UserPreferences } from '../../types/user'

/**
 * User API service
 * Handles user profile and preferences operations
 */
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
