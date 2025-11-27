import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Alert, Linking } from 'react-native'
import { router } from 'expo-router'
import { ProfileCard } from '../../components/settings/ProfileCard'
import { SettingsRow } from '../../components/ui/SettingsRow'
import { useAuth } from '../../hooks/useAuth'
import { userApi } from '../../services/api/user'
import { PreferencesService } from '../../services/storage/preferences'
import type { User } from '../../types/user'

const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform'

export default function SettingsScreen() {
  const { user: authUser, logout } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      // Try cache first
      const cached = await PreferencesService.getCachedProfile()
      if (cached) {
        setProfile(cached)
        setLoading(false)
        // Fetch fresh data in background
        fetchAndCacheProfile()
        return
      }

      // No cache - fetch from API
      await fetchAndCacheProfile()
    } catch (error) {
      console.error('Failed to load profile:', error)
      // Fallback to auth user data
      setProfile(authUser)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAndCacheProfile() {
    const data = await userApi.fetchProfile()
    setProfile(data)
    await PreferencesService.cacheProfile(data)
  }

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
      Alert.alert('Error', 'Failed to open feedback form. Please try again.', [
        { text: 'OK' },
      ])
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            // Clear all local storage
            await PreferencesService.clearAll()

            // Call logout (clears auth context and tokens)
            await logout()

            // Navigate to login
            router.replace('/login')
          } catch (error) {
            console.error('Sign out failed:', error)
            Alert.alert(
              'Sign Out Failed',
              'Failed to sign out. Please try again.',
              [{ text: 'OK' }]
            )
          }
        },
      },
    ])
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
        <SettingsRow label="API Keys" icon="key-outline" badge="Soon" disabled />
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
          onPress={handleSendFeedback}
        />
        <SettingsRow label="Sign Out" icon="log-out-outline" onPress={handleSignOut} />
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
