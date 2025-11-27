import { LineChart as GiftedLineChart } from 'react-native-gifted-charts'
import { ChartContainer } from './ChartContainer'
import { useResponsiveChart } from '@/hooks/useResponsiveChart'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'

interface DataPoint {
  timestamp: Date
  value: number
}

interface LineChartProps {
  title: string
  data: DataPoint[]
  loading?: boolean
  error?: string
  color?: string
  yAxisLabel?: string
  formatValue?: (value: number) => string
}

/**
 * Line chart component using react-native-gifted-charts
 * Used for time-series data like latency, traffic, and DAU trends
 */
export function LineChart({
  title,
  data,
  loading,
  error,
  color = ADMIN_METRICS.CHART_COLORS.primary,
  yAxisLabel = '',
  formatValue = (v) => v.toString(),
}: LineChartProps) {
  const { chartHeight, fontSize, isMobile } = useResponsiveChart()

  const chartData = data.map((d) => ({
    value: d.value,
    label: formatTimestamp(d.timestamp, isMobile),
    dataPointText: formatValue(d.value),
  }))

  return (
    <ChartContainer title={title} loading={loading} error={error}>
      <GiftedLineChart
        data={chartData}
        height={chartHeight}
        color={color}
        thickness={ADMIN_METRICS.CHART_CONFIG.LINE_THICKNESS}
        curved
        animateOnDataChange
        animationDuration={ADMIN_METRICS.CHART_CONFIG.ANIMATION_DURATION}
        spacing={ADMIN_METRICS.CHART_CONFIG.SPACING}
        initialSpacing={ADMIN_METRICS.CHART_CONFIG.INITIAL_SPACING}
        noOfSections={ADMIN_METRICS.CHART_CONFIG.NO_OF_SECTIONS}
        yAxisTextStyle={{ color: '#8E8E93', fontSize }}
        xAxisLabelTextStyle={{ color: '#8E8E93', fontSize: fontSize - 2 }}
        rulesColor="#E5E5EA"
        dataPointsColor={color}
        dataPointsRadius={3}
        showValuesAsDataPointsText
        textColor1={color}
        textFontSize={fontSize - 2}
        yAxisLabelPrefix={yAxisLabel}
      />
    </ChartContainer>
  )
}

function formatTimestamp(date: Date, isMobile: boolean): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  if (isMobile) {
    // Shorter format for mobile
    return timeStr
  } else {
    // Include day for larger screens if useful
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day} ${timeStr}`
  }
}
