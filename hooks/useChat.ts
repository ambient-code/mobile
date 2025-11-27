/**
 * useChat Hook
 *
 * Manages chat state, message sending, and history persistence for Claude interactive chat.
 * Uses React Query for state management with optimistic updates and auto-retry logic.
 */
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatAPI } from '@/services/api/chat'
import { CacheService } from '@/services/storage/cache'
import { errorHandler } from '@/utils/errorHandler'
import type { ChatMessage } from '@/types/api'

/**
 * Chat history cache key
 */
const CHAT_HISTORY_KEY = 'chat_history'

/**
 * Generate a unique thread ID for the chat session
 */
function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * useChat return type
 */
export interface UseChatReturn {
  /** All chat messages in order */
  messages: ChatMessage[]
  /** True if loading history from cache */
  isLoading: boolean
  /** True if currently sending a message */
  isSending: boolean
  /** Send a user message and get Claude's response */
  sendMessage: (content: string) => void
  /** Clear all chat history */
  clearHistory: () => Promise<void>
  /** Last error that occurred, if any */
  error: Error | null
  /** Thread ID for this chat session */
  threadId: string
}

/**
 * Chat hook with optimistic updates and persistence
 */
export function useChat(): UseChatReturn {
  const queryClient = useQueryClient()

  // Generate thread ID on first mount (persists for component lifetime)
  const [threadId] = useState(() => generateThreadId())

  // Load chat history from AsyncStorage
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat', threadId],
    queryFn: async (): Promise<ChatMessage[]> => {
      // Load from AsyncStorage (no TTL - persists indefinitely)
      const cached = await CacheService.get<ChatMessage[]>(CHAT_HISTORY_KEY)
      return cached || []
    },
    staleTime: Infinity, // Never auto-refetch (local-first)
    gcTime: Infinity, // Keep in memory indefinitely
  })

  // Send message mutation with optimistic updates
  const {
    mutate: sendMessage,
    isPending: isSending,
    error,
  } = useMutation({
    mutationFn: async (content: string): Promise<ChatMessage> => {
      return ChatAPI.sendMessage(threadId, content)
    },

    // Auto-retry failed requests once (user preference)
    retry: 1,
    retryDelay: 1000,

    onMutate: async (content: string) => {
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['chat', threadId] })

      // Snapshot previous state for rollback
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['chat', threadId])

      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        threadId,
        role: 'user',
        content,
        timestamp: new Date(),
      }

      // Update cache with optimistic user message
      queryClient.setQueryData<ChatMessage[]>(['chat', threadId], (old = []) => [
        ...old,
        userMessage,
      ])

      return { previousMessages }
    },

    onSuccess: async (assistantMessage: ChatMessage, content: string) => {
      // Append assistant response to messages
      queryClient.setQueryData<ChatMessage[]>(['chat', threadId], (old = []) => [
        ...old,
        assistantMessage,
      ])

      // Persist to AsyncStorage
      const updatedMessages = queryClient.getQueryData<ChatMessage[]>(['chat', threadId])
      if (updatedMessages) {
        await CacheService.set(CHAT_HISTORY_KEY, updatedMessages, Infinity)
      }
    },

    onError: (err, content, context) => {
      // Rollback optimistic update after retry fails
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', threadId], context.previousMessages)
      }

      // Report error for monitoring
      errorHandler.reportError(err as Error, {
        source: 'Chat',
        extra: { threadId, messageLength: content.length },
      })
    },
  })

  // Clear chat history
  const clearHistory = useCallback(async () => {
    // Clear in-memory cache
    queryClient.setQueryData(['chat', threadId], [])

    // Clear AsyncStorage
    await CacheService.remove(CHAT_HISTORY_KEY)
  }, [queryClient, threadId])

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    clearHistory,
    error: error as Error | null,
    threadId,
  }
}
