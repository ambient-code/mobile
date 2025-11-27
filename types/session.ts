import { Repository } from './api'

export enum SessionStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  DONE = 'done',
  AWAITING_REVIEW = 'awaiting_review',
  ERROR = 'error',
}

export enum ModelType {
  SONNET_4_5 = 'sonnet-4.5',
  OPUS_4_5 = 'opus-4.5',
}

export interface Session {
  id: string
  name: string
  status: SessionStatus
  progress: number // 0-100
  model: ModelType
  workflowType: string
  repository: Repository
  createdAt: Date
  updatedAt: Date
  currentTask: string | null
  tasksCompleted: string[]
  errorMessage: string | null
}

export interface SessionDetail extends Session {
  logs?: LogEntry[]
}

export interface LogEntry {
  timestamp: Date
  level: 'info' | 'warning' | 'error'
  message: string
}

export interface CreateSessionRequest {
  name?: string
  workflowType: string
  model: ModelType
  repositoryUrl: string
  branch?: string
}

export interface UpdateSessionRequest {
  action: 'approve' | 'reject' | 'pause' | 'resume'
  feedback?: string
}
