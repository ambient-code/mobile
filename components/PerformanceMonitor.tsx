/**
 * Performance Monitor Dashboard
 *
 * Visual overlay showing real-time performance metrics in development.
 * Toggle with three-finger tap or shake gesture.
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { MemoryStats } from '@/utils/performanceMonitor'
import type { FPSStats } from '@/utils/fpsMonitor'
import type { RenderStats } from '@/utils/renderTracker'

interface PerformanceMetrics {
  memory: MemoryStats | null
  fps: FPSStats | null
  renders: RenderStats[]
}

export function PerformanceMonitor() {
  const { colors } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: null,
    fps: null,
    renders: [],
  })

  useEffect(() => {
    if (!__DEV__ || !isVisible) return

    // Update metrics every second
    const interval = setInterval(() => {
      const { getMemoryMonitor } = require('@/utils/performanceMonitor')
      const { getFPSMonitor } = require('@/utils/fpsMonitor')
      const { getRenderTracker } = require('@/utils/renderTracker')

      setMetrics({
        memory: getMemoryMonitor().getCurrentStats(),
        fps: getFPSMonitor().getStats(),
        renders: getRenderTracker().getAllStats().slice(0, 10),
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!__DEV__ || !isVisible) return null

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1048576
    return `${mb.toFixed(1)}MB`
  }

  const getHealthColor = (value: number, threshold: number) => {
    if (value >= threshold) return '#ef4444' // red
    if (value >= threshold * 0.8) return '#f59e0b' // orange
    return '#10b981' // green
  }

  const memoryUsagePercent = metrics.memory
    ? (metrics.memory.usedJSHeapSize / metrics.memory.totalJSHeapSize) * 100
    : 0

  const fpsHealth = metrics.fps ? (metrics.fps.current >= 50 ? 'good' : 'poor') : 'unknown'

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Performance Monitor</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Memory Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Memory</Text>
          {metrics.memory ? (
            <>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Used:</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatBytes(metrics.memory.usedJSHeapSize)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Total:</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatBytes(metrics.memory.totalJSHeapSize)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Usage:</Text>
                <Text
                  style={[
                    styles.value,
                    { color: getHealthColor(memoryUsagePercent, 90) },
                    styles.bold,
                  ]}
                >
                  {memoryUsagePercent.toFixed(1)}%
                </Text>
              </View>
              {/* Memory bar */}
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${memoryUsagePercent}%`,
                      backgroundColor: getHealthColor(memoryUsagePercent, 90),
                    },
                  ]}
                />
              </View>
            </>
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>
              No memory data available
            </Text>
          )}
        </View>

        {/* FPS Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frame Rate</Text>
          {metrics.fps ? (
            <>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Current:</Text>
                <Text
                  style={[
                    styles.value,
                    { color: fpsHealth === 'good' ? '#10b981' : '#ef4444' },
                    styles.bold,
                  ]}
                >
                  {metrics.fps.current.toFixed(1)} FPS
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Average:</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {metrics.fps.average.toFixed(1)} FPS
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Min / Max:</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {metrics.fps.min.toFixed(0)} / {metrics.fps.max.toFixed(0)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Slow Frames:</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {metrics.fps.slowFrameCount} (
                  {((metrics.fps.slowFrameCount / metrics.fps.totalFrames) * 100).toFixed(1)}
                  %)
                </Text>
              </View>
            </>
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>
              No FPS data available
            </Text>
          )}
        </View>

        {/* Render Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Rendered Components</Text>
          {metrics.renders.length > 0 ? (
            metrics.renders.map((stat, index) => (
              <View key={stat.componentName} style={styles.renderRow}>
                <Text style={[styles.renderIndex, { color: colors.textSecondary }]}>
                  {index + 1}.
                </Text>
                <View style={styles.renderInfo}>
                  <Text style={[styles.componentName, { color: colors.text }]} numberOfLines={1}>
                    {stat.componentName}
                  </Text>
                  <Text style={[styles.renderCount, { color: colors.textSecondary }]}>
                    {stat.renderCount} renders
                    {stat.averageRenderTime > 0 && ` • ${stat.averageRenderTime.toFixed(1)}ms avg`}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>
              No render data collected
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (typeof global !== 'undefined' && (global as any).performance?.report) {
                ;(global as any).performance.report()
              }
            }}
          >
            <Text style={styles.buttonText}>Print Full Report to Console</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, marginTop: 8 }]}
            onPress={() => {
              const { getRenderTracker } = require('@/utils/renderTracker')
              const { getMemoryMonitor } = require('@/utils/performanceMonitor')
              const { getFPSMonitor } = require('@/utils/fpsMonitor')

              getRenderTracker().reset()
              getFPSMonitor().reset()
              console.log('🔄 Performance metrics reset')
            }}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Reset Metrics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toggle button - always visible in dev */}
      {!isVisible && (
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.accent }]}
          onPress={() => setIsVisible(true)}
        >
          <Text style={styles.floatingButtonText}>📊</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

/**
 * Floating toggle button for performance monitor
 */
export function PerformanceToggle() {
  const [isVisible, setIsVisible] = useState(false)
  const { colors } = useTheme()

  if (!__DEV__) return null

  return (
    <>
      {isVisible && <PerformanceMonitor />}
      {!isVisible && (
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.accent }]}
          onPress={() => setIsVisible(true)}
        >
          <Text style={styles.floatingButtonText}>📊</Text>
        </TouchableOpacity>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 9999,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  bold: {
    fontWeight: '700',
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  renderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  renderIndex: {
    fontSize: 12,
    marginRight: 8,
    minWidth: 20,
  },
  renderInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 13,
    fontWeight: '500',
  },
  renderCount: {
    fontSize: 11,
    marginTop: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10000,
  },
  floatingButtonText: {
    fontSize: 24,
  },
})
