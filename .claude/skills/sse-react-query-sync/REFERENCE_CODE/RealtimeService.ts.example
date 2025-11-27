import EventSourcePolyfill from 'react-native-sse'
import { API_BASE_URL } from '@/utils/constants'
import {
  RealtimeEventUnion,
  RealtimeEventType,
  ConnectionState,
  DEFAULT_RECONNECTION_CONFIG,
  ReconnectionConfig,
} from '@/types/realtime'
import { logger } from '@/utils/logger'

export type EventCallback = (event: RealtimeEventUnion) => void
export type StateCallback = (state: ConnectionState) => void

/**
 * SSE Service for real-time session updates
 *
 * Manages Server-Sent Events connection with automatic reconnection,
 * exponential backoff, and graceful error handling.
 */
export class RealtimeService {
  private eventSource: EventSourcePolyfill | null = null
  private eventCallbacks: Set<EventCallback> = new Set()
  private stateCallbacks: Set<StateCallback> = new Set()
  private currentState: ConnectionState = ConnectionState.DISCONNECTED
  private reconnectionConfig: ReconnectionConfig
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isManuallyDisconnected = false

  constructor(config: Partial<ReconnectionConfig> = {}) {
    this.reconnectionConfig = {
      ...DEFAULT_RECONNECTION_CONFIG,
      ...config,
    }
  }

  /**
   * Connect to SSE endpoint
   * @param token - Optional auth token for SSE connection
   */
  connect(token?: string): void {
    if (this.eventSource) {
      console.warn('[SSE] Already connected')
      return
    }

    this.isManuallyDisconnected = false
    this.setState(ConnectionState.CONNECTING)

    try {
      const url = `${API_BASE_URL}/sse/sessions`
      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      this.eventSource = new EventSourcePolyfill(url, {
        headers,
      })

      this.setupEventListeners()
    } catch (error) {
      console.error('[SSE] Connection error:', error)
      this.setState(ConnectionState.ERROR)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    this.isManuallyDisconnected = true
    this.cleanup()
    this.setState(ConnectionState.DISCONNECTED)
  }

  /**
   * Subscribe to SSE events
   */
  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.add(callback)
    return () => this.eventCallbacks.delete(callback)
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(callback: StateCallback): () => void {
    this.stateCallbacks.add(callback)
    // Immediately call with current state
    callback(this.currentState)
    return () => this.stateCallbacks.delete(callback)
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.currentState
  }

  /**
   * Manual retry connection (resets backoff)
   */
  retry(): void {
    this.reconnectAttempts = 0
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.cleanup()
    this.connect()
  }

  /**
   * Setup event listeners on EventSource
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return

    // Connection opened
    this.eventSource.addEventListener('open', () => {
      logger.debug('[SSE] Connection opened')
      this.reconnectAttempts = 0 // Reset on successful connection
      this.setState(ConnectionState.CONNECTED)
    })

    // Connection error
    this.eventSource.addEventListener('error', (error: unknown) => {
      console.error('[SSE] Connection error:', error)
      this.setState(ConnectionState.ERROR)
      this.cleanup()
      this.scheduleReconnect()
    })

    // Session updated events
    this.eventSource.addEventListener(
      RealtimeEventType.SESSION_UPDATED as never,
      (event: MessageEvent) => {
        this.handleEvent(event, RealtimeEventType.SESSION_UPDATED)
      }
    )

    // Session progress events
    this.eventSource.addEventListener(
      RealtimeEventType.SESSION_PROGRESS as never,
      (event: MessageEvent) => {
        this.handleEvent(event, RealtimeEventType.SESSION_PROGRESS)
      }
    )

    // Session status events
    this.eventSource.addEventListener(
      RealtimeEventType.SESSION_STATUS as never,
      (event: MessageEvent) => {
        this.handleEvent(event, RealtimeEventType.SESSION_STATUS)
      }
    )
  }

  /**
   * Handle incoming SSE event
   */
  private handleEvent(event: MessageEvent, type: RealtimeEventType): void {
    try {
      const data = JSON.parse(event.data)
      const realtimeEvent: RealtimeEventUnion = {
        type,
        data,
        timestamp: Date.now(),
      } as RealtimeEventUnion

      // Notify all subscribers
      this.eventCallbacks.forEach((callback) => {
        try {
          callback(realtimeEvent)
        } catch (error) {
          console.error('[SSE] Error in event callback:', error)
        }
      })
    } catch (error) {
      console.error('[SSE] Failed to parse event data:', error)
    }
  }

  /**
   * Update connection state and notify subscribers
   */
  private setState(state: ConnectionState): void {
    if (this.currentState === state) return

    this.currentState = state
    this.stateCallbacks.forEach((callback) => {
      try {
        callback(state)
      } catch (error) {
        console.error('[SSE] Error in state callback:', error)
      }
    })
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.isManuallyDisconnected) {
      logger.debug('[SSE] Manual disconnect, skipping reconnect')
      return
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.min(
      this.reconnectionConfig.initialDelay *
        Math.pow(this.reconnectionConfig.backoffMultiplier, this.reconnectAttempts),
      this.reconnectionConfig.maxDelay
    )

    this.reconnectAttempts++
    this.setState(ConnectionState.RECONNECTING)

    logger.debug(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Cleanup EventSource and timers
   */
  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }
}

// Singleton instance for app-wide use
export const realtimeService = new RealtimeService()
