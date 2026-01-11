import React, { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native'
import { getTelemetryEnabled, setTelemetryEnabled } from '@/services/telemetry'
import { TOKENS } from '@/utils/constants'

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
            trackColor={{ false: TOKENS.border, true: TOKENS.primary }}
            thumbColor={telemetryEnabled ? '#fff' : '#f4f3f4'}
            ios_backgroundColor={TOKENS.border}
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What data is collected?</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletPoint}>• Anonymous usage patterns and performance metrics</Text>
          <Text style={styles.bulletPoint}>
            • We never collect your code, messages, or credentials
          </Text>
          <Text style={styles.bulletPoint}>
            • All data is anonymized and used only for improvements
          </Text>
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
    backgroundColor: TOKENS.bg,
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
    color: TOKENS.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: TOKENS.textSecondary,
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
    color: TOKENS.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: TOKENS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: TOKENS.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: TOKENS.textMuted,
    fontStyle: 'italic',
    marginTop: 16,
  },
})
