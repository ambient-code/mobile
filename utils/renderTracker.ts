/**
 * React Render Tracking Utility
 *
 * Tracks component render counts and identifies unnecessary re-renders.
 * Integrates with why-did-you-render for detailed analysis in development.
 */

import { useEffect, useRef } from 'react'

export interface RenderStats {
  componentName: string
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  totalRenderTime: number
}

class RenderTracker {
  private renderCounts = new Map<string, number>()
  private renderTimes = new Map<string, number[]>()
  private isEnabled = __DEV__

  /**
   * Track a component render
   */
  trackRender(componentName: string, renderTime?: number) {
    if (!this.isEnabled) return

    // Increment render count
    const currentCount = this.renderCounts.get(componentName) || 0
    this.renderCounts.set(componentName, currentCount + 1)

    // Track render time if provided
    if (renderTime !== undefined) {
      const times = this.renderTimes.get(componentName) || []
      times.push(renderTime)
      this.renderTimes.set(componentName, times)
    }
  }

  /**
   * Get stats for a specific component
   */
  getComponentStats(componentName: string): RenderStats | null {
    const renderCount = this.renderCounts.get(componentName)
    if (!renderCount) return null

    const times = this.renderTimes.get(componentName) || []
    const totalRenderTime = times.reduce((sum, time) => sum + time, 0)
    const averageRenderTime = times.length > 0 ? totalRenderTime / times.length : 0

    return {
      componentName,
      renderCount,
      lastRenderTime: times[times.length - 1] || 0,
      averageRenderTime,
      totalRenderTime,
    }
  }

  /**
   * Get all tracked components
   */
  getAllStats(): RenderStats[] {
    const stats: RenderStats[] = []
    for (const componentName of this.renderCounts.keys()) {
      const componentStats = this.getComponentStats(componentName)
      if (componentStats) {
        stats.push(componentStats)
      }
    }
    return stats.sort((a, b) => b.renderCount - a.renderCount)
  }

  /**
   * Find components with excessive renders
   */
  getExcessiveRenders(threshold = 10): RenderStats[] {
    return this.getAllStats().filter((stats) => stats.renderCount > threshold)
  }

  /**
   * Find slow rendering components
   */
  getSlowComponents(thresholdMs = 16): RenderStats[] {
    return this.getAllStats().filter((stats) => stats.averageRenderTime > thresholdMs)
  }

  /**
   * Reset all tracking data
   */
  reset() {
    this.renderCounts.clear()
    this.renderTimes.clear()
  }

  /**
   * Reset tracking for a specific component
   */
  resetComponent(componentName: string) {
    this.renderCounts.delete(componentName)
    this.renderTimes.delete(componentName)
  }

  /**
   * Print formatted report
   */
  printReport() {
    if (!this.isEnabled) {
      console.log('Render tracking is disabled in production')
      return
    }

    const stats = this.getAllStats()
    if (stats.length === 0) {
      console.log('No render data collected yet')
      return
    }

    console.log('\n📊 React Render Report')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Top 10 most rendered components
    console.log('\n🔄 Most Rendered Components:')
    stats.slice(0, 10).forEach((stat, index) => {
      console.log(
        `${index + 1}. ${stat.componentName}: ${stat.renderCount} renders ` +
          `(avg: ${stat.averageRenderTime.toFixed(2)}ms)`
      )
    })

    // Excessive renders warning
    const excessive = this.getExcessiveRenders(50)
    if (excessive.length > 0) {
      console.log('\n⚠️  Components with Excessive Renders (>50):')
      excessive.forEach((stat) => {
        console.log(`   ${stat.componentName}: ${stat.renderCount} renders`)
      })
    }

    // Slow components warning
    const slow = this.getSlowComponents(16)
    if (slow.length > 0) {
      console.log('\n🐌 Slow Rendering Components (>16ms):')
      slow.forEach((stat) => {
        console.log(`   ${stat.componentName}: ${stat.averageRenderTime.toFixed(2)}ms average`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }
}

// Singleton instance
let trackerInstance: RenderTracker | null = null

export const getRenderTracker = (): RenderTracker => {
  if (!trackerInstance) {
    trackerInstance = new RenderTracker()
  }
  return trackerInstance
}

/**
 * React hook to track component renders
 * Usage: useRenderTracker('MyComponent')
 */
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0)
  const startTime = useRef(0)

  // Track render start
  startTime.current = performance.now()

  useEffect(() => {
    // Track render completion
    const renderTime = performance.now() - startTime.current
    renderCount.current++

    const tracker = getRenderTracker()
    tracker.trackRender(componentName, renderTime)

    if (__DEV__ && renderCount.current > 100) {
      console.warn(
        `⚠️  ${componentName} has rendered ${renderCount.current} times - possible performance issue`
      )
    }
  })

  return {
    renderCount: renderCount.current,
    getStats: () => getRenderTracker().getComponentStats(componentName),
  }
}

/**
 * Hook to detect unnecessary re-renders by comparing props
 * Usage: useWhyDidYouUpdate('MyComponent', props)
 */
export const useWhyDidYouUpdate = (componentName: string, props: Record<string, any>) => {
  const previousProps = useRef<Record<string, any> | undefined>(undefined)

  useEffect(() => {
    if (previousProps.current && __DEV__) {
      const allKeys = Object.keys({ ...previousProps.current, ...props })
      const changedProps: Record<string, { from: any; to: any }> = {}

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key],
          }
        }
      })

      if (Object.keys(changedProps).length > 0) {
        console.log(`[${componentName}] Props changed:`, changedProps)
      } else {
        console.warn(`[${componentName}] Re-rendered with same props (unnecessary re-render)`)
      }
    }

    previousProps.current = props
  })
}

/**
 * Initialize why-did-you-render in development
 */
export const initializeWhyDidYouRender = () => {
  if (__DEV__) {
    try {
      const React = require('react')
      const whyDidYouRender = require('@welldone-software/why-did-you-render')

      whyDidYouRender(React, {
        trackAllPureComponents: false, // Only track components you explicitly mark
        trackHooks: true,
        trackExtraHooks: [[require('react-redux/lib'), 'useSelector']],
        logOnDifferentValues: true,
        collapseGroups: true,
        // Notify on console for unnecessary re-renders
        notifier: (notifier: any) => {
          // Custom notifier to integrate with our render tracker
          console.log('🔍 Why-Did-You-Render:', notifier)
        },
      })

      console.log('✅ why-did-you-render initialized')
    } catch (error) {
      console.warn('⚠️  Could not initialize why-did-you-render:', error)
    }
  }
}

/**
 * Decorator to enable tracking for a component
 * Usage: Component.whyDidYouRender = true
 */
export const enableRenderTracking = (Component: React.ComponentType<any>, displayName?: string) => {
  if (__DEV__) {
    ;(Component as any).whyDidYouRender = true
    if (displayName) {
      Component.displayName = displayName
    }
  }
  return Component
}
