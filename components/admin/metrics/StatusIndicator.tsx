import { View, Text, StyleSheet } from 'react-native'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { HealthStatus } from '@/services/analytics/types'

interface StatusIndicatorProps {
  status: HealthStatus
  reasons?: string[]
}

export function StatusIndicator({ status, reasons = [] }: StatusIndicatorProps) {
  const color = ADMIN_METRICS.STATUS_COLORS[status]
  const icon = getStatusIcon(status)
  const displayText = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.text}>{displayText}</Text>
      </View>
      {reasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          {reasons.map((reason, index) => (
            <Text key={index} style={styles.reason}>
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

function getStatusIcon(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return '✓'
    case 'degraded':
      return '⚠'
    case 'down':
      return '✕'
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    color: 'white',
    marginRight: 8,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  reasonsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
})
