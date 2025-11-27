export enum NotificationType {
  PULL_REQUEST = 'pull_request',
  PULL_REQUEST_REVIEW = 'pull_request_review',
  ISSUE = 'issue',
  ISSUE_COMMENT = 'issue_comment',
  COMMIT_COMMENT = 'commit_comment',
  MENTION = 'mention',
  RELEASE = 'release',
  SECURITY_ALERT = 'security_alert',
}

export interface GitHubNotification {
  id: string
  type: NotificationType
  repository: string
  itemNumber: number
  title: string
  author: string
  timestamp: Date
  isUnread: boolean
  suggestedWorkflow: string
  url: string
}

export enum AppNotificationType {
  REVIEW_REQUEST = 'review_request',
  SESSION_UPDATE = 'session_update',
  ANNOUNCEMENT = 'announcement',
  INSPIRATION = 'inspiration',
}

export interface AppNotification {
  id: string
  type: AppNotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  sessionId?: string
  author?: string
}

export interface InspiringQuote {
  quote: string
  author: string
  context: string
}

export const INSPIRING_QUOTES: InspiringQuote[] = [
  {
    quote: 'Go invent something.',
    author: 'Werner Vogels',
    context: 'CTO of Amazon',
  },
  {
    quote: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
    context: 'Pioneer of object-oriented programming',
  },
  {
    quote: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
    context: 'Creator of Linux',
  },
  {
    quote:
      'The most important property of a program is whether it accomplishes the intention of its user.',
    author: 'C.A.R. Hoare',
    context: 'Inventor of Quicksort',
  },
  {
    quote: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    context: 'Software Engineer',
  },
  {
    quote:
      'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    context: 'Author of Refactoring',
  },
  {
    quote: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
    context: 'Creator of Extreme Programming',
  },
  {
    quote:
      'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
    context: 'Co-author of SICP',
  },
  {
    quote: 'The only way to go fast, is to go well.',
    author: 'Robert C. Martin',
    context: 'Author of Clean Code',
  },
  {
    quote: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    context: 'Co-founder of Apple',
  },
]
