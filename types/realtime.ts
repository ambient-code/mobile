import { Session, SessionStatus } from './session'
import { GitHubNotification } from './notification'

/**
 * Real-time event types from the SSE endpoint
 */
export enum RealtimeEventType {
  SESSION_UPDATED = 'session.updated',
  SESSION_PROGRESS = 'session.progress',
  SESSION_STATUS = 'session.status',
  NOTIFICATION_NEW = 'notification.new',
  NOTIFICATION_READ = 'notification.read',
  CONNECTION_OPENED = 'connection.opened',
  CONNECTION_ERROR = 'connection.error',
}

/**
 * Base SSE event structure
 */
export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType
  data: T
  timestamp?: number
}

/**
 * Incremental session update event
 * Contains partial session data to merge with existing session
 */
export interface SessionUpdatedEvent extends RealtimeEvent<SessionUpdatedData> {
  type: RealtimeEventType.SESSION_UPDATED
}

export interface SessionUpdatedData {
  sessionId: string
  changes: Partial<Session>
}

/**
 * Session progress update event
 * Updates only progress-related fields without full session data
 */
export interface SessionProgressEvent extends RealtimeEvent<SessionProgressData> {
  type: RealtimeEventType.SESSION_PROGRESS
}

export interface SessionProgressData {
  sessionId: string
  progress: number
  currentTask?: string
  estimatedCompletion?: string
}

/**
 * Session status change event
 * Notifies of status transitions (running -> completed, etc.)
 */
export interface SessionStatusEvent extends RealtimeEvent<SessionStatusData> {
  type: RealtimeEventType.SESSION_STATUS
}

export interface SessionStatusData {
  sessionId: string
  status: SessionStatus
  errorMessage?: string
  completedAt?: string
}

/**
 * Connection lifecycle events
 */
export interface ConnectionOpenedEvent extends RealtimeEvent<void> {
  type: RealtimeEventType.CONNECTION_OPENED
}

export interface ConnectionErrorEvent extends RealtimeEvent<ConnectionErrorData> {
  type: RealtimeEventType.CONNECTION_ERROR
}

export interface ConnectionErrorData {
  message: string
  code?: string
}

/**
 * Notification events
 */
export interface NotificationNewEvent extends RealtimeEvent<NotificationNewData> {
  type: RealtimeEventType.NOTIFICATION_NEW
}

export interface NotificationNewData {
  notification: GitHubNotification
}

export interface NotificationReadEvent extends RealtimeEvent<NotificationReadData> {
  type: RealtimeEventType.NOTIFICATION_READ
}

export interface NotificationReadData {
  notificationId: string
}

/**
 * Union type of all possible SSE events
 */
export type RealtimeEventUnion =
  | SessionUpdatedEvent
  | SessionProgressEvent
  | SessionStatusEvent
  | NotificationNewEvent
  | NotificationReadEvent
  | ConnectionOpenedEvent
  | ConnectionErrorEvent

/**
 * Connection state for UI feedback
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting',
}

/**
 * Reconnection strategy configuration
 */
export interface ReconnectionConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
}

/**
 * Default reconnection configuration
 * Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
 */
export const DEFAULT_RECONNECTION_CONFIG: ReconnectionConfig = {
  maxRetries: Infinity, // Keep trying indefinitely
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
}
