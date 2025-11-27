import type { Announcement } from '@/types/announcement'

/**
 * Mock announcements service
 * Provides hardcoded announcements about ACP platform features, updates, and tips
 */

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Welcome to ACP Mobile!',
    description:
      'Experience the power of AI-assisted development on the go. Create sessions, manage workflows, and collaborate with your team from anywhere.',
    isNew: true,
    timestamp: new Date('2025-11-27T10:00:00Z'),
  },
  {
    id: 'ann-002',
    title: 'New Feature: Multi-Repository Sessions',
    description:
      'You can now work across multiple repositories in a single session. Select multiple repos when creating a new session to unlock cross-repository workflows.',
    isNew: true,
    timestamp: new Date('2025-11-26T14:30:00Z'),
  },
  {
    id: 'ann-003',
    title: 'Improved Chat Performance',
    description:
      'Chat interactions are now 2x faster with optimized SSE connections and React Query caching. Enjoy smoother real-time updates.',
    isNew: true,
    timestamp: new Date('2025-11-25T09:15:00Z'),
  },
  {
    id: 'ann-004',
    title: 'Tip: Use Workflow Templates',
    description:
      'Save time by starting with pre-built workflow templates. Choose from Feature Development, Bug Fix, Code Review, and more when creating a session.',
    isNew: false,
    timestamp: new Date('2025-11-24T16:45:00Z'),
  },
  {
    id: 'ann-005',
    title: 'Enhanced Notification System',
    description:
      'Get instant updates on session approvals, chat messages, and workflow completions. Customize your notification preferences in Settings.',
    isNew: false,
    timestamp: new Date('2025-11-23T11:20:00Z'),
  },
  {
    id: 'ann-006',
    title: 'Best Practice: Review Before Approval',
    description:
      'Always review suggested changes in the chat before approving actions. This ensures quality and helps you learn from AI-assisted workflows.',
    isNew: false,
    timestamp: new Date('2025-11-22T13:00:00Z'),
  },
  {
    id: 'ann-007',
    title: 'Dark Mode Updates',
    description:
      'Dark mode now includes refined color schemes for better readability. Check out the new accent colors and improved contrast ratios.',
    isNew: false,
    timestamp: new Date('2025-11-21T10:30:00Z'),
  },
  {
    id: 'ann-008',
    title: 'Model Selection Enhancements',
    description:
      'Choose from multiple AI models when creating sessions. Each model has different strengths - experiment to find what works best for your workflow.',
    isNew: false,
    timestamp: new Date('2025-11-20T15:10:00Z'),
  },
  {
    id: 'ann-009',
    title: 'Tip: Star Important Sessions',
    description:
      'Keep track of your most important work by starring sessions. Starred sessions appear at the top of your list for quick access.',
    isNew: false,
    timestamp: new Date('2025-11-19T09:00:00Z'),
  },
  {
    id: 'ann-010',
    title: 'Platform Update: Faster Sync',
    description:
      'Backend improvements have reduced sync latency by 40%. Your sessions and chat messages now update almost instantly across devices.',
    isNew: false,
    timestamp: new Date('2025-11-18T12:45:00Z'),
  },
]

/**
 * Get all announcements sorted by timestamp (newest first)
 */
export const getAnnouncements = (): Announcement[] => {
  return [...mockAnnouncements].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get count of new (unread) announcements
 */
export const getUnreadCount = (readAnnouncementIds: string[]): number => {
  return mockAnnouncements.filter((ann) => ann.isNew && !readAnnouncementIds.includes(ann.id))
    .length
}

/**
 * Get a single announcement by ID
 */
export const getAnnouncementById = (id: string): Announcement | undefined => {
  return mockAnnouncements.find((ann) => ann.id === id)
}
