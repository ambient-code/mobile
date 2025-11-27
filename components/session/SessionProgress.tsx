import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface SessionProgressProps {
  progress: number // 0-100
}

export function SessionProgress({ progress }: SessionProgressProps) {
  const { colors } = useTheme()

  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <View style={[styles.container, { backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: colors.accent,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
})
