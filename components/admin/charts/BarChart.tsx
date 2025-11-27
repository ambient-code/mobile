import { BarChart as GiftedBarChart } from 'react-native-gifted-charts'
import { ChartContainer } from './ChartContainer'
import { useResponsiveChart } from '@/hooks/useResponsiveChart'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'

interface BarDataPoint {
  timestamp: Date
  value: number
  label?: string
}

interface StackedBarDataPoint {
  timestamp: Date
  values: {
    value: number
    color: string
    label: string
  }[]
}

interface BarChartProps {
  title: string
  data: BarDataPoint[] | StackedBarDataPoint[]
  loading?: boolean
  error?: string
  stacked?: boolean
  color?: string
  formatValue?: (value: number) => string
}

/**
 * Bar chart component using react-native-gifted-charts
 * Supports stacked bars for new vs returning users
 */
export function BarChart({
  title,
  data,
  loading,
  error,
  stacked = false,
  color = ADMIN_METRICS.CHART_COLORS.primary,
  formatValue = (v) => v.toString(),
}: BarChartProps) {
  const { chartHeight, fontSize, isMobile, spacing } = useResponsiveChart()

  const chartData = stacked
    ? (data as StackedBarDataPoint[]).map((d) => ({
        label: formatTimestamp(d.timestamp, isMobile),
        stacks: d.values.map((v) => ({
          value: v.value,
          color: v.color,
        })),
        topLabelComponent: () => null,
      }))
    : (data as BarDataPoint[]).map((d) => ({
        value: d.value,
        label: formatTimestamp(d.timestamp, isMobile),
        frontColor: color,
        topLabelComponent: () => null,
      }))

  return (
    <ChartContainer title={title} loading={loading} error={error}>
      <GiftedBarChart
        data={chartData}
        height={chartHeight}
        spacing={spacing}
        barWidth={stacked ? 40 : 30}
        noOfSections={ADMIN_METRICS.CHART_CONFIG.NO_OF_SECTIONS}
        yAxisTextStyle={{ color: '#8E8E93', fontSize }}
        xAxisLabelTextStyle={{ color: '#8E8E93', fontSize: fontSize - 2 }}
        rulesColor="#E5E5EA"
        isAnimated
        animationDuration={ADMIN_METRICS.CHART_CONFIG.ANIMATION_DURATION}
        stackData={
          stacked
            ? (data as StackedBarDataPoint[]).map((d) =>
                d.values.map((v) => ({
                  value: v.value,
                  color: v.color,
                }))
              )
            : undefined
        }
      />
    </ChartContainer>
  )
}

function formatTimestamp(date: Date, isMobile: boolean): string {
  const hours = date.getHours()
  if (isMobile) {
    return `${hours}h`
  } else {
    return `${hours.toString().padStart(2, '0')}:00`
  }
}
