export interface Repository {
  id: string
  name: string
  url: string
  branch: string
  isConnected: boolean
}

export interface ChatMessage {
  id: string
  threadId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatThread {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface Announcement {
  id: string
  title: string
  description: string
  isNew: boolean
  timestamp: Date
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
