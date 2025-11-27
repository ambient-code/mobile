import { View, Text, StyleSheet } from 'react-native'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  status?: 'success' | 'warning' | 'error'
  subtitle?: string
}

export function MetricCard({ label, value, trend, status, subtitle }: MetricCardProps) {
  const statusColor = status ? getStatusColor(status) : '#666'
  const trendIcon = trend ? getTrendIcon(trend) : null

  return (
    <View style={[styles.card, status && { borderLeftColor: statusColor }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, status && { color: statusColor }]}>{value}</Text>
        {trendIcon && <Text style={styles.trend}>{trendIcon}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

function getStatusColor(status: 'success' | 'warning' | 'error'): string {
  switch (status) {
    case 'success':
      return ADMIN_METRICS.CHART_COLORS.success
    case 'warning':
      return ADMIN_METRICS.CHART_COLORS.warning
    case 'error':
      return ADMIN_METRICS.CHART_COLORS.error
  }
}

function getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    case 'neutral':
      return '→'
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  trend: {
    fontSize: 24,
    marginLeft: 8,
    color: '#8E8E93',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
})
