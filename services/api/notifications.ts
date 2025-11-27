import { apiClient } from './client'
import type { GitHubNotification } from '@/types/notification'
import { NotificationType } from '@/types/notification'
import { z } from 'zod'
import { validateResponse } from './schemas'

/**
 * GitHub Notification schema for API validation
 */
const notificationSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NotificationType),
  repository: z.string(),
  itemNumber: z.number().int().positive(),
  title: z.string(),
  author: z.string(),
  timestamp: z.string().transform((str) => new Date(str)),
  isUnread: z.boolean(),
  suggestedWorkflow: z.string(),
  url: z.string().url(),
})

const notificationsResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number().int().min(0),
})

export interface MarkAsReadRequest {
  notificationIds: string[]
}

export interface MuteThreadRequest {
  notificationId: string
}

export class NotificationsAPI {
  /**
   * Fetch GitHub notifications
   * @param unreadOnly - If true, only return unread notifications
   * @returns Array of GitHub notifications with unread count
   */
  static async fetchNotifications(
    unreadOnly = false
  ): Promise<{ notifications: GitHubNotification[]; unreadCount: number }> {
    const params = unreadOnly ? { unread: 'true' } : {}
    const response = await apiClient.get<unknown>('/notifications/github', {
      params,
    })

    // Validate response with Zod
    return validateResponse<{ notifications: GitHubNotification[]; unreadCount: number }>(
      notificationsResponseSchema,
      response
    )
  }

  /**
   * Mark one or more notifications as read
   * @param notificationIds - Array of notification IDs to mark as read
   */
  static async markAsRead(notificationIds: string[]): Promise<void> {
    await apiClient.patch<void>('/notifications/read', { notificationIds })
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    await apiClient.patch<void>('/notifications/read-all')
  }

  /**
   * Mute a notification thread
   * @param notificationId - The notification ID to mute
   */
  static async muteThread(notificationId: string): Promise<void> {
    await apiClient.post<void>('/notifications/mute', { notificationId })
  }
}
