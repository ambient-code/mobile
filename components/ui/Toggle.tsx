import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'

interface ToggleProps {
  label: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export function Toggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
        thumbColor={value ? '#8b5cf6' : '#f3f4f6'}
        ios_backgroundColor="#d1d5db"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
  },
})
