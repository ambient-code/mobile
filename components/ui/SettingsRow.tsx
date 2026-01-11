import React from 'react'
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TOKENS } from '@/utils/constants'

interface SettingsRowProps {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  badge?: string
  onPress?: () => void
  disabled?: boolean
}

export function SettingsRow({ label, icon, badge, onPress, disabled = false }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Left Icon */}
      {icon && (
        <Ionicons
          name={icon}
          size={24}
          color={disabled ? TOKENS.textDisabled : TOKENS.textSecondary}
          style={styles.icon}
        />
      )}

      {/* Label */}
      <Text style={[styles.label, disabled && styles.disabledText]}>{label}</Text>

      {/* Badge */}
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Chevron */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={disabled ? TOKENS.border : TOKENS.textMuted}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: TOKENS.card,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.border,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: TOKENS.textPrimary,
  },
  disabledText: {
    color: TOKENS.textDisabled,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: TOKENS.elevated,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: TOKENS.textSecondary,
  },
})
