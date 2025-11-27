/**
 * Deep Link Analytics Tests
 *
 * Tests for deep link navigation tracking and reporting.
 */

import { deepLinkAnalytics } from '@/utils/deepLinkAnalytics'
import type { ParsedDeepLink } from '@/utils/deepLinking'

describe('DeepLinkAnalytics', () => {
  beforeEach(() => {
    // Clear events before each test
    deepLinkAnalytics.clear()
  })

  describe('trackNavigation', () => {
    it('should track successful navigation', () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc123',
        queryParams: { tab: 'logs' },
        isValid: true,
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/abc123?tab=logs',
        parsedLink,
        'session-detail',
        'foreground',
        250,
      )

      const events = deepLinkAnalytics.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].handler).toBe('session-detail')
      expect(events[0].isValid).toBe(true)
      expect(events[0].navigationTime).toBe(250)
      expect(events[0].source).toBe('foreground')
    })

    it('should track failed navigation', () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/unknown',
        queryParams: {},
        isValid: false,
        errorMessage: 'Unsupported route',
      }

      deepLinkAnalytics.trackNavigation(
        'acp://unknown',
        parsedLink,
        null,
        'foreground',
      )

      const events = deepLinkAnalytics.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].isValid).toBe(false)
      expect(events[0].errorMessage).toBe('Unsupported route')
    })

    it('should limit stored events to maxEvents', () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/test',
        queryParams: {},
        isValid: true,
      }

      // Track 150 events (maxEvents is 100)
      for (let i = 0; i < 150; i++) {
        deepLinkAnalytics.trackNavigation(
          `acp://sessions/test${i}`,
          parsedLink,
          'session-detail',
          'foreground',
        )
      }

      const events = deepLinkAnalytics.getEvents()
      expect(events.length).toBeLessThanOrEqual(100)
    })
  })

  describe('trackValidationFailure', () => {
    it('should track validation failures', () => {
      deepLinkAnalytics.trackValidationFailure(
        'acp://invalid',
        'Invalid URL format',
        'initial',
      )

      const events = deepLinkAnalytics.getFailedEvents()
      expect(events).toHaveLength(1)
      expect(events[0].errorMessage).toBe('Invalid URL format')
      expect(events[0].source).toBe('initial')
    })
  })

  describe('getValidEvents', () => {
    it('should return only valid events', () => {
      const validLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc',
        queryParams: {},
        isValid: true,
      }

      const invalidLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/unknown',
        queryParams: {},
        isValid: false,
        errorMessage: 'Error',
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/abc',
        validLink,
        'session-detail',
        'foreground',
      )

      deepLinkAnalytics.trackNavigation(
        'acp://unknown',
        invalidLink,
        null,
        'foreground',
      )

      const validEvents = deepLinkAnalytics.getValidEvents()
      expect(validEvents).toHaveLength(1)
      expect(validEvents[0].path).toBe('/sessions/abc')
    })
  })

  describe('getFailedEvents', () => {
    it('should return only failed events', () => {
      const validLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc',
        queryParams: {},
        isValid: true,
      }

      const invalidLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/unknown',
        queryParams: {},
        isValid: false,
        errorMessage: 'Error',
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/abc',
        validLink,
        'session-detail',
        'foreground',
      )

      deepLinkAnalytics.trackNavigation(
        'acp://unknown',
        invalidLink,
        null,
        'foreground',
      )

      const failedEvents = deepLinkAnalytics.getFailedEvents()
      expect(failedEvents).toHaveLength(1)
      expect(failedEvents[0].path).toBe('/unknown')
    })
  })

  describe('getAverageNavigationTime', () => {
    it('should calculate average navigation time', () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/test',
        queryParams: {},
        isValid: true,
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/test1',
        parsedLink,
        'session-detail',
        'foreground',
        100,
      )

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/test2',
        parsedLink,
        'session-detail',
        'foreground',
        200,
      )

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/test3',
        parsedLink,
        'session-detail',
        'foreground',
        300,
      )

      const avg = deepLinkAnalytics.getAverageNavigationTime()
      expect(avg).toBe(200)
    })

    it('should return 0 for no events with navigation time', () => {
      const avg = deepLinkAnalytics.getAverageNavigationTime()
      expect(avg).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return comprehensive statistics', () => {
      const validLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc',
        queryParams: {},
        isValid: true,
      }

      const invalidLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/unknown',
        queryParams: {},
        isValid: false,
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/abc1',
        validLink,
        'session-detail',
        'foreground',
        100,
      )

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/abc2',
        validLink,
        'session-detail',
        'initial',
        200,
      )

      deepLinkAnalytics.trackNavigation(
        'acp://unknown',
        invalidLink,
        null,
        'foreground',
      )

      const stats = deepLinkAnalytics.getStats()

      expect(stats.total).toBe(3)
      expect(stats.valid).toBe(2)
      expect(stats.invalid).toBe(1)
      expect(stats.averageNavigationTime).toBe(150)
      expect(stats.byHandler['session-detail']).toBe(2)
      expect(stats.bySource.foreground).toBe(2)
      expect(stats.bySource.initial).toBe(1)
    })
  })

  describe('generateReport', () => {
    it('should generate a readable report', () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/abc',
        queryParams: {},
        isValid: true,
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/abc',
        parsedLink,
        'session-detail',
        'foreground',
        250,
      )

      const report = deepLinkAnalytics.generateReport()

      expect(report).toContain('Deep Link Analytics Report')
      expect(report).toContain('Total navigations: 1')
      expect(report).toContain('Valid: 1')
      expect(report).toContain('Invalid: 0')
      expect(report).toContain('session-detail: 1')
      expect(report).toContain('foreground: 1')
    })

    it('should include recent failures in report', () => {
      const invalidLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/unknown',
        queryParams: {},
        isValid: false,
        errorMessage: 'Unsupported route',
      }

      deepLinkAnalytics.trackNavigation(
        'acp://unknown',
        invalidLink,
        null,
        'foreground',
      )

      const report = deepLinkAnalytics.generateReport()

      expect(report).toContain('Recent Failures')
      expect(report).toContain('/unknown')
      expect(report).toContain('Unsupported route')
    })
  })

  describe('clear', () => {
    it('should clear all events', () => {
      const parsedLink: ParsedDeepLink = {
        scheme: 'acp',
        path: '/sessions/test',
        queryParams: {},
        isValid: true,
      }

      deepLinkAnalytics.trackNavigation(
        'acp://sessions/test',
        parsedLink,
        'session-detail',
        'foreground',
      )

      expect(deepLinkAnalytics.getEvents()).toHaveLength(1)

      deepLinkAnalytics.clear()

      expect(deepLinkAnalytics.getEvents()).toHaveLength(0)
    })
  })
})
