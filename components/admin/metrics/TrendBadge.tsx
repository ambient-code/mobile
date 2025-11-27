import { View, Text, StyleSheet } from 'react-native'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { TrendIndicator } from '@/services/analytics/types'

interface TrendBadgeProps {
  trend: TrendIndicator
}

/**
 * Badge component showing trend direction (improving/stable/degrading)
 * Used in Golden Signals dashboard for latency trends
 */
export function TrendBadge({ trend }: TrendBadgeProps) {
  const config = getTrendConfig(trend)

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.text}>{config.label}</Text>
    </View>
  )
}

function getTrendConfig(trend: TrendIndicator) {
  switch (trend) {
    case 'improving':
      return {
        icon: '↓',
        label: 'Improving',
        backgroundColor: '#E8F5E9',
        textColor: ADMIN_METRICS.CHART_COLORS.success,
      }
    case 'stable':
      return {
        icon: '→',
        label: 'Stable',
        backgroundColor: '#E3F2FD',
        textColor: ADMIN_METRICS.CHART_COLORS.primary,
      }
    case 'degrading':
      return {
        icon: '↑',
        label: 'Degrading',
        backgroundColor: '#FFEBEE',
        textColor: ADMIN_METRICS.CHART_COLORS.error,
      }
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
})
