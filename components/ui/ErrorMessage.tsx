import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { IconSymbol } from './icon-symbol'
import { useTheme } from '@/hooks/useTheme'

interface ErrorMessageProps {
  error: Error
  retry?: () => void
  showDetails?: boolean
}

/**
 * ErrorMessage Component
 *
 * Displays error messages with optional retry button and error details.
 * Used throughout the app to provide consistent error UX.
 */
export function ErrorMessage({ error, retry, showDetails = false }: ErrorMessageProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.error} />

      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {error.message || 'An unexpected error occurred'}
      </Text>

      {showDetails && error.stack && (
        <Text style={[styles.details, { color: colors.textSecondary }]}>{error.stack}</Text>
      )}

      {retry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={retry}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.clockwise" size={16} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  details: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
