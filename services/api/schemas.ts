/**
 * Zod schemas for API response validation
 *
 * Validates all API responses to prevent crashes from malformed data,
 * XSS attacks via API responses, and type mismatches.
 */
import { z } from 'zod'
import { SessionStatus, ModelType } from '@/types/session'

/**
 * Repository schema
 */
export const repositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  branch: z.string(),
  isConnected: z.boolean(),
})

/**
 * Session schema
 */
export const sessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.nativeEnum(SessionStatus),
  progress: z.number().min(0).max(100),
  model: z.nativeEnum(ModelType),
  workflowType: z.string(),
  repository: repositorySchema,
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
  currentTask: z.string().nullable(),
  tasksCompleted: z.array(z.string()),
  errorMessage: z.string().nullable(),
})

/**
 * Log entry schema
 */
export const logEntrySchema = z.object({
  timestamp: z.string().transform((str) => new Date(str)),
  level: z.enum(['info', 'warning', 'error']),
  message: z.string(),
})

/**
 * Session detail schema (includes logs)
 */
export const sessionDetailSchema = sessionSchema.extend({
  logs: z.array(logEntrySchema).optional(),
})

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string().transform((str) => new Date(str)),
})

/**
 * Chat thread schema
 */
export const chatThreadSchema = z.object({
  id: z.string(),
  messages: z.array(chatMessageSchema),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
})

/**
 * Announcement schema
 */
export const announcementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isNew: z.boolean(),
  timestamp: z.string().transform((str) => new Date(str)),
})

/**
 * Token response schema
 */
export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().positive(),
})

/**
 * API response wrapper schema
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    error: z.string().optional(),
  })

/**
 * Generic list response schema
 */
export const listResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.array(itemSchema)

/**
 * User profile schema (for OAuth responses)
 */
export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().optional(),
  details: z.unknown().optional(),
})

/**
 * Validate and parse API response
 * Throws ZodError if validation fails
 */
export function validateResponse<T>(schema: z.ZodSchema<any, any, any>, data: unknown): T {
  return schema.parse(data) as T
}

/**
 * Safely validate API response
 * Returns validation result with success/error
 */
export function safeValidateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

// Export type inference helpers
export type Repository = z.infer<typeof repositorySchema>
export type Session = z.infer<typeof sessionSchema>
export type SessionDetail = z.infer<typeof sessionDetailSchema>
export type LogEntry = z.infer<typeof logEntrySchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatThread = z.infer<typeof chatThreadSchema>
export type Announcement = z.infer<typeof announcementSchema>
export type TokenResponse = z.infer<typeof tokenResponseSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
