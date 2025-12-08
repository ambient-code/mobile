// Mock data for The Commuter Demo screens

import { InboxSummary, StuckAgent, OvernightResult, Forecast, Notification } from '../types/inbox'
import { PendingDecision } from '../types/decisions'

/**
 * Mock inbox data for homescreen
 */
export const mockInboxData = {
  user: {
    name: 'Maya',
  },
  summary: {
    completedOvernight: 3,
    stuckAgents: 1,
    pendingDecisions: 4,
  } as InboxSummary,
  stuckAgents: [
    {
      id: 'stuck-1',
      name: 'Archie',
      task: 'Schema design',
      sessionId: 'session-archie-1',
      stuckSince: new Date('2025-12-07T03:42:00'),
    },
  ] as StuckAgent[],
  overnightResults: [
    { agentName: 'Taylor', task: 'User preference caching', status: 'completed' },
    { agentName: 'Phoenix', task: 'Test suite for auth module', status: 'completed' },
    { agentName: 'Archie', task: 'Schema for multi-tenant config', status: 'stuck' },
  ] as OvernightResult[],
  forecast: {
    deepWorkWindow: {
      start: new Date('2025-12-07T10:30:00'),
      end: new Date('2025-12-07T13:00:00'),
    },
    nextReviewBatch: new Date('2025-12-07T14:15:00'),
    agentHoursInProgress: 14,
  } as Forecast,
}

/**
 * Mock pending decisions for decision queue
 */
export const mockPendingDecisions: PendingDecision[] = [
  {
    id: 'd1',
    agentName: 'Phoenix',
    title: 'Which test framework?',
    context: 'Payment module',
    estimatedMinutes: 3,
    details: {
      question: 'Should we use Jest or Vitest for the payment module tests?',
      context:
        'The payment module is critical and needs comprehensive testing. We currently use Jest project-wide, but Vitest offers better ESM support and faster execution.',
      analysis:
        "Jest is already in use and the team is familiar with it. Migration to Vitest would require time and could introduce risks. However, Vitest's native ESM support aligns better with our modern build tooling.",
      recommendation:
        'Stick with Jest for consistency and team familiarity. We can migrate to Vitest in a future sprint once we have bandwidth for a comprehensive test migration.',
      sections: [
        {
          id: 's1',
          title: 'Test Coverage Requirements',
          content:
            'The payment module requires 95% code coverage with comprehensive integration tests. Both Jest and Vitest can achieve this, but Jest has more mature ecosystem support for our current stack.',
          viewed: false,
        },
        {
          id: 's2',
          title: 'Performance Implications',
          content:
            "Vitest runs tests 2-3x faster than Jest due to native ESM and Vite's optimized bundling. For our 500+ test suite, this could save 2-3 minutes per run.",
          viewed: false,
        },
        {
          id: 's3',
          title: 'Team Familiarity',
          content:
            'All 5 engineers are proficient with Jest. Only 2 have used Vitest. Training and documentation would be needed for a migration.',
          viewed: false,
        },
      ],
    },
  },
  {
    id: 'd2',
    agentName: 'Archie',
    title: 'Confirm schema approach?',
    context: 'Multi-tenant config',
    estimatedMinutes: 4,
    details: {
      question:
        'Should we use separate schemas per tenant or a single schema with tenant_id column?',
      context:
        "We're implementing multi-tenant support for the config service. Two architectural approaches are viable.",
      analysis:
        'Separate schemas provide better isolation but increase complexity. Single schema with tenant_id is simpler but requires careful row-level security.',
      recommendation:
        'Use single schema with tenant_id column and Postgres RLS policies for simplicity and easier migrations.',
      sections: [
        {
          id: 's1',
          title: 'Isolation vs Complexity',
          content:
            'Separate schemas ensure complete data isolation but require managing N schemas and coordinating migrations across all tenants.',
          viewed: false,
        },
        {
          id: 's2',
          title: 'Migration Strategy',
          content:
            'Single schema allows atomic migrations. Separate schemas require running migrations N times with potential for inconsistencies.',
          viewed: false,
        },
      ],
    },
  },
  {
    id: 'd3',
    agentName: 'Parker',
    title: 'Priority call needed',
    context: 'Feature A vs B',
    estimatedMinutes: 3,
    details: {
      question:
        'Should we prioritize Feature A (analytics dashboard) or Feature B (export functionality)?',
      context:
        'Both features were requested by customers, but we only have capacity for one this sprint.',
      analysis:
        'Analytics dashboard has higher customer demand (12 requests vs 5). Export functionality is simpler to implement (2 days vs 5 days).',
      recommendation:
        'Prioritize Feature A (analytics dashboard) based on customer demand, despite longer implementation time.',
      sections: [
        {
          id: 's1',
          title: 'Customer Impact',
          content:
            'Analytics dashboard: 12 customer requests, 3 enterprise accounts. Export: 5 requests, 1 enterprise account.',
          viewed: false,
        },
        {
          id: 's2',
          title: 'Implementation Complexity',
          content:
            'Analytics requires new charting library, data aggregation pipeline, and real-time updates. Export is straightforward CSV generation.',
          viewed: false,
        },
      ],
    },
  },
  {
    id: 'd4',
    agentName: 'Taylor',
    title: 'Dependency update?',
    context: 'lodash 4.17.21',
    estimatedMinutes: 2,
    details: {
      question: 'Should we update lodash from 4.17.21 to 4.18.0?',
      context:
        'A security vulnerability (CVE-2024-XXXX) was discovered in lodash 4.17.21. The fix is available in 4.18.0.',
      analysis:
        'The vulnerability affects prototype pollution in the merge() function. We use lodash in 45 files, but only 3 use merge(). Update is low risk with high security benefit.',
      recommendation:
        'Update to 4.18.0 immediately. Run full test suite after update to verify no breaking changes.',
      sections: [
        {
          id: 's1',
          title: 'Security Impact',
          content:
            'CVE-2024-XXXX allows prototype pollution via lodash.merge(). Attack requires specific payload patterns. Our usage appears safe, but patching is still recommended.',
          viewed: false,
        },
        {
          id: 's2',
          title: 'Breaking Changes',
          content:
            'Lodash 4.18.0 has no breaking changes from 4.17.21. Changelog shows only security fixes and minor performance improvements.',
          viewed: false,
        },
      ],
    },
  },
]

