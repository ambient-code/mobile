import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native'
import { Toggle } from '../../components/ui/Toggle'
import { OfflineBanner } from '../../components/ui/OfflineBanner'
import { useOffline } from '../../hooks/useOffline'
import { userApi } from '../../services/api/user'
import { PreferencesService } from '../../services/storage/preferences'
import type { NotificationPreferences } from '../../types/user'
import { TOKENS } from '../../utils/constants'

export default function NotificationsSettingsScreen() {
  const { isOffline } = useOffline()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    blockingAlerts: true,
    reviewRequests: true,
    sessionUpdates: true,
    featuresAndNews: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    try {
      // Try local storage first
      const localPrefs = await PreferencesService.getPreferences()
      setPreferences(localPrefs.notifications)

      // Fetch from API in background
      const apiPrefs = await userApi.fetchPreferences()
      setPreferences(apiPrefs.notifications)
      await PreferencesService.setPreferences(apiPrefs)
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Continue with local cache
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    // Optimistic update
    const previousValue = preferences[key]
    setPreferences((prev) => ({ ...prev, [key]: value }))

    try {
      // Update local storage immediately
      await PreferencesService.updateNotificationPreference(key, value)

      // Sync with backend
      const fullPrefs = await PreferencesService.getPreferences()
      await userApi.updatePreferences(fullPrefs)
    } catch (error) {
      console.error('Failed to update preference:', error)

      // Revert optimistic update on error
      setPreferences((prev) => ({ ...prev, [key]: previousValue }))

      Alert.alert('Update Failed', 'Failed to save notification preference. Please try again.', [
        { text: 'OK' },
      ])
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Offline Banner */}
      {isOffline && <OfflineBanner />}

      <Text style={styles.description}>
        Choose which notifications you want to receive on your device.
      </Text>

      <View style={styles.section}>
        <Toggle
          label="Blocking alerts"
          description="Sessions awaiting your review that block team progress"
          value={preferences.blockingAlerts}
          onValueChange={(value) => handleToggle('blockingAlerts', value)}
        />
        <Toggle
          label="Review requests"
          description="New review requests from your team members"
          value={preferences.reviewRequests}
          onValueChange={(value) => handleToggle('reviewRequests', value)}
        />
        <Toggle
          label="Session updates"
          description="Completion and error notifications for your sessions"
          value={preferences.sessionUpdates}
          onValueChange={(value) => handleToggle('sessionUpdates', value)}
        />
        <Toggle
          label="Features & news"
          description="Product announcements and new feature releases"
          value={preferences.featuresAndNews}
          onValueChange={(value) => handleToggle('featuresAndNews', value)}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.bg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: TOKENS.textSecondary,
    padding: 16,
  },
  section: {
    backgroundColor: TOKENS.card,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
})
