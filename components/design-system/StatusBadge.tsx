import { View, Text, StyleSheet } from 'react-native'
import { TOKENS } from '@/utils/constants'

type Status = 'running' | 'done' | 'error' | 'paused' | 'awaiting_review'

const STATUS_COLORS = {
  running: TOKENS.success,    // #22c55e
  done: TOKENS.primary,       // #3b82f6
  error: TOKENS.danger,       // #ef4444
  paused: TOKENS.warning,     // #eab308
  awaiting_review: TOKENS.warning,
}

interface StatusBadgeProps {
  status: Status
  label: string
  size?: 'small' | 'large'
}

export function StatusBadge({ status, label, size = 'small' }: StatusBadgeProps) {
  const color = STATUS_COLORS[status]
  const isLarge = size === 'large'

  return (
    <View style={[
      styles.container,
      isLarge && styles.containerLarge,
      {
        backgroundColor: TOKENS.card,
        shadowColor: color,
        borderColor: color,
      }
    ]}>
      {/* Colored dot with glow */}
      <View style={[
        styles.dot,
        isLarge && styles.dotLarge,
        {
          backgroundColor: color,
          shadowColor: color,
        }
      ]} />

      <Text style={[
        styles.label,
        isLarge && styles.labelLarge,
        { color: TOKENS.textPrimary }
      ]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.radius20,
    borderWidth: 1,
    shadowRadius: 4,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    shadowRadius: 4,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  dotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  label: {
    fontSize: TOKENS.labelSize,
    fontWeight: TOKENS.labelWeight,
  },
  labelLarge: {
    fontSize: TOKENS.bodySize,
    fontWeight: TOKENS.headerWeight,
  },
})
