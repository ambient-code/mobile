/**
 * FPS (Frames Per Second) Monitoring Utility
 *
 * Tracks frame rendering performance to detect UI jank and slow frames.
 * Target is 60 FPS (16.67ms per frame) for smooth user experience.
 */

export interface FPSStats {
  current: number
  average: number
  min: number
  max: number
  slowFrameCount: number
  totalFrames: number
  timestamp: number
}

export interface FPSMonitorConfig {
  targetFPS?: number
  slowFrameThreshold?: number
  sampleSize?: number
  onSlowFrame?: (fps: number, frameTime: number) => void
  onFPSDrop?: (stats: FPSStats) => void
}

class FPSMonitor {
  private isRunning = false
  private frameId: number | null = null
  private config: Required<FPSMonitorConfig>

  private lastFrameTime = 0
  private frameCount = 0
  private fpsHistory: number[] = []
  private slowFrameCount = 0
  private minFPS = Infinity
  private maxFPS = 0

  private lastReportTime = 0
  private readonly reportInterval = 1000 // Report every second

  constructor(config: FPSMonitorConfig = {}) {
    this.config = {
      targetFPS: config.targetFPS ?? 60,
      slowFrameThreshold: config.slowFrameThreshold ?? 45, // Below 45 FPS is considered slow
      sampleSize: config.sampleSize ?? 60, // Keep 60 samples for averaging
      onSlowFrame: config.onSlowFrame ?? this.defaultSlowFrameHandler,
      onFPSDrop: config.onFPSDrop ?? this.defaultFPSDropHandler,
    }
  }

  private defaultSlowFrameHandler = (fps: number, frameTime: number) => {
    console.warn(`🐌 Slow frame detected: ${fps.toFixed(1)} FPS (${frameTime.toFixed(2)}ms)`)
  }

  private defaultFPSDropHandler = (stats: FPSStats) => {
    console.warn(
      `📉 FPS drop: Current ${stats.current.toFixed(1)} FPS, Average ${stats.average.toFixed(1)} FPS`
    )
  }

  private measureFrame = (currentTime: number) => {
    if (!this.isRunning) return

    if (this.lastFrameTime > 0) {
      const delta = currentTime - this.lastFrameTime
      const fps = 1000 / delta

      // Update stats
      this.frameCount++
      this.fpsHistory.push(fps)

      // Keep history size manageable
      if (this.fpsHistory.length > this.config.sampleSize) {
        this.fpsHistory.shift()
      }

      // Track min/max
      this.minFPS = Math.min(this.minFPS, fps)
      this.maxFPS = Math.max(this.maxFPS, fps)

      // Detect slow frames
      if (fps < this.config.slowFrameThreshold) {
        this.slowFrameCount++
        this.config.onSlowFrame(fps, delta)
      }

      // Periodic reporting
      if (currentTime - this.lastReportTime >= this.reportInterval) {
        const stats = this.getStats()
        if (stats && stats.current < this.config.slowFrameThreshold) {
          this.config.onFPSDrop(stats)
        }
        this.lastReportTime = currentTime
      }
    }

    this.lastFrameTime = currentTime
    this.frameId = requestAnimationFrame(this.measureFrame)
  }

  start() {
    if (__DEV__ && !this.isRunning) {
      console.log('🎬 FPS monitoring started')
      this.isRunning = true
      this.lastFrameTime = 0
      this.lastReportTime = performance.now()
      this.frameId = requestAnimationFrame(this.measureFrame)
    }
  }

  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
      this.isRunning = false
      console.log('🎬 FPS monitoring stopped')
    }
  }

  reset() {
    this.frameCount = 0
    this.fpsHistory = []
    this.slowFrameCount = 0
    this.minFPS = Infinity
    this.maxFPS = 0
    this.lastFrameTime = 0
  }

  getStats(): FPSStats | null {
    if (this.fpsHistory.length === 0) return null

    const current = this.fpsHistory[this.fpsHistory.length - 1]
    const average = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length

    return {
      current,
      average,
      min: this.minFPS === Infinity ? 0 : this.minFPS,
      max: this.maxFPS,
      slowFrameCount: this.slowFrameCount,
      totalFrames: this.frameCount,
      timestamp: Date.now(),
    }
  }

  /**
   * Calculate percentage of slow frames
   */
  getSlowFramePercentage(): number {
    if (this.frameCount === 0) return 0
    return (this.slowFrameCount / this.frameCount) * 100
  }

  /**
   * Determine if performance is acceptable
   */
  isPerformanceGood(): boolean {
    const stats = this.getStats()
    if (!stats) return true

    // Good performance: average FPS above threshold and < 5% slow frames
    return stats.average >= this.config.slowFrameThreshold && this.getSlowFramePercentage() < 5
  }

  /**
   * Print formatted FPS report
   */
  printReport() {
    const stats = this.getStats()
    if (!stats) {
      console.log('No FPS data collected yet')
      return
    }

    const slowFramePercent = this.getSlowFramePercentage()
    const performance = this.isPerformanceGood() ? '✅ Good' : '⚠️  Poor'

    console.log('\n📊 FPS Report')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Current:       ${stats.current.toFixed(1)} FPS`)
    console.log(`Average:       ${stats.average.toFixed(1)} FPS`)
    console.log(`Min:           ${stats.min.toFixed(1)} FPS`)
    console.log(`Max:           ${stats.max.toFixed(1)} FPS`)
    console.log(`Total Frames:  ${stats.totalFrames}`)
    console.log(`Slow Frames:   ${stats.slowFrameCount} (${slowFramePercent.toFixed(1)}%)`)
    console.log(`Performance:   ${performance}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
}

// Singleton instance
let monitorInstance: FPSMonitor | null = null

export const getFPSMonitor = (config?: FPSMonitorConfig): FPSMonitor => {
  if (!monitorInstance) {
    monitorInstance = new FPSMonitor(config)
  }
  return monitorInstance
}

/**
 * Convenience function to start FPS monitoring with default settings
 */
export const startFPSMonitoring = (config?: FPSMonitorConfig) => {
  const monitor = getFPSMonitor(config)
  monitor.start()
  return monitor
}

/**
 * React hook to access current FPS stats
 */
export const useFPSStats = (): FPSStats | null => {
  const monitor = getFPSMonitor()
  return monitor.getStats()
}
