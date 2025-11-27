/**
 * Logger Utility
 *
 * Centralized logging that only outputs in development mode.
 * Prevents sensitive information from appearing in production crash logs.
 */

export const logger = {
  /**
   * Debug logging - only shown in development
   */
  debug: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args)
    }
  },

  /**
   * Info logging - only shown in development
   */
  info: (...args: unknown[]) => {
    if (__DEV__) {
      console.info(...args)
    }
  },

  /**
   * Warning logging - shown in all environments
   */
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },

  /**
   * Error logging - shown in all environments
   */
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
