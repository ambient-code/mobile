// Environment Configuration
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/api/v1'

// OAuth Configuration
// Uses Universal Links for production security (prevents scheme hijacking)
// Falls back to custom scheme for development
const OAUTH_DOMAIN =
  process.env.EXPO_PUBLIC_OAUTH_DOMAIN ||
  'ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com'

export const OAUTH_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID || 'acp-mobile',
  // Universal Link (production) - more secure, prevents URL scheme hijacking
  redirectUri: __DEV__
    ? 'acp://auth/callback' // Development: custom scheme
    : `https://${OAUTH_DOMAIN}/auth/callback/mobile`, // Production: Universal Link
  scopes: ['openid', 'profile', 'email'],
}

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_GITHUB_INTEGRATION: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  DEBUG_API_CALLS: __DEV__,
}

// Authentication Configuration
export const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true'

// Polling Intervals (milliseconds)
export const POLLING_INTERVALS = {
  SESSIONS_ACTIVE: 5000, // 5 seconds when app is active
  SESSIONS_BACKGROUND: 30000, // 30 seconds when backgrounded
  NOTIFICATIONS: 30000, // 30 seconds
}

// Cache TTL (milliseconds)
export const CACHE_TTL = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  SESSIONS: 5 * 60 * 1000,
  NOTIFICATIONS: 5 * 60 * 1000,
  USER_PROFILE: 60 * 60 * 1000, // 1 hour
}

// Theme Colors (Legacy - for backward compatibility during migration)
export const COLORS = {
  light: {
    bg: '#f1f5f9',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#475569',
    accent: '#4f46e5',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  dark: {
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    accent: '#6366f1',
    border: '#334155',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
  },
}

// New Design Tokens (Dark-First Design System)
export const TOKENS = {
  // Backgrounds
  bg: '#0a0a0a',
  card: '#1a1a1a',
  elevated: '#222',

  // Semantic colors
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',

  // Text (flattened, not nested)
  textPrimary: '#fff',
  textSecondary: '#ccc',
  textMuted: '#888',
  textDisabled: '#666',

  // UI elements
  border: '#333',

  // Spacing (4px base)
  spacing4: 4,
  spacing8: 8,
  spacing12: 12,
  spacing16: 16,
  spacing24: 24,
  spacing32: 32,

  // Border radius
  radius8: 8,
  radius10: 10,
  radius12: 12,
  radius14: 14,
  radius20: 20,

  // Typography
  titleSize: 28,
  titleWeight: '700' as const,
  headerSize: 20,
  headerWeight: '700' as const,
  bodySize: 16,
  bodyWeight: '400' as const,
  labelSize: 14,
  labelWeight: '600' as const,
  hintSize: 12,
  hintWeight: '400' as const,
}

// Workflow Types
export const WORKFLOWS = [
  {
    id: 'review',
    label: 'Review',
    icon: 'eye',
    description: 'Code review and analysis',
    enabled: true,
  },
  {
    id: 'bugfix',
    label: 'Bugfix',
    icon: 'tool',
    description: 'Debug and fix issues',
    enabled: true,
  },
  {
    id: 'plan',
    label: 'Plan a Feature',
    icon: 'clipboard',
    description: 'Feature planning and design',
    enabled: true,
  },
  {
    id: 'research',
    label: 'Research',
    icon: 'book',
    description: 'Explore and document code',
    enabled: true,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'message-circle',
    description: 'Interactive conversation',
    enabled: true,
  },
  {
    id: 'ideate',
    label: 'Ideate',
    icon: 'lightbulb',
    description: 'Brainstorm and ideate',
    enabled: true,
  },
  {
    id: 'new',
    label: 'New...',
    icon: 'plus',
    description: 'Coming soon',
    enabled: false,
  },
]

// Notification Type to Workflow Mapping
export const NOTIFICATION_WORKFLOW_MAP: Record<string, string> = {
  pull_request: 'review',
  pull_request_review: 'review',
  issue: 'bugfix',
  issue_comment: 'chat',
  commit_comment: 'review',
  mention: 'chat',
  release: 'research',
  security_alert: 'bugfix',
}

// Time-based Greetings
export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

// Feedback Form URL
export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScQwBV4ZH2b3Fm_D0IDzIwKyCa-B8AnKhAOXZj3_F5cN0Gm8Q/viewform'
