import { View, Text, StyleSheet } from 'react-native'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'
import type { SaturationDataPoint } from '@/services/analytics/types'

interface SaturationGaugeProps {
  label: string
  data: SaturationDataPoint
}

/**
 * Gauge component for saturation metrics (CPU, Memory, DB Pool)
 * Displays current usage as a progress bar with status-based coloring
 */
export function SaturationGauge({ label, data }: SaturationGaugeProps) {
  const statusColor = ADMIN_METRICS.STATUS_COLORS[data.status]
  const progressWidth = `${Math.min(data.current, 100)}%`

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: statusColor }]}>{data.current.toFixed(1)}%</Text>
      </View>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          {/* @ts-expect-error React Native View width percentage type mismatch */}
          <View style={[styles.barFill, { width: progressWidth, backgroundColor: statusColor }]} />
          {data.threshold < 100 && (
            <View style={[styles.thresholdLine, { left: `${data.threshold}%` }]} />
          )}
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.statusText}>
          Status: <Text style={{ color: statusColor, fontWeight: 'bold' }}>{data.status}</Text>
        </Text>
        <Text style={styles.thresholdText}>Threshold: {data.threshold}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  barContainer: {
    marginBottom: 8,
  },
  barBackground: {
    height: 20,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  thresholdLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#000',
    opacity: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  thresholdText: {
    fontSize: 12,
    color: '#666',
  },
})
