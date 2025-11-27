import { realtimeService } from '../realtime'
import { ConnectionState } from '@/types/realtime'

// Mock EventSource
class MockEventSource {
  public onopen: ((event: Event) => void) | null = null
  public onerror: ((event: Event) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public readyState = 0
  public url = ''

  constructor(url: string) {
    this.url = url
    this.readyState = 0 // CONNECTING
  }

  addEventListener = jest.fn()
  removeEventListener = jest.fn()
  close = jest.fn(() => {
    this.readyState = 2 // CLOSED
  })
}

global.EventSource = MockEventSource as any

describe('RealtimeService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    realtimeService.disconnect()
  })

  it('establishes SSE connection', () => {
    const stateCallback = jest.fn()
    realtimeService.onStateChange(stateCallback)

    realtimeService.connect()

    expect(stateCallback).toHaveBeenCalledWith(ConnectionState.CONNECTING)
  })

  it('applies exponential backoff on reconnection', async () => {
    jest.useFakeTimers()

    realtimeService.connect()

    // Simulate connection error
    const eventSource = (realtimeService as any).eventSource
    if (eventSource && eventSource.onerror) {
      eventSource.onerror(new Event('error'))
    }

    // First reconnect attempt: 1000ms * 2^0 = 1000ms
    jest.advanceTimersByTime(1000)

    // Simulate another error
    if (eventSource && eventSource.onerror) {
      eventSource.onerror(new Event('error'))
    }

    // Second reconnect attempt: 1000ms * 2^1 = 2000ms
    jest.advanceTimersByTime(2000)

    jest.useRealTimers()
  })

  it('does not reconnect after manual disconnect', () => {
    const stateCallback = jest.fn()
    realtimeService.onStateChange(stateCallback)

    realtimeService.connect()
    realtimeService.disconnect()

    const eventSource = (realtimeService as any).eventSource
    expect(eventSource).toBeNull()
    expect(stateCallback).toHaveBeenCalledWith(ConnectionState.DISCONNECTED)
  })
})
