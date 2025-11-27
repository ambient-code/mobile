/**
 * Chat Modal Screen
 *
 * Interactive chat with Claude for quick questions.
 * Features:
 * - Persistent chat history via AsyncStorage
 * - Optimistic UI updates
 * - Auto-scroll to bottom on new messages
 * - Empty state and loading indicators
 * - Keyboard handling for iOS/Android
 */
import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { useChat } from '@/hooks/useChat'
import { useOffline } from '@/hooks/useOffline'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { IconSymbol } from '@/components/ui/icon-symbol'

/**
 * Chat Modal Screen Component
 */
export default function ChatModal() {
  const { colors } = useTheme()
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)
  const { isOffline } = useOffline()

  // Chat state management
  const { messages, isLoading, isSending, sendMessage } = useChat()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages.length])

  const handleClose = () => {
    router.back()
  }

  const handleSend = (content: string) => {
    if (isOffline) {
      return // ChatInput component is already disabled when offline
    }
    sendMessage(content)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ChatHeader onClose={handleClose} />

      {/* Offline Banner */}
      {isOffline && <OfflineBanner />}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {/* Loading state */}
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : messages.length === 0 ? (
          /* Empty state */
          <View style={styles.centerContent}>
            <IconSymbol name="message.fill" size={56} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Ask Claude anything</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Your conversation will be saved locally
            </Text>
          </View>
        ) : (
          /* Message list */
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}

            {/* Typing indicator */}
            {isSending && (
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                  Claude is typing...
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Input area */}
        <View style={styles.inputContainer}>
          <ChatInput onSend={handleSend} disabled={isSending || isOffline} />

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            Claude can make mistakes. Verify important information.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  typingText: {
    fontSize: 14,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    borderTopWidth: 0,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.7,
  },
})
