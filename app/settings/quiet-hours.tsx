import React, { useEffect, useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Toggle } from '../../components/ui/Toggle'
import { userApi } from '../../services/api/user'
import { PreferencesService } from '../../services/storage/preferences'
import type { QuietHours } from '../../types/user'

export default function QuietHoursSettingsScreen() {
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    start: '22:00',
    end: '08:00',
  })
  const [loading, setLoading] = useState(true)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  async function loadPreferences() {
    try {
      // Try local storage first
      const localPrefs = await PreferencesService.getPreferences()
      if (localPrefs.quietHours) {
        setQuietHours(localPrefs.quietHours)
      }

      // Fetch from API in background
      const apiPrefs = await userApi.fetchPreferences()
      if (apiPrefs.quietHours) {
        setQuietHours(apiPrefs.quietHours)
        await PreferencesService.setPreferences(apiPrefs)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      // Continue with local cache
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(value: boolean) {
    // Optimistic update
    const previousValue = quietHours.enabled
    setQuietHours((prev) => ({ ...prev, enabled: value }))

    try {
      // Update local storage immediately
      await PreferencesService.updateQuietHours({ ...quietHours, enabled: value })

      // Sync with backend
      const fullPrefs = await PreferencesService.getPreferences()
      await userApi.updatePreferences(fullPrefs)
    } catch (error) {
      console.error('Failed to update quiet hours:', error)

      // Revert optimistic update on error
      setQuietHours((prev) => ({ ...prev, enabled: previousValue }))

      Alert.alert('Update Failed', 'Failed to save quiet hours setting. Please try again.', [
        { text: 'OK' },
      ])
    }
  }

  async function handleTimeChange(type: 'start' | 'end', time: string) {
    const updated = { ...quietHours, [type]: time }
    setQuietHours(updated)

    try {
      // Update local storage immediately
      await PreferencesService.updateQuietHours(updated)

      // Sync with backend
      const fullPrefs = await PreferencesService.getPreferences()
      await userApi.updatePreferences(fullPrefs)
    } catch (error) {
      console.error('Failed to update quiet hours time:', error)

      Alert.alert('Update Failed', 'Failed to save quiet hours time. Please try again.', [
        { text: 'OK' },
      ])
    }
  }

  function parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  function onStartTimeChange(_event: unknown, selectedDate?: Date) {
    setShowStartPicker(Platform.OS === 'ios')
    if (selectedDate) {
      const timeStr = formatTime(selectedDate)
      handleTimeChange('start', timeStr)
    }
  }

  function onEndTimeChange(_event: unknown, selectedDate?: Date) {
    setShowEndPicker(Platform.OS === 'ios')
    if (selectedDate) {
      const timeStr = formatTime(selectedDate)
      handleTimeChange('end', timeStr)
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
      <Text style={styles.description}>
        Set quiet hours to pause notifications during specific times. You&apos;ll still receive
        notifications for blocking alerts.
      </Text>

      <View style={styles.section}>
        <Toggle
          label="Enable Quiet Hours"
          description="Silence notifications during the selected time range"
          value={quietHours.enabled}
          onValueChange={handleToggle}
        />
      </View>

      {quietHours.enabled && (
        <View style={styles.section}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.timeText}>{quietHours.start}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>End Time</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.timeText}>{quietHours.end}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showStartPicker && (
        <DateTimePicker
          value={parseTime(quietHours.start)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartTimeChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={parseTime(quietHours.end)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndTimeChange}
        />
      )}

      {quietHours.enabled && (
        <View style={styles.info}>
          <Text style={styles.infoText}>
            Notifications will be silenced from {quietHours.start} to {quietHours.end} every day.
          </Text>
          <Text style={styles.infoText}>
            Blocking alerts that require immediate attention will still be shown.
          </Text>
        </View>
      )}
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  timeButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  info: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b21a8',
    marginBottom: 4,
  },
})
