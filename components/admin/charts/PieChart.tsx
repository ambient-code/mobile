import { View, Text, StyleSheet } from 'react-native'
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts'
import { ChartContainer } from './ChartContainer'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'

interface PieDataPoint {
  value: number
  label: string
  color?: string
}

interface PieChartProps {
  title: string
  data: PieDataPoint[]
  loading?: boolean
  error?: string
  showLegend?: boolean
  donut?: boolean
  centerLabel?: string
}

/**
 * Pie/Donut chart component using react-native-gifted-charts
 * Used for platform distribution, error breakdown (4xx vs 5xx)
 */
export function PieChart({
  title,
  data,
  loading,
  error,
  showLegend = true,
  donut = true,
  centerLabel,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const chartData = data.map((item, index) => {
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
    return {
      value: item.value,
      text: `${percentage}%`,
      color: item.color || getDefaultColor(index),
      label: item.label,
    }
  })

  return (
    <ChartContainer title={title} loading={loading} error={error}>
      <View style={styles.container}>
        <GiftedPieChart
          data={chartData}
          radius={120}
          innerRadius={donut ? 60 : 0}
          donut={donut}
          showText
          textColor="white"
          textSize={14}
          showTextBackground
          textBackgroundRadius={12}
          focusOnPress
          centerLabelComponent={
            centerLabel
              ? () => (
                  <View style={styles.centerLabel}>
                    <Text style={styles.centerLabelText}>{centerLabel}</Text>
                  </View>
                )
              : undefined
          }
        />
        {showLegend && (
          <View style={styles.legend}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>
                  {item.label}: {item.value} ({item.text})
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ChartContainer>
  )
}

function getDefaultColor(index: number): string {
  const colors = [
    ADMIN_METRICS.CHART_COLORS.primary,
    ADMIN_METRICS.CHART_COLORS.success,
    ADMIN_METRICS.CHART_COLORS.warning,
    ADMIN_METRICS.CHART_COLORS.error,
    ADMIN_METRICS.CHART_COLORS.secondary,
    ADMIN_METRICS.CHART_COLORS.tertiary,
  ]
  return colors[index % colors.length]
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#000',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
})