/**
 * Mock notification history
 */
export const mockNotificationHistory: Notification[] = [
  {
    id: 'n1',
    agentName: 'Parker',
    title: 'RFE #67 triage complete', // Easter egg!
    createdAt: new Date('2025-12-07T12:52:00'),
    status: 'dismissed',
  },
  {
    id: 'n2',
    agentName: 'Phoenix',
    title: 'Test suite ready for review',
    createdAt: new Date('2025-12-07T11:47:00'),
    status: 'reviewed',
  },
  {
    id: 'n3',
    agentName: 'Archie',
    title: 'Schema retry successful',
    createdAt: new Date('2025-12-07T10:15:00'),
    status: 'reviewed',
  },
  {
    id: 'n4',
    agentName: 'Taylor',
    title: 'PR #127 merged successfully',
    createdAt: new Date('2025-12-06T16:30:00'),
    status: 'reviewed',
  },
  {
    id: 'n5',
    agentName: 'Morgan',
    title: 'Build failed - Node version mismatch',
    createdAt: new Date('2025-12-06T14:22:00'),
    status: 'dismissed',
  },
]

/**
 * Mock function to complete a decision review
 */
export async function completeDecisionReview(
  decisionId: string,
  data: {
    comment: string
    quickResponse?: string
    viewedSections: string[]
  }
) {
  // Mock implementation - no actual persistence
  console.log(`[MOCK] Completing review for decision ${decisionId}:`, data)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    reviewId: `review-${Date.now()}`,
    status: 'pending-undo' as const,
    undoExpiresAt: new Date(Date.now() + 5000), // 5 seconds from now
  }
}

/**
 * Mock function to undo a review
 */
export async function undoReview(reviewId: string) {
  console.log(`[MOCK] Undoing review ${reviewId}`)
  await new Promise((resolve) => setTimeout(resolve, 200))
  return { success: true, message: 'Review undone successfully' }
}

/**
 * Mock function to restore a notification
 */
export async function restoreNotification(notificationId: string) {
  console.log(`[MOCK] Restoring notification ${notificationId}`)
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    id: notificationId,
    status: 'restored' as const,
    restoredAt: new Date(),
  }
}
