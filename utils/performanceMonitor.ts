/**
 * Memory Monitoring Utility
 *
 * Tracks JS heap memory usage and warns when approaching limits.
 * Only active in development mode to avoid production overhead.
 */

export interface MemoryStats {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usagePercentage: number
  timestamp: number
}

export interface MemoryMonitorConfig {
  checkIntervalMs?: number
  warningThreshold?: number
  criticalThreshold?: number
  onWarning?: (stats: MemoryStats) => void
  onCritical?: (stats: MemoryStats) => void
}

class MemoryMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private config: Required<MemoryMonitorConfig>
  private memoryHistory: MemoryStats[] = []
  private readonly maxHistorySize = 100

  constructor(config: MemoryMonitorConfig = {}) {
    this.config = {
      checkIntervalMs: config.checkIntervalMs ?? 10000, // Check every 10 seconds
      warningThreshold: config.warningThreshold ?? 0.75, // Warn at 75%
      criticalThreshold: config.criticalThreshold ?? 0.9, // Critical at 90%
      onWarning: config.onWarning ?? this.defaultWarningHandler,
      onCritical: config.onCritical ?? this.defaultCriticalHandler,
    }
  }

  private defaultWarningHandler = (stats: MemoryStats) => {
    console.warn(
      `⚠️ Memory Usage Warning: ${stats.usagePercentage.toFixed(1)}% (${(stats.usedJSHeapSize / 1048576).toFixed(2)}MB / ${(stats.totalJSHeapSize / 1048576).toFixed(2)}MB)`
    )
  }

  private defaultCriticalHandler = (stats: MemoryStats) => {
    console.error(
      `🔴 Critical Memory Usage: ${stats.usagePercentage.toFixed(1)}% (${(stats.usedJSHeapSize / 1048576).toFixed(2)}MB / ${(stats.totalJSHeapSize / 1048576).toFixed(2)}MB)`
    )
  }

  private getMemoryStats(): MemoryStats | null {
    // @ts-ignore - performance.memory is Chrome-specific but available in React Native
    if (typeof performance !== 'undefined' && performance.memory) {
      // @ts-ignore
      const memory = performance.memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        timestamp: Date.now(),
      }
    }
    return null
  }

  private checkMemory = () => {
    const stats = this.getMemoryStats()
    if (!stats) return

    // Add to history
    this.memoryHistory.push(stats)
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift()
    }

    // Check thresholds
    const usageRatio = stats.usedJSHeapSize / stats.totalJSHeapSize

    if (usageRatio >= this.config.criticalThreshold) {
      this.config.onCritical(stats)
    } else if (usageRatio >= this.config.warningThreshold) {
      this.config.onWarning(stats)
    }
  }

  start() {
    if (__DEV__ && !this.intervalId) {
      console.log('🔍 Memory monitoring started')
      this.intervalId = setInterval(this.checkMemory, this.config.checkIntervalMs)
      // Initial check
      this.checkMemory()
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('🔍 Memory monitoring stopped')
    }
  }

  getHistory(): MemoryStats[] {
    return [...this.memoryHistory]
  }

  getCurrentStats(): MemoryStats | null {
    return this.getMemoryStats()
  }

  /**
   * Detects potential memory leaks by analyzing memory growth trend
   * Returns true if memory is consistently growing without decreasing
   */
  detectMemoryLeak(): boolean {
    if (this.memoryHistory.length < 10) return false

    // Check last 10 samples for consistent growth
    const recentSamples = this.memoryHistory.slice(-10)
    let growthCount = 0

    for (let i = 1; i < recentSamples.length; i++) {
      if (recentSamples[i].usedJSHeapSize > recentSamples[i - 1].usedJSHeapSize) {
        growthCount++
      }
    }

    // If 8+ out of 10 samples show growth, likely a leak
    return growthCount >= 8
  }

  /**
   * Prints a formatted memory report
   */
  printReport() {
    const stats = this.getMemoryStats()
    if (!stats) {
      console.log('Memory stats not available on this platform')
      return
    }

    const usedMB = (stats.usedJSHeapSize / 1048576).toFixed(2)
    const totalMB = (stats.totalJSHeapSize / 1048576).toFixed(2)
    const limitMB = (stats.jsHeapSizeLimit / 1048576).toFixed(2)

    console.log('\n📊 Memory Report')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Used:       ${usedMB} MB`)
    console.log(`Total:      ${totalMB} MB`)
    console.log(`Limit:      ${limitMB} MB`)
    console.log(`Usage:      ${stats.usagePercentage.toFixed(1)}%`)
    console.log(`Samples:    ${this.memoryHistory.length}`)

    if (this.detectMemoryLeak()) {
      console.log('⚠️  Potential memory leak detected!')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
}

// Singleton instance
let monitorInstance: MemoryMonitor | null = null

export const getMemoryMonitor = (config?: MemoryMonitorConfig): MemoryMonitor => {
  if (!monitorInstance) {
    monitorInstance = new MemoryMonitor(config)
  }
  return monitorInstance
}

/**
 * Convenience function to start monitoring with default settings
 */
export const startMemoryMonitoring = (config?: MemoryMonitorConfig) => {
  const monitor = getMemoryMonitor(config)
  monitor.start()
  return monitor
}

/**
 * Hook for React components to access memory stats
 */
export const useMemoryStats = (): MemoryStats | null => {
  const monitor = getMemoryMonitor()
  return monitor.getCurrentStats()
}
