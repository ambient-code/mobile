/**
 * Chat API Service
 *
 * Provides methods for interacting with Claude chat.
 * Currently uses mock data for development - real API integration deferred to future phase.
 */
import { apiClient } from './client'
import type { ChatMessage } from '@/types/api'
import { chatMessageSchema, validateResponse } from './schemas'
import { z } from 'zod'

// Feature flag for mock data (always true for Phase 6)
const USE_MOCK_DATA = true

/**
 * Mock responses for development
 */
const MOCK_RESPONSES = [
  "I'm Claude, an AI assistant. I can help you with coding questions, explanations, debugging, and more. What would you like to know?",
  "That's a great question! Let me help you with that.",
  'React Native is a framework for building native mobile applications using React and JavaScript. It allows you to write code once and deploy to both iOS and Android platforms.',
  "I'd be happy to explain that concept. Could you provide more context about what you're working on?",
  'Here are a few approaches you could consider for solving that problem...',
  "That's an interesting challenge. Let's break it down step by step.",
  'Based on what you described, I recommend...',
  "I understand what you're asking. Here's how that works...",
]

/**
 * Get a contextual mock response based on the user's message
 */
function getMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  // React Native specific
  if (lowerMessage.includes('react native') || lowerMessage.includes('react-native')) {
    return 'React Native is a popular framework for building cross-platform mobile applications. It uses React components and compiles to native iOS and Android code. Key features include hot reloading, a large ecosystem of libraries, and the ability to share code between platforms while still accessing native APIs when needed.'
  }

  // TypeScript specific
  if (lowerMessage.includes('typescript')) {
    return 'TypeScript is a statically typed superset of JavaScript that compiles to plain JavaScript. It adds optional type annotations, interfaces, and advanced IDE support. In React Native projects, TypeScript helps catch errors early, improves code maintainability, and provides better autocomplete and refactoring tools.'
  }

  // Expo specific
  if (lowerMessage.includes('expo')) {
    return 'Expo is a framework and platform for universal React applications. It provides a set of tools and services built around React Native, including a development server, build service, and over-the-air updates. Expo SDK 52 includes pre-configured libraries for common features like camera, location, notifications, and more.'
  }

  // Questions about errors or debugging
  if (
    lowerMessage.includes('error') ||
    lowerMessage.includes('bug') ||
    lowerMessage.includes('fix') ||
    lowerMessage.includes('problem')
  ) {
    return "I'd be happy to help debug that issue. Could you provide more details about the error message, when it occurs, and what you've already tried? Understanding the context will help me give you a more specific solution."
  }

  // How-to questions
  if (
    lowerMessage.includes('how') &&
    (lowerMessage.includes('do') || lowerMessage.includes('can'))
  ) {
    return "Great question! Here's how you can approach that: First, make sure you have the necessary dependencies installed. Then, follow the pattern used in similar components in your codebase for consistency. Would you like me to walk through a specific example?"
  }

  // Default responses
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
}

/**
 * Simulate API latency
 */
async function simulateLatency(ms: number = 1500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Chat API methods
 */
export class ChatAPI {
  /**
   * Send a message to Claude and get a response
   *
   * @param threadId - The conversation thread ID
   * @param content - The user's message content
   * @returns The assistant's response message
   */
  static async sendMessage(threadId: string, content: string): Promise<ChatMessage> {
    if (USE_MOCK_DATA) {
      // Simulate API latency (1-2 seconds)
      await simulateLatency(1000 + Math.random() * 1000)

      // Generate mock assistant response
      const mockResponse: ChatMessage = {
        id: generateMessageId(),
        threadId,
        role: 'assistant',
        content: getMockResponse(content),
        timestamp: new Date(),
      }

      return mockResponse
    }

    // Real API implementation (deferred to future phase)
    const response = await apiClient.post<unknown>('/chat/messages', {
      threadId,
      content,
    })

    return validateResponse<ChatMessage>(chatMessageSchema, response)
  }

  /**
   * Get chat history for a thread
   *
   * Note: In Phase 6, history is managed locally via AsyncStorage.
   * This method is primarily for potential server-side history sync in the future.
   *
   * @param threadId - The conversation thread ID
   * @returns Array of chat messages
   */
  static async getChatHistory(threadId: string): Promise<ChatMessage[]> {
    if (USE_MOCK_DATA) {
      // For Phase 6, history is managed locally
      // Return empty array as server doesn't have history
      return []
    }

    // Real API implementation (deferred to future phase)
    const response = await apiClient.get<unknown>(`/chat/threads/${threadId}/messages`)

    const messagesSchema = z.array(chatMessageSchema)
    return validateResponse<ChatMessage[]>(messagesSchema, response)
  }
}
