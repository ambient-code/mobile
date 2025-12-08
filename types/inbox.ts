// Types for Inbox, Stuck Agents, Overnight Results, and Forecast

/**
 * Valid agent names with associated brand colors
 */
export const AGENT_COLORS = {
  Parker: '#3B82F6', // blue - Product Manager
  Archie: '#A855F7', // purple - Architect
  Taylor: '#10B981', // green - Team Member
  Phoenix: '#F97316', // orange - PXE Specialist
  Morgan: '#EF4444', // red - Additional agent
} as const

export type AgentName = keyof typeof AGENT_COLORS

/**
 * High-level statistics displayed in inbox header
 */
export interface InboxSummary {
  /** Number of agent tasks completed overnight */
  completedOvernight: number

  /** Number of agents currently stuck and requiring user input */
  stuckAgents: number

  /** Number of decisions pending user review */
  pendingDecisions: number
}

/**
 * Represents an agent that requires user guidance to proceed
 */
export interface StuckAgent {
  /** Unique identifier for the stuck agent instance */
  id: string

  /** Agent name (Parker, Archie, Taylor, Phoenix, Morgan) */
  name: AgentName

  /** Description of the current task the agent is working on */
  task: string

  /** Associated session ID for deep linking */
  sessionId: string

  /** Timestamp when the agent became stuck */
  stuckSince: Date
}

/**
 * Represents a completed task from overnight agent runs
 */
export interface OvernightResult {
  /** Agent name that completed the task */
  agentName: AgentName

  /** Description of the completed task */
  task: string

  /** Final status of the task */
  status: 'completed' | 'stuck'
}

/**
 * Represents upcoming schedule information and agent activity predictions
 */
export interface Forecast {
  /** Time window reserved for deep work (no interruptions) */
  deepWorkWindow: {
    start: Date
    end: Date
  }

  /** Timestamp when agents will batch and send the next round of decisions */
  nextReviewBatch: Date

  /** Total hours of agent work currently in progress */
  agentHoursInProgress: number
}

/**
 * Valid status values for notifications
 */
export type NotificationStatus = 'dismissed' | 'reviewed' | 'restored'

export const NOTIFICATION_STATUS_COLORS = {
  dismissed: '#F59E0B', // amber
  reviewed: '#10B981', // green
  restored: '#3B82F6', // blue
} as const

/**
 * Represents a historical notification event
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string

  /** Agent name that triggered the notification */
  agentName: AgentName

  /** Notification title/message */
  title: string

  /** Timestamp when notification was created */
  createdAt: Date

  /** Current status of the notification */
  status: NotificationStatus

  /** Optional source reference for deep linking */
  source?: {
    type: 'decision' | 'session' | 'result'
    id: string
  }
}
