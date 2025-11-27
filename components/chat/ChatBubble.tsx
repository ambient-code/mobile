/**
 * ChatBubble Component
 *
 * Displays a single chat message (user or assistant) with appropriate styling.
 * User messages: right-aligned, accent color background
 * Assistant messages: left-aligned, card background, Claude avatar
 */
import { View, Text, StyleSheet } from 'react-native'
import { memo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { ChatMessage } from '@/types/api'

interface ChatBubbleProps {
  message: ChatMessage
}

/**
 * Format timestamp for display (e.g., "2:34 PM")
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Chat message bubble component
 */
function ChatBubbleComponent({ message }: ChatBubbleProps) {
  const { colors } = useTheme()
  const isUser = message.role === 'user'

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Claude avatar for assistant messages */}
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>C</Text>
        </View>
      )}

      {/* Message bubble */}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.accent : colors.card,
            maxWidth: '75%',
          },
        ]}
      >
        <Text
          style={[
            styles.content,
            {
              color: isUser ? '#fff' : colors.text,
            },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: isUser ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary,
            },
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
})

/**
 * Memoized ChatBubble to prevent unnecessary re-renders
 */
export const ChatBubble = memo(
  ChatBubbleComponent,
  (prev, next) => prev.message.id === next.message.id
)
