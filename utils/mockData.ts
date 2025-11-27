import { Session, SessionStatus, ModelType } from '@/types/session'
import {
  RealtimeEventUnion,
  RealtimeEventType,
  SessionProgressData,
  SessionStatusData,
  SessionUpdatedData,
} from '@/types/realtime'
import { GitHubNotification, NotificationType } from '@/types/notification'
import { NOTIFICATION_WORKFLOW_MAP } from '@/utils/constants'
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

export const MOCK_NOTIFICATIONS: GitHubNotification[] = [
  {
    id: 'notif-1',
    type: NotificationType.PULL_REQUEST,
    repository: 'ambient-code/platform',
    itemNumber: 1247,
    title: 'Add real-time session monitoring to mobile dashboard',
    author: 'sarah-dev',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    isUnread: true,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.PULL_REQUEST],
    url: 'https://github.com/ambient-code/platform/pull/1247',
  },
  {
    id: 'notif-2',
    type: NotificationType.ISSUE,
    repository: 'ambient-code/acp-mobile',
    itemNumber: 89,
    title: 'Notifications not refreshing when app comes to foreground',
    author: 'mike-qa',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    isUnread: true,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.ISSUE],
    url: 'https://github.com/ambient-code/acp-mobile/issues/89',
  },
  {
    id: 'notif-3',
    type: NotificationType.MENTION,
    repository: 'ambient-code/platform',
    itemNumber: 1245,
    title: '@jeder Can you review the OAuth implementation?',
    author: 'alex-backend',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    isUnread: true,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.MENTION],
    url: 'https://github.com/ambient-code/platform/pull/1245#issuecomment-12345',
  },
  {
    id: 'notif-4',
    type: NotificationType.PULL_REQUEST_REVIEW,
    repository: 'ambient-code/backend-api',
    itemNumber: 567,
    title: 'Improve API response caching strategy',
    author: 'emma-sre',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    isUnread: false,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.PULL_REQUEST_REVIEW],
    url: 'https://github.com/ambient-code/backend-api/pull/567',
  },
  {
    id: 'notif-5',
    type: NotificationType.SECURITY_ALERT,
    repository: 'ambient-code/acp-mobile',
    itemNumber: 3,
    title: 'Dependabot alert: axios has a potential security vulnerability',
    author: 'dependabot[bot]',
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    isUnread: true,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.SECURITY_ALERT],
    url: 'https://github.com/ambient-code/acp-mobile/security/dependabot/3',
  },
  {
    id: 'notif-6',
    type: NotificationType.ISSUE_COMMENT,
    repository: 'tools/feature-planner',
    itemNumber: 42,
    title: 'Great idea! We should definitely prioritize this',
    author: 'jordan-pm',
    timestamp: new Date(Date.now() - 21600000), // 6 hours ago
    isUnread: false,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.ISSUE_COMMENT],
    url: 'https://github.com/tools/feature-planner/issues/42#issuecomment-67890',
  },
  {
    id: 'notif-7',
    type: NotificationType.RELEASE,
    repository: 'facebook/react-native',
    itemNumber: 0,
    title: 'React Native 0.76.0 released with new architecture improvements',
    author: 'react-native-bot',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    isUnread: false,
    suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[NotificationType.RELEASE],
    url: 'https://github.com/facebook/react-native/releases/tag/v0.76.0',
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
    if (rand < 0.5) {
      // 50% progress updates
      return RealtimeEventType.SESSION_PROGRESS
    } else if (rand < 0.7) {
      // 20% session updates
      return RealtimeEventType.SESSION_UPDATED
    } else if (rand < 0.85) {
      // 15% new notifications
      return RealtimeEventType.NOTIFICATION_NEW
    } else if (rand < 0.95) {
      // 10% status changes
      return RealtimeEventType.SESSION_STATUS
    } else {
      // 5% notification read
      return RealtimeEventType.NOTIFICATION_READ
    }
  }

  /**
   * Create a mock event of the specified type
   */
  private createEvent(type: RealtimeEventType): RealtimeEventUnion | null {
    switch (type) {
      case RealtimeEventType.SESSION_PROGRESS:
      case RealtimeEventType.SESSION_UPDATED:
      case RealtimeEventType.SESSION_STATUS: {
        // Only generate session events for running sessions
        const runningSessions = MOCK_SESSIONS.filter((s) => s.status === SessionStatus.RUNNING)
        if (runningSessions.length === 0) return null

        const session = runningSessions[Math.floor(Math.random() * runningSessions.length)]

        if (type === RealtimeEventType.SESSION_PROGRESS) {
          return {
            type,
            data: {
              sessionId: session.id,
              progress: Math.min(100, session.progress + Math.floor(Math.random() * 10)),
              currentTask: this.randomTask(),
            } as SessionProgressData,
            timestamp: Date.now(),
          }
        } else if (type === RealtimeEventType.SESSION_UPDATED) {
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
        } else {
          // SESSION_STATUS
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
        }
      }

      case RealtimeEventType.NOTIFICATION_NEW: {
        // Generate a new notification
        const notification = this.generateRandomNotification()
        return {
          type,
          data: { notification },
          timestamp: Date.now(),
        }
      }

      case RealtimeEventType.NOTIFICATION_READ: {
        // Mark a random unread notification as read
        const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => n.isUnread)
        if (unreadNotifs.length === 0) return null

        const notif = unreadNotifs[Math.floor(Math.random() * unreadNotifs.length)]
        return {
          type,
          data: { notificationId: notif.id },
          timestamp: Date.now(),
        }
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

  /**
   * Generate a random GitHub notification
   */
  private generateRandomNotification(): GitHubNotification {
    const types = Object.values(NotificationType)
    const type = types[Math.floor(Math.random() * types.length)]

    const repos = [
      'ambient-code/platform',
      'ambient-code/acp-mobile',
      'ambient-code/backend-api',
      'facebook/react-native',
      'expo/expo',
    ]

    const titles = {
      [NotificationType.PULL_REQUEST]: [
        'Add new authentication flow',
        'Fix memory leak in session manager',
        'Update dependencies to latest versions',
        'Improve error handling in API client',
      ],
      [NotificationType.ISSUE]: [
        'App crashes on iOS when opening notifications',
        'Session progress not updating correctly',
        'Dark mode colors inconsistent',
        'Performance degradation with large datasets',
      ],
      [NotificationType.MENTION]: [
        '@jeder thoughts on this approach?',
        'Can you review this when you get a chance?',
        'What do you think about this implementation?',
      ],
      [NotificationType.PULL_REQUEST_REVIEW]: [
        'Reviewed: Add notification system',
        'Approved with suggestions',
        'Requested changes on API implementation',
      ],
      [NotificationType.SECURITY_ALERT]: [
        'Dependabot alert: vulnerability in dependencies',
        'Code scanning found potential security issue',
        'Secret scanning detected exposed token',
      ],
      [NotificationType.ISSUE_COMMENT]: [
        'Great suggestion! Let me try that',
        'I think we should consider the performance impact',
        'This is working well in my testing',
      ],
      [NotificationType.RELEASE]: [
        'v2.0.0 released with breaking changes',
        'Security patch released',
        'New features available in latest release',
      ],
      [NotificationType.COMMIT_COMMENT]: [
        'Nice refactoring here',
        'Should we add tests for this?',
        'This might need error handling',
      ],
    }

    const authors = ['sarah-dev', 'mike-qa', 'alex-backend', 'emma-sre', 'jordan-pm']

    const titleOptions = titles[type] || ['New notification']
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)]
    const repo = repos[Math.floor(Math.random() * repos.length)]
    const author = authors[Math.floor(Math.random() * authors.length)]
    const itemNumber = Math.floor(Math.random() * 1000) + 1

    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      type,
      repository: repo,
      itemNumber,
      title,
      author,
      timestamp: new Date(),
      isUnread: true,
      suggestedWorkflow: NOTIFICATION_WORKFLOW_MAP[type] || 'review',
      url: `https://github.com/${repo}/${type.includes('pull') ? 'pull' : 'issues'}/${itemNumber}`,
    }
  }
}

// Singleton instance for mock SSE service
export const mockSSEService = new MockSSEService()
