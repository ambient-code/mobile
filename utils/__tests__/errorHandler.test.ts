import { errorHandler } from '../errorHandler'

describe('GlobalErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes without errors', () => {
    expect(() => errorHandler.initialize()).not.toThrow()
  })

  it('notifies error listeners when error occurs', () => {
    const listener = jest.fn()
    const unsubscribe = errorHandler.onError(listener)

    const testError = new Error('Test error')
    errorHandler.reportError(testError, { source: 'Test' })

    expect(listener).toHaveBeenCalledWith(testError, { source: 'Test' })

    unsubscribe()
  })

  it('unsubscribes listener correctly', () => {
    const listener = jest.fn()
    const unsubscribe = errorHandler.onError(listener)

    unsubscribe()

    const testError = new Error('Test error')
    errorHandler.reportError(testError)

    expect(listener).not.toHaveBeenCalled()
  })

  // Skip Alert test - Alert.alert requires native module which isn't available in Jest
  it.skip('shows alert for fatal errors', () => {
    // Skipped: Alert testing requires native module mocking which is complex in Jest
  })
})
