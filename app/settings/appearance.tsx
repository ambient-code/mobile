import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'
import { PreferencesService } from '../../services/storage/preferences'

type ThemeOption = 'light' | 'dark' | 'system'

export default function AppearanceSettingsScreen() {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(theme)

  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

  async function handleThemeChange(newTheme: ThemeOption) {
    setSelectedTheme(newTheme)
    setTheme(newTheme)

    // Persist to storage
    await PreferencesService.updateTheme(newTheme)
  }

  return (
    <View style={styles.container}>
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
  value: ThemeOption
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#8b5cf6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
  },
})
