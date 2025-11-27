/**
 * Deep Link Analytics
 *
 * Tracks deep link navigation events for monitoring and debugging.
 * Integrates with existing performance monitoring infrastructure.
 */

import type { ParsedDeepLink } from './deepLinking'

export interface DeepLinkEvent {
  timestamp: number
  url: string
  path: string
  handler: string | null
  isValid: boolean
  errorMessage?: string
  navigationTime?: number
  source: 'initial' | 'foreground' | 'background'
  queryParams: Record<string, string>
}

class DeepLinkAnalytics {
  private events: DeepLinkEvent[] = []
  private maxEvents = 100 // Keep last 100 events

  /**
   * Track a deep link navigation attempt
   */
  trackNavigation(
    url: string,
    parsedLink: ParsedDeepLink,
    handler: string | null,
    source: 'initial' | 'foreground' | 'background',
    navigationTime?: number
  ): void {
    const event: DeepLinkEvent = {
      timestamp: Date.now(),
      url,
      path: parsedLink.path,
      handler,
      isValid: parsedLink.isValid,
      errorMessage: parsedLink.errorMessage,
      navigationTime,
      source,
      queryParams: parsedLink.queryParams,
    }

    this.events.push(event)

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // Log in development
    if (__DEV__) {
      this.logEvent(event)
    }

    // TODO: Send to analytics service in production
  }

  /**
   * Track a deep link validation failure
   */
  trackValidationFailure(
    url: string,
    errorMessage: string,
    source: 'initial' | 'foreground' | 'background'
  ): void {
    const event: DeepLinkEvent = {
      timestamp: Date.now(),
      url,
      path: '',
      handler: null,
      isValid: false,
      errorMessage,
      source,
      queryParams: {},
    }

    this.events.push(event)

    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    if (__DEV__) {
      console.warn('[DeepLink] Validation failure:', errorMessage, url)
    }
  }

  /**
   * Get all tracked events
   */
  getEvents(): DeepLinkEvent[] {
    return [...this.events]
  }

  /**
   * Get events filtered by validity
   */
  getValidEvents(): DeepLinkEvent[] {
    return this.events.filter((e) => e.isValid)
  }

  /**
   * Get failed navigation attempts
   */
  getFailedEvents(): DeepLinkEvent[] {
    return this.events.filter((e) => !e.isValid)
  }

  /**
   * Get average navigation time
   */
  getAverageNavigationTime(): number {
    const eventsWithTime = this.events.filter((e) => e.navigationTime !== undefined)
    if (eventsWithTime.length === 0) return 0

    const sum = eventsWithTime.reduce((acc, e) => acc + (e.navigationTime || 0), 0)
    return sum / eventsWithTime.length
  }

  /**
   * Get statistics summary
   */
  getStats(): {
    total: number
    valid: number
    invalid: number
    averageNavigationTime: number
    byHandler: Record<string, number>
    bySource: Record<string, number>
  } {
    const byHandler: Record<string, number> = {}
    const bySource: Record<string, number> = {}

    this.events.forEach((event) => {
      // Count by handler
      if (event.handler) {
        byHandler[event.handler] = (byHandler[event.handler] || 0) + 1
      }

      // Count by source
      bySource[event.source] = (bySource[event.source] || 0) + 1
    })

    return {
      total: this.events.length,
      valid: this.getValidEvents().length,
      invalid: this.getFailedEvents().length,
      averageNavigationTime: this.getAverageNavigationTime(),
      byHandler,
      bySource,
    }
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = []
  }

  /**
   * Log an event to console (development only)
   */
  private logEvent(event: DeepLinkEvent): void {
    const emoji = event.isValid ? '✅' : '❌'
    const time = event.navigationTime ? ` (${event.navigationTime.toFixed(0)}ms)` : ''

    console.log(`[DeepLink] ${emoji} ${event.source} → ${event.path}${time}`, event.queryParams)

    if (event.errorMessage) {
      console.warn(`[DeepLink] Error: ${event.errorMessage}`)
    }
  }

  /**
   * Generate a report for debugging
   */
  generateReport(): string {
    const stats = this.getStats()

    let report = '\n=== Deep Link Analytics Report ===\n\n'
    report += `Total navigations: ${stats.total}\n`
    report += `Valid: ${stats.valid}\n`
    report += `Invalid: ${stats.invalid}\n`
    report += `Average navigation time: ${stats.averageNavigationTime.toFixed(2)}ms\n\n`

    report += 'By Handler:\n'
    Object.entries(stats.byHandler).forEach(([handler, count]) => {
      report += `  ${handler}: ${count}\n`
    })

    report += '\nBy Source:\n'
    Object.entries(stats.bySource).forEach(([source, count]) => {
      report += `  ${source}: ${count}\n`
    })

    if (this.getFailedEvents().length > 0) {
      report += '\nRecent Failures:\n'
      this.getFailedEvents()
        .slice(-5)
        .forEach((event) => {
          report += `  ${event.path} - ${event.errorMessage}\n`
        })
    }

    return report
  }
}

// Singleton instance
export const deepLinkAnalytics = new DeepLinkAnalytics()

// Expose to global for debugging
if (__DEV__) {
  // @ts-ignore
  global.deepLinkAnalytics = deepLinkAnalytics
}
