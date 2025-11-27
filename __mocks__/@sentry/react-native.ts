/**
 * Mock implementation of @sentry/react-native for testing
 */

export const init = jest.fn()
export const captureException = jest.fn()
export const captureMessage = jest.fn()
export const addBreadcrumb = jest.fn()
export const setUser = jest.fn()
export const setTag = jest.fn()
export const setExtra = jest.fn()
export const setContext = jest.fn()
export const configureScope = jest.fn()
export const withScope = jest.fn((callback) =>
  callback({
    setTag: jest.fn(),
    setExtra: jest.fn(),
    setLevel: jest.fn(),
    setContext: jest.fn(),
  })
)

export const Severity = {
  Fatal: 'fatal',
  Error: 'error',
  Warning: 'warning',
  Info: 'info',
  Debug: 'debug',
  Log: 'log',
}

export default {
  init,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  setExtra,
  setContext,
  configureScope,
  withScope,
  Severity,
}
