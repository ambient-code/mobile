import { useWindowDimensions } from 'react-native'
import { ADMIN_METRICS } from '@/constants/AdminMetrics'

/**
 * Hook for responsive chart sizing based on device width
 * Automatically adjusts chart height, font size, and label angles
 * for mobile vs tablet/desktop layouts
 */
export function useResponsiveChart() {
  const { width } = useWindowDimensions()
  const isMobile = width < ADMIN_METRICS.BREAKPOINTS.MOBILE_MAX_WIDTH

  return {
    isMobile,
    fontSize: isMobile ? 10 : 14,
    chartHeight: isMobile
      ? ADMIN_METRICS.CHART_CONFIG.DEFAULT_HEIGHT
      : ADMIN_METRICS.CHART_CONFIG.TABLET_HEIGHT,
    labelAngle: isMobile ? -45 : 0,
    spacing: isMobile ? 30 : ADMIN_METRICS.CHART_CONFIG.SPACING,
  }
}
