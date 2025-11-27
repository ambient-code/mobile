import React from 'react'
import { Platform, ActionSheetIOS, Alert, Linking } from 'react-native'
import type { GitHubNotification } from '@/types/notification'
import { NOTIFICATION_WORKFLOW_MAP } from '@/utils/constants'
import { useMarkAsRead, useMuteThread } from '@/hooks/useNotifications'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

export interface NotificationActionsProps {
  notification: GitHubNotification
  onActionComplete?: () => void
}

/**
 * Hook to show notification action sheet
 * Provides actions: preview, start workflow (soon), mark as read, open in browser, mute
 */
export function useNotificationActions() {
  const markAsRead = useMarkAsRead()
  const muteThread = useMuteThread()

  const showActions = React.useCallback(
    (notification: GitHubNotification, onActionComplete?: () => void) => {
      const suggestedWorkflow = NOTIFICATION_WORKFLOW_MAP[notification.type] || 'review'
      const workflowLabel = suggestedWorkflow.charAt(0).toUpperCase() + suggestedWorkflow.slice(1)

      const options = [
        'Preview',
        `Start ${workflowLabel} (Soon)`,
        notification.isUnread ? 'Mark as Read' : 'Mark as Unread',
        'Open in Browser',
        'Mute Thread',
        'Cancel',
      ]

      const destructiveButtonIndex = 4 // Mute Thread
      const cancelButtonIndex = 5

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
            title: notification.title,
            message: `${notification.repository} #${notification.itemNumber}`,
          },
          async (buttonIndex) => {
            switch (buttonIndex) {
              case 0: // Preview
                trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                  action: 'preview',
                  notificationType: notification.type,
                })
                // TODO: Implement preview in future iteration
                Alert.alert('Preview', 'Preview feature coming soon!')
                break

              case 1: // Start Workflow
                trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                  action: 'start_workflow',
                  notificationType: notification.type,
                  workflow: suggestedWorkflow,
                })
                Alert.alert(
                  'Coming Soon',
                  `Starting ${workflowLabel} workflow from notifications will be available soon!`
                )
                break

              case 2: // Mark as Read/Unread
                if (notification.isUnread) {
                  trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                    action: 'mark_read',
                    notificationType: notification.type,
                  })
                  await markAsRead.mutateAsync([notification.id])
                  onActionComplete?.()
                } else {
                  // TODO: Implement mark as unread in API
                  Alert.alert('Mark as Unread', 'This feature will be available soon!')
                }
                break

              case 3: // Open in Browser
                trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                  action: 'open_browser',
                  notificationType: notification.type,
                })
                await Linking.openURL(notification.url)
                // Mark as read when opening in browser
                if (notification.isUnread) {
                  await markAsRead.mutateAsync([notification.id])
                  onActionComplete?.()
                }
                break

              case 4: // Mute Thread
                Alert.alert('Mute Thread', 'Are you sure you want to mute this thread?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Mute',
                    style: 'destructive',
                    onPress: async () => {
                      trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                        action: 'mute',
                        notificationType: notification.type,
                      })
                      await muteThread.mutateAsync(notification.id)
                      onActionComplete?.()
                    },
                  },
                ])
                break

              case 5: // Cancel
                break
            }
          }
        )
      } else {
        // Android: Use Alert with options (simplified UX)
        Alert.alert(
          notification.title,
          `${notification.repository} #${notification.itemNumber}\n\nChoose an action:`,
          [
            {
              text: 'Preview',
              onPress: () => {
                trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                  action: 'preview',
                  notificationType: notification.type,
                })
                Alert.alert('Preview', 'Preview feature coming soon!')
              },
            },
            {
              text: `Start ${workflowLabel} (Soon)`,
              onPress: () => {
                trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                  action: 'start_workflow',
                  notificationType: notification.type,
                  workflow: suggestedWorkflow,
                })
                Alert.alert(
                  'Coming Soon',
                  `Starting ${workflowLabel} workflow from notifications will be available soon!`
                )
              },
            },
            {
              text: notification.isUnread ? 'Mark as Read' : 'Mark as Unread',
              onPress: async () => {
                if (notification.isUnread) {
                  trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                    action: 'mark_read',
                    notificationType: notification.type,
                  })
                  await markAsRead.mutateAsync([notification.id])
                  onActionComplete?.()
                } else {
                  Alert.alert('Mark as Unread', 'This feature will be available soon!')
                }
              },
            },
            {
              text: 'Open in Browser',
              onPress: async () => {
                trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                  action: 'open_browser',
                  notificationType: notification.type,
                })
                await Linking.openURL(notification.url)
                if (notification.isUnread) {
                  await markAsRead.mutateAsync([notification.id])
                  onActionComplete?.()
                }
              },
            },
            {
              text: 'Mute Thread',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Mute Thread', 'Are you sure you want to mute this thread?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Mute',
                    style: 'destructive',
                    onPress: async () => {
                      trackEvent(TelemetryEvents.NOTIFICATION_ACTION, {
                        action: 'mute',
                        notificationType: notification.type,
                      })
                      await muteThread.mutateAsync(notification.id)
                      onActionComplete?.()
                    },
                  },
                ])
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        )
      }
    },
    [markAsRead, muteThread]
  )

  return { showActions }
}
