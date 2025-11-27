import { apiClient } from './client'
import {
  Session,
  SessionDetail,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionStatus,
  LogEntry,
} from '@/types/session'
import {
  sessionSchema,
  sessionDetailSchema,
  logEntrySchema,
  validateResponse,
  listResponseSchema,
} from './schemas'
import { z } from 'zod'

const sessionsResponseSchema = z.object({
  sessions: z.array(sessionSchema),
})

const logsResponseSchema = z.object({
  logs: z.array(logEntrySchema),
})

export class SessionsAPI {
  static async fetchSessions(status?: SessionStatus): Promise<Session[]> {
    const params = status ? { status } : {}
    const response = await apiClient.get<unknown>('/sessions', {
      params,
    } as any)

    // Validate response with Zod
    const validated = validateResponse<{ sessions: Session[] }>(sessionsResponseSchema, response)
    return validated.sessions
  }

  static async fetchSessionDetail(id: string): Promise<SessionDetail> {
    const response = await apiClient.get<unknown>(`/sessions/${id}`)

    // Validate response with Zod
    return validateResponse<SessionDetail>(sessionDetailSchema, response)
  }

  static async createSession(request: CreateSessionRequest): Promise<Session> {
    const response = await apiClient.post<unknown>('/sessions', request)

    // Validate response with Zod
    return validateResponse<Session>(sessionSchema, response)
  }

  static async updateSession(id: string, request: UpdateSessionRequest): Promise<Session> {
    const response = await apiClient.patch<unknown>(`/sessions/${id}`, request)

    // Validate response with Zod
    return validateResponse<Session>(sessionSchema, response)
  }

  static async fetchLogs(id: string): Promise<LogEntry[]> {
    const response = await apiClient.get<unknown>(`/sessions/${id}/logs`)

    // Validate response with Zod
    const validated = validateResponse<{ logs: LogEntry[] }>(logsResponseSchema, response)
    return validated.logs
  }
}
