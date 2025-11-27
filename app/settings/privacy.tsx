import React, { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native'
import { getTelemetryEnabled, setTelemetryEnabled } from '@/services/telemetry'

export default function PrivacySettingsScreen() {
  const [telemetryEnabled, setTelemetryEnabledState] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Load current preference on mount
  useEffect(() => {
    loadPreference()
  }, [])

  async function loadPreference() {
    try {
      const enabled = await getTelemetryEnabled()
      setTelemetryEnabledState(enabled)
    } catch (error) {
      console.error('Failed to load telemetry preference:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggle(value: boolean) {
    setTelemetryEnabledState(value)
    try {
      await setTelemetryEnabled(value)
    } catch (error) {
      console.error('Failed to save telemetry preference:', error)
      // Revert on error
      setTelemetryEnabledState(!value)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.description}>
        Manage your privacy settings and control what data is shared.
      </Text>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Share Usage Analytics</Text>
            <Text style={styles.settingDescription}>
              Help us improve ACP Mobile by sharing anonymous usage data
            </Text>
          </View>
          <Switch
            value={telemetryEnabled}
            onValueChange={handleToggle}
            disabled={isLoading}
            trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
            thumbColor={telemetryEnabled ? '#8b5cf6' : '#f4f3f4'}
            ios_backgroundColor="#d1d5db"
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What data is collected?</Text>
        <Text style={styles.infoText}>When analytics are enabled, we collect:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletPoint}>
            • App usage patterns (screens viewed, features used)
          </Text>
          <Text style={styles.bulletPoint}>• Performance metrics (app crashes, errors)</Text>
          <Text style={styles.bulletPoint}>• Device information (OS version, model)</Text>
        </View>

        <Text style={styles.infoText}>We never collect:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletPoint}>• Your code or repository content</Text>
          <Text style={styles.bulletPoint}>• Personal messages or chat conversations</Text>
          <Text style={styles.bulletPoint}>• Passwords or authentication tokens</Text>
        </View>

        <Text style={styles.noteText}>
          Note: Analytics are automatically disabled in development mode.
        </Text>
      </View>
    </ScrollView>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  infoSection: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 16,
  },
})
