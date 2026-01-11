import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ModelType } from '@/types/session'
import { useTheme } from '@/hooks/useTheme'

interface ModelBadgeProps {
  model: ModelType
  size?: 'small' | 'medium'
}

export function ModelBadge({ model, size = 'small' }: ModelBadgeProps) {
  const { colors } = useTheme()

  const label = model === ModelType.SONNET_4_5 ? 'sonnet-4.5' : 'opus-4.5'
  const description = model === ModelType.SONNET_4_5 ? 'Fast & efficient' : 'Most capable'

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '20' }]}>
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
      {size === 'medium' && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 10,
  },
})
