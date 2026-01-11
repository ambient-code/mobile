import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { IconSymbol } from './icon-symbol'
import { TOKENS } from '@/utils/constants'
import { useTheme } from '@/hooks/useTheme'

/**
 * OfflineBanner Component
 *
 * Displays a banner at the top of screens when the device is offline.
 * Indicates that cached data is being shown.
 */
export function OfflineBanner() {
  const { colors } = useTheme()

  return (
    <View style={[styles.banner, { backgroundColor: TOKENS.danger + '33' }]}>
      <IconSymbol name="wifi.slash" size={16} color={TOKENS.danger} />
      <Text style={[styles.text, { color: TOKENS.textPrimary }]}>Offline - Using cached data</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
})
