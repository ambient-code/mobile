import { Session, SessionStatus, ModelType } from '@/types/session'
import {
  RealtimeEventUnion,
  RealtimeEventType,
  SessionProgressData,
  SessionStatusData,
  SessionUpdatedData,
} from '@/types/realtime'
import { logger } from '@/utils/logger'

export const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    name: 'platform Review - Nov 26',
    status: SessionStatus.RUNNING,
    progress: 67,
    model: ModelType.SONNET_4_5,
    workflowType: 'review',
    repository: {
      id: 'repo-1',
      name: 'ambient-code/platform',
      url: 'https://github.com/ambient-code/platform',
      branch: 'main',
      isConnected: true,
    },
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 60000), // 1 minute ago
    currentTask: 'Analyzing code structure and identifying potential improvements',
    tasksCompleted: ['Cloned repository', 'Analyzed project structure', 'Identified code patterns'],
    errorMessage: null,
  },
  {
    id: '2',
    name: 'acp-mobile Bugfix - Nov 26',
    status: SessionStatus.AWAITING_REVIEW,
    progress: 100,
    model: ModelType.SONNET_4_5,
    workflowType: 'bugfix',
    repository: {
      id: 'repo-2',
      name: 'ambient-code/acp-mobile',
      url: 'https://github.com/ambient-code/acp-mobile',
      branch: 'fix/auth-bug',
      isConnected: true,
    },
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    updatedAt: new Date(Date.now() - 300000), // 5 minutes ago
    currentTask: null,
    tasksCompleted: [
      'Identified authentication bug',
      'Fixed token refresh logic',
      'Added error handling',
      'Updated unit tests',
      'Verified fix works',
    ],
    errorMessage: null,
  },
  {
    id: '3',
    name: 'backend-api Research - Nov 25',
    status: SessionStatus.RUNNING,
    progress: 45,
    model: ModelType.OPUS_4_5,
    workflowType: 'research',
    repository: {
      id: 'repo-3',
      name: 'ambient-code/backend-api',
      url: 'https://github.com/ambient-code/backend-api',
      branch: 'main',
      isConnected: false,
    },
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 120000), // 2 minutes ago
    currentTask: 'Documenting API endpoints and authentication flow',
    tasksCompleted: ['Analyzed codebase structure', 'Identified key modules'],
    errorMessage: null,
  },
  {
    id: '4',
    name: 'feature-planner Plan - Nov 25',
    status: SessionStatus.ERROR,
    progress: 23,
    model: ModelType.SONNET_4_5,
    workflowType: 'plan',
    repository: {
      id: 'repo-4',
      name: 'tools/feature-planner',
      url: 'https://github.com/tools/feature-planner',
      branch: 'develop',
      isConnected: false,
    },
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
    currentTask: null,
    tasksCompleted: ['Analyzed requirements'],
    errorMessage: 'Repository access denied. Please check authentication credentials.',
  },
  {
    id: '5',
    name: 'docs-site Plan a Feature - Nov 24',
    status: SessionStatus.DONE,
    progress: 100,
    model: ModelType.SONNET_4_5,
    workflowType: 'plan',
    repository: {
      id: 'repo-5',
      name: 'ambient-code/docs-site',
      url: 'https://github.com/ambient-code/docs-site',
      branch: 'main',
      isConnected: true,
    },
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 172800000), // 2 days ago
    currentTask: null,
    tasksCompleted: [
      'Analyzed current documentation structure',
      'Proposed new navigation system',
      'Created mockups for new design',
      'Documented implementation plan',
    ],
    errorMessage: null,
  },
]

/**
 * Mock SSE Service for development/testing
 *
 * Simulates Server-Sent Events by randomly generating session update events.
 * Useful for testing the UI without a real backend SSE endpoint.
 */
export class MockSSEService {
  private callbacks: Set<(event: RealtimeEventUnion) => void> = new Set()
  private intervalId: ReturnType<typeof setInterval> | null = null
  private isRunning = false

  /**
   * Start generating mock SSE events
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[MockSSE] Already running')
      return
    }

    this.isRunning = true
    logger.debug('[MockSSE] Starting mock event generation')

    // Generate events every 3-5 seconds (3x faster)
    this.intervalId = setInterval(
      () => {
        this.generateRandomEvent()
      },
      3000 + Math.random() * 2000
    )
  }

  /**
   * Stop generating mock SSE events
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    logger.debug('[MockSSE] Stopped mock event generation')
  }

  /**
   * Subscribe to mock SSE events
   */
  subscribe(callback: (event: RealtimeEventUnion) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * Generate a random SSE event
   */
  private generateRandomEvent(): void {
    const eventType = this.randomEventType()
    const event = this.createEvent(eventType)

    if (event) {
      logger.debug('[MockSSE] Generated event:', event.type, event.data)
      this.callbacks.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          console.error('[MockSSE] Error in callback:', error)
        }
      })
    }
  }

  /**
   * Randomly select an event type (weighted towards progress updates)
   */
  private randomEventType(): RealtimeEventType {
    const rand = Math.random()
    if (rand < 0.6) {
      // 60% progress updates
      return RealtimeEventType.SESSION_PROGRESS
    } else if (rand < 0.85) {
      // 25% session updates
      return RealtimeEventType.SESSION_UPDATED
    } else {
      // 15% status changes
      return RealtimeEventType.SESSION_STATUS
    }
  }

  /**
   * Create a mock event of the specified type
   */
  private createEvent(type: RealtimeEventType): RealtimeEventUnion | null {
    // Only generate events for running sessions
    const runningSessions = MOCK_SESSIONS.filter((s) => s.status === SessionStatus.RUNNING)

    if (runningSessions.length === 0) {
      return null
    }

    const session = runningSessions[Math.floor(Math.random() * runningSessions.length)]

    switch (type) {
      case RealtimeEventType.SESSION_PROGRESS:
        return {
          type,
          data: {
            sessionId: session.id,
            progress: Math.min(100, session.progress + Math.floor(Math.random() * 10)),
            currentTask: this.randomTask(),
          } as SessionProgressData,
          timestamp: Date.now(),
        }

      case RealtimeEventType.SESSION_UPDATED:
        return {
          type,
          data: {
            sessionId: session.id,
            changes: {
              updatedAt: new Date(),
              progress: Math.min(100, session.progress + Math.floor(Math.random() * 5)),
              currentTask: this.randomTask(),
            },
          } as SessionUpdatedData,
          timestamp: Date.now(),
        }

      case RealtimeEventType.SESSION_STATUS:
        // Randomly transition to completed or awaiting review
        const newStatus = Math.random() < 0.5 ? SessionStatus.DONE : SessionStatus.AWAITING_REVIEW

        return {
          type,
          data: {
            sessionId: session.id,
            status: newStatus,
            completedAt: new Date().toISOString(),
          } as SessionStatusData,
          timestamp: Date.now(),
        }

      default:
        return null
    }
  }

  /**
   * Generate a random task description
   */
  private randomTask(): string {
    const tasks = [
      'Analyzing code structure',
      'Reviewing test coverage',
      'Generating documentation',
      'Optimizing performance',
      'Refactoring components',
      'Updating dependencies',
      'Running security scan',
      'Building deployment artifacts',
      'Validating code quality',
      'Creating pull request',
    ]
    return tasks[Math.floor(Math.random() * tasks.length)]
  }
}

// Singleton instance for mock SSE service
export const mockSSEService = new MockSSEService()
