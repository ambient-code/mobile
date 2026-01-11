import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { useOffline } from '../../hooks/useOffline'
import { OfflineBanner } from '../../components/ui/OfflineBanner'
import { PreferencesService } from '../../services/storage/preferences'
import { TOKENS } from '../../utils/constants'

type ThemeMode = 'light' | 'dark' | 'system'

export default function AppearanceSettingsScreen() {
  const { theme, setThemeMode } = useTheme()
  const { isOffline } = useOffline()
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme)

  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

  async function handleThemeChange(newTheme: ThemeMode) {
    setSelectedTheme(newTheme)
    setThemeMode(newTheme)

    // Persist to storage
    await PreferencesService.updateTheme(newTheme)
  }

  return (
    <View style={styles.container}>
      {/* Offline Banner */}
      {isOffline && <OfflineBanner />}

      <Text style={styles.description}>Choose how ACP Mobile appears on your device.</Text>

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
  value: ThemeMode
  selected: boolean
  onSelect: () => void
}

function ThemeOption({ label, description, selected, onSelect }: ThemeOptionProps) {
  return (
    <TouchableOpacity style={styles.option} onPress={onSelect} activeOpacity={0.7}>
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.border,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TOKENS.textPrimary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: TOKENS.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: TOKENS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: TOKENS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TOKENS.primary,
  },
})
