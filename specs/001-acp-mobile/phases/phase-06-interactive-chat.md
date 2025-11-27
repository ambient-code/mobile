# Phase 6: Interactive Chat with Claude (User Story 4)

**Feature**: 001-acp-mobile
**Priority**: P2 (High Value)
**Tasks**: T056-T064 (9 tasks)
**Dependencies**: Phase 2 (Foundation) - Auth, API client, Theme
**Estimated Effort**: 2-3 days
**Status**: Not Started

## Overview

Enable users to have quick, interactive conversations with Claude directly from their phone through a modal chat interface. This provides lightweight AI assistance for ad-hoc questions, brainstorming, and troubleshooting without the overhead of creating a full coding session.

## User Story

> As a software engineer, I want to have quick interactive conversations with Claude from my phone so I can get immediate answers to questions, brainstorm ideas, or troubleshoot issues without starting a full session.

## Acceptance Criteria

1. ✅ "Interactive" quick action button opens chat modal
2. ✅ Can send messages and receive Claude responses
3. ✅ Conversation maintains context across multiple messages
4. ✅ Chat history persists and reloads on reopen

## Success Metrics

- **Performance**: Chat responses appear within 3 seconds (SC-005)
- **UX**: Modal opens instantly with smooth animation
- **Reliability**: Message history persists across app restarts
- **Context**: Claude maintains conversation context across 10+ messages

## Architecture Overview

### Component Structure

```
app/
  chat.tsx                           # Modal screen (pageSheet presentation)

components/chat/
  ChatBubble.tsx                     # Message display (user/assistant)
  ChatInput.tsx                      # Text input with send button
  ChatHeader.tsx                     # Header with status indicator

services/api/
  chat.ts                            # Chat API endpoints

hooks/
  useChat.ts                         # Chat state management

types/
  api.ts                             # ChatMessage, ChatThread types (already defined)
```

### Data Flow

```
User types message
    ↓
useChat.sendMessage()
    ↓
Optimistic UI update (add user message to state)
    ↓
POST /chat (threadId in body)
    ↓
Receive Claude response
    ↓
Update state with assistant message
    ↓
Persist to AsyncStorage cache
```

### State Management

**useChat Hook Responsibilities**:

- Maintain message array state
- Handle send message with optimistic updates
- Load chat history from cache on mount
- Manage loading/error states
- Auto-scroll to latest message

**AsyncStorage Cache Strategy**:

- Key: `chat:thread:{threadId}`
- Value: Serialized ChatThread object
- TTL: 7 days (conversations expire after a week)
- Max size: 100 messages per thread (FIFO if exceeded)

## Implementation Details

### T056: Chat API Service

**File**: `services/api/chat.ts`

**Interface**:

```typescript
export interface SendMessageRequest {
  threadId: string | null // null creates new thread
  message: string
}

export interface SendMessageResponse {
  message: ChatMessage // Claude's response
  threadId: string
}

export interface ChatHistoryResponse {
  messages: ChatMessage[]
  threadId: string
}

export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>

export async function getChatHistory(threadId: string): Promise<ChatHistoryResponse>
```

**Implementation Notes**:

- Use client.ts HTTP client with auth headers
- POST /chat endpoint accepts threadId + message
- Response includes Claude's message + threadId
- GET /chat/{threadId} returns full conversation history
- Handle 404 on history fetch (new conversation)
- Timeout: 10s (Claude responses may take 2-3s)

**Error Handling**:

- 400: Invalid message (empty, too long)
- 401: Auth failure (trigger re-login)
- 429: Rate limit (show "Too many requests, try again in 1 minute")
- 503: Claude unavailable (show "Claude is temporarily unavailable")

---

### T057: useChat Hook

**File**: `hooks/useChat.ts`

**Interface**:

```typescript
export interface UseChatResult {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (text: string) => Promise<void>
  clearError: () => void
  threadId: string | null
}

export function useChat(): UseChatResult
```

**State Management**:

```typescript
const [messages, setMessages] = useState<ChatMessage[]>([])
const [threadId, setThreadId] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Load History on Mount**:

```typescript
useEffect(() => {
  loadChatHistory()
}, [])

async function loadChatHistory() {
  // Try to load last thread from AsyncStorage
  const lastThreadId = await AsyncStorage.getItem('chat:lastThreadId')
  if (!lastThreadId) return

  try {
    const history = await getChatHistory(lastThreadId)
    setMessages(history.messages)
    setThreadId(lastThreadId)
  } catch (error) {
    // History not found or expired, start fresh
    console.log('No existing chat history')
  }
}
```

**Send Message Flow**:

```typescript
async function sendMessage(text: string) {
  if (!text.trim()) return

  // Optimistic update: add user message immediately
  const userMessage: ChatMessage = {
    id: `temp-${Date.now()}`,
    threadId: threadId || 'new',
    role: 'user',
    content: text.trim(),
    timestamp: new Date(),
  }
  setMessages((prev) => [...prev, userMessage])
  setIsLoading(true)
  setError(null)

  try {
    const response = await sendMessage({
      threadId,
      message: text.trim(),
    })

    // Replace temp message with real one + add Claude response
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== userMessage.id),
      { ...userMessage, id: response.message.id }, // Real user message
      response.message, // Claude response
    ])

    setThreadId(response.threadId)
    await persistChatHistory(response.threadId, messages)
  } catch (err) {
    // Remove optimistic message on failure
    setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    setError(err.message || 'Failed to send message')
  } finally {
    setIsLoading(false)
  }
}
```

**Persistence Helper**:

```typescript
async function persistChatHistory(threadId: string, messages: ChatMessage[]) {
  await AsyncStorage.setItem('chat:lastThreadId', threadId)
  await AsyncStorage.setItem(
    `chat:thread:${threadId}`,
    JSON.stringify({
      id: threadId,
      messages,
      updatedAt: new Date().toISOString(),
    })
  )
}
```

---

### T058: ChatBubble Component

**File**: `components/chat/ChatBubble.tsx`

**Props**:

```typescript
interface ChatBubbleProps {
  message: ChatMessage
}
```

**Design Specifications**:

**User Message**:

- Alignment: Right
- Background: Purple (#8B5CF6)
- Text color: White
- Border radius: 16px (top-left, top-right, bottom-left), 4px (bottom-right)
- Padding: 12px 16px
- Max width: 75% of screen width
- Font: System 16px
- Avatar: None (or small user avatar on right side)

**Assistant Message**:

- Alignment: Left
- Background: Light gray (#F3F4F6 light theme) / Dark gray (#374151 dark theme)
- Text color: Black / White (theme-dependent)
- Border radius: 16px (top-left, top-right, bottom-right), 4px (bottom-left)
- Padding: 12px 16px
- Max width: 75% of screen width
- Font: System 16px
- Avatar: Claude icon (small circle, 24px) on left side
- Label: "Claude" above bubble (12px gray text)

**Timestamp**:

- Position: Below bubble, aligned to bubble direction
- Format: "10:23 AM" (relative for today, absolute otherwise)
- Color: Gray (#9CA3AF)
- Font: System 12px

**Implementation Example**:

```typescript
export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const { theme } = useTheme()

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <ClaudeAvatar size={24} />
        </View>
      )}
      <View style={styles.bubbleWrapper}>
        {!isUser && <Text style={styles.label}>Claude</Text>}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.text, isUser && styles.userText]}>
            {message.content}
          </Text>
        </View>
        <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>
    </View>
  )
}
```

**Markdown Support** (Future Enhancement):

- For MVP, render plain text
- Future: Use `react-native-markdown-display` for code blocks, links, formatting

---

### T059: ChatInput Component

**File**: `components/chat/ChatInput.tsx`

**Props**:

```typescript
interface ChatInputProps {
  onSend: (text: string) => void
  isLoading: boolean
}
```

**Design Specifications**:

- Container: Fixed at bottom, above keyboard
- Background: White (light) / Dark gray (#1F2937) (dark theme)
- Border top: 1px solid #E5E7EB (light) / #374151 (dark)
- Height: 56px (auto-expands to 120px max for multiline)
- Padding: 8px 16px

**Text Input**:

- Placeholder: "Ask Claude anything..."
- Font: System 16px
- Background: Light gray (#F3F4F6) (light) / #374151 (dark)
- Border radius: 20px
- Padding: 12px 48px 12px 16px (right padding for send button)
- Multiline: true
- Max height: 96px (4 lines)
- Auto-focus on modal open

**Send Button**:

- Position: Absolute, right 8px, bottom 8px (inside text input)
- Icon: Arrow up (↑) from @expo/vector-icons (Ionicons: "arrow-up")
- Background: Purple (#8B5CF6) when text present, gray (#D1D5DB) when empty
- Size: 32px circle
- Disabled: When text empty or isLoading
- Loading state: Show spinner instead of arrow

**Implementation Example**:

```typescript
export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    // Auto-focus on mount
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleSend = () => {
    if (!text.trim() || isLoading) return
    onSend(text.trim())
    setText('')
  }

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Ask Claude anything..."
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={2000}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!text.trim() || isLoading) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!text.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="arrow-up" size={20} color="white" />
        )}
      </TouchableOpacity>
    </View>
  )
}
```

**Keyboard Handling**:

- Use `KeyboardAvoidingView` in parent (chat.tsx) to push modal up
- Use `react-native-keyboard-controller` for smooth animations (optional enhancement)

---

### T060: ChatHeader Component

**File**: `components/chat/ChatHeader.tsx`

**Props**:

```typescript
interface ChatHeaderProps {
  onClose: () => void
  onMore?: () => void // Future: Options menu
}
```

**Design Specifications**:

**Layout**:

- Height: 64px
- Background: White (light) / Dark gray (#1F2937) (dark)
- Border bottom: 1px solid #E5E7EB (light) / #374151 (dark)

**Left Section**:

- Close button (X icon, 24px)
- Padding: 20px left

**Center Section**:

- Title: "Claude" (18px semibold)
- Subtitle: "sonnet-4.5" (14px gray) with green status dot
- Vertical alignment: Center

**Right Section**:

- More button (three dots, 24px) - Future enhancement
- Padding: 20px right

**Status Indicator**:

- Green dot (8px circle, #10B981) next to subtitle
- Indicates Claude is available
- Future: Show "Thinking..." when isLoading

**Implementation Example**:

```typescript
export default function ChatHeader({ onClose, onMore }: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#6B7280" />
      </TouchableOpacity>

      <View style={styles.centerContent}>
        <Text style={styles.title}>Claude</Text>
        <View style={styles.subtitleRow}>
          <View style={styles.statusDot} />
          <Text style={styles.subtitle}>sonnet-4.5</Text>
        </View>
      </View>

      {onMore && (
        <TouchableOpacity style={styles.moreButton} onPress={onMore}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  )
}
```

---

### T061: Interactive Chat Modal Screen

**File**: `app/chat.tsx`

**Presentation Style**: `pageSheet` (iOS) / `modal` (Android)

- Swipe down to close (iOS)
- Back button dismisses (Android)
- Transparent background with blur effect behind

**Layout Structure**:

```typescript
export default function ChatModal() {
  const router = useRouter()
  const { messages, isLoading, error, sendMessage, clearError } = useChat()
  const flatListRef = useRef<FlatList>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })
    }
  }, [messages.length])

  const handleClose = () => {
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader onClose={handleClose} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={<EmptyState />}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Claude can make mistakes. Verify important information.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
```

**EmptyState Component** (inline):

```typescript
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <ClaudeAvatar size={64} />
      <Text style={styles.emptyTitle}>Ask Claude anything</Text>
      <Text style={styles.emptySubtitle}>
        Get quick answers, brainstorm ideas, or troubleshoot issues
      </Text>
    </View>
  )
}
```

**Router Configuration**:

- Add `presentation: 'modal'` in Expo Router metadata
- Use `router.push('/chat')` to open from anywhere

---

### T062: Dashboard Quick Action Button

**File**: `app/(tabs)/index.tsx` (modification)

**Add to Dashboard**:

```typescript
// In Quick Actions section (after "Sessions" and "Notifications" buttons)
<TouchableOpacity
  style={styles.quickActionButton}
  onPress={() => router.push('/chat')}
>
  <View style={styles.quickActionIcon}>
    <Ionicons name="chatbubble-ellipses" size={24} color="#8B5CF6" />
  </View>
  <Text style={styles.quickActionLabel}>Interactive</Text>
  <Text style={styles.quickActionSubtitle}>Chat with Claude</Text>
</TouchableOpacity>
```

**Button Design**:

- Same style as existing quick actions
- Icon: Chat bubble with ellipses (Ionicons: "chatbubble-ellipses")
- Color: Purple (#8B5CF6)
- Label: "Interactive"
- Subtitle: "Chat with Claude"

**Alternative Placement Options**:

1. Floating button in header (next to avatar)
2. Tab bar item (if using bottom tabs)
3. Context menu from session details ("Ask Claude about this session")

For MVP, use **Option 1**: Quick action button on dashboard.

---

### T063: Send Message Flow Implementation

**Component**: `hooks/useChat.ts` (already covered in T057)

**Optimistic Update Strategy**:

1. **Immediate UI Update**:
   - Add user message to state instantly
   - Show message in chat bubble
   - Disable send button (loading state)

2. **API Call**:
   - POST /chat with threadId + message
   - Show loading indicator in input
   - Timeout after 10s (show error)

3. **Success**:
   - Replace temp user message with real one (has server ID)
   - Append Claude's response
   - Re-enable send button
   - Persist to AsyncStorage
   - Auto-scroll to bottom

4. **Failure**:
   - Remove optimistic user message
   - Show error banner ("Failed to send message. Try again.")
   - Re-enable send button
   - Keep input text (user can retry)

**Error Scenarios**:

| Error                  | User Experience                                         |
| ---------------------- | ------------------------------------------------------- |
| Network timeout        | "Message timed out. Check connection and try again."    |
| 429 Rate limit         | "Too many requests. Please wait 1 minute."              |
| 503 Claude unavailable | "Claude is temporarily unavailable. Try again shortly." |
| 401 Unauthorized       | Redirect to login, preserve message draft               |

**Retry Logic**:

- Show "Retry" button in error banner
- Keep failed message text in input
- User can edit and resend

---

### T064: Chat History Loading

**Component**: `hooks/useChat.ts` (already covered in T057)

**AsyncStorage Schema**:

```typescript
// Key: 'chat:lastThreadId'
// Value: string (threadId)

// Key: 'chat:thread:{threadId}'
// Value: JSON string of ChatThread
interface CachedChatThread {
  id: string
  messages: ChatMessage[]
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
```

**Load Flow**:

1. **On Modal Open** (useEffect in useChat):
   - Read `chat:lastThreadId` from AsyncStorage
   - If exists, load `chat:thread:{threadId}`
   - Deserialize messages (convert timestamp strings to Date)
   - Set messages state
   - Set threadId state

2. **Cache Miss** (no history):
   - Start with empty messages array
   - threadId is null
   - Show empty state

3. **Cache Expiration**:
   - Check `updatedAt` timestamp
   - If older than 7 days, clear cache and start fresh
   - Prevent stale conversations from persisting

**Pruning Old Threads**:

```typescript
// On app launch (in _layout.tsx)
async function pruneChatCache() {
  const keys = await AsyncStorage.getAllKeys()
  const chatKeys = keys.filter((k) => k.startsWith('chat:thread:'))

  for (const key of chatKeys) {
    const thread = JSON.parse(await AsyncStorage.getItem(key))
    const age = Date.now() - new Date(thread.updatedAt).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    if (age > sevenDays) {
      await AsyncStorage.removeItem(key)
    }
  }
}
```

**Message Limit**:

- Max 100 messages per thread
- When exceeding, remove oldest messages (FIFO)
- Keep last 100 messages in cache
- Server should handle full history (mobile only caches recent)

---

## Testing Strategy

### Unit Tests

**services/api/chat.test.ts**:

- ✅ sendMessage() sends correct request format
- ✅ sendMessage() handles 400/401/429/503 errors
- ✅ getChatHistory() returns message array
- ✅ getChatHistory() handles 404 (new thread)

**hooks/useChat.test.ts**:

- ✅ Loads history from AsyncStorage on mount
- ✅ sendMessage() adds optimistic user message
- ✅ sendMessage() updates with server response
- ✅ sendMessage() removes optimistic message on error
- ✅ Persists messages to AsyncStorage after send
- ✅ Handles empty cache (new conversation)

**components/chat/ChatBubble.test.tsx**:

- ✅ Renders user message with correct styling
- ✅ Renders assistant message with avatar
- ✅ Formats timestamp correctly
- ✅ Applies theme colors correctly

**components/chat/ChatInput.test.tsx**:

- ✅ Calls onSend with trimmed text
- ✅ Clears input after send
- ✅ Disables send button when empty
- ✅ Disables send button when loading
- ✅ Shows spinner when loading

### Integration Tests

**app/chat.test.tsx**:

- ✅ Modal opens with empty state
- ✅ User can send message and receive response
- ✅ Messages persist and reload on reopen
- ✅ Error banner appears on send failure
- ✅ Close button dismisses modal

### E2E Tests (Maestro)

**tests/e2e/chat.yaml**:

```yaml
appId: com.acp.mobile
---
- launchApp
- tapOn: 'Interactive'
- assertVisible: 'Ask Claude anything'
- inputText: 'What is React Native?'
- tapOn:
    id: 'send-button'
- assertVisible:
    text: 'React Native'
    timeout: 5000
- tapOn:
    id: 'close-button'
- assertNotVisible: 'Ask Claude anything'
```

### Manual Test Cases

1. **Happy Path**:
   - Open chat → type message → send → receive response → verify context maintained

2. **Offline**:
   - Disable network → try to send → verify error message

3. **History Persistence**:
   - Send 3 messages → close modal → reopen → verify messages still there

4. **Long Conversation**:
   - Send 10+ messages → verify scrolling works → verify old messages visible

5. **Error Recovery**:
   - Trigger 429 error → verify retry works → verify message not lost

---

## Performance Optimization

### Response Time

**Target**: <3s for Claude responses (SC-005)

**Optimizations**:

- Optimistic UI updates (instant user message)
- Show typing indicator after 1s (future enhancement)
- Timeout requests after 10s
- Use streaming responses (future enhancement via SSE)

### Memory Management

**Message Limit**: 100 messages per thread in memory

- FlatList renders only visible messages (built-in virtualization)
- Prune old messages from cache every 7 days
- Lazy load history (only load last thread on mount)

### Network Efficiency

**Caching**:

- AsyncStorage for history (avoid re-fetching)
- No polling (chat is request/response only)
- Compress message content if >1KB (future)

**Payload Size**:

- Send only message text, not full ChatMessage object
- Receive only new messages, not full history
- Max message length: 2000 characters

---

## Security Considerations

### Input Validation

**Client-side**:

- Max length: 2000 characters
- Trim whitespace
- Reject empty messages
- Sanitize before display (prevent XSS if rendering HTML)

**Server-side** (backend requirement):

- Validate message content
- Rate limit: 10 messages per minute per user
- Content filtering (profanity, abuse detection)

### Authentication

- All API calls use Bearer token from auth context
- Handle 401 by refreshing token or redirecting to login
- Preserve message draft when re-authenticating

### Privacy

- Messages stored locally in AsyncStorage (unencrypted)
- No message logging on device (only cache)
- Clear chat option in settings (future enhancement)
- No analytics on message content

---

## Accessibility

### VoiceOver / TalkBack Support

- ChatBubble: Label messages with role ("You: message text", "Claude: response text")
- ChatInput: Label as "Message input field"
- Send button: Label as "Send message"
- Close button: Label as "Close chat"

### Keyboard Navigation

- Tab order: Close button → message list → input field → send button
- Enter key sends message (Shift+Enter for new line)

### Contrast

- Meet WCAG AA standards (4.5:1 for text)
- Purple send button on white background: Verify contrast ratio
- Gray text on light background: Ensure readability

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Streaming Responses**: Use SSE for real-time Claude responses (see `.claude/skills/sse-react-query-sync/` for implementation guide)
2. **Typing Indicator**: Show "Claude is typing..." while waiting for response
3. **Markdown Rendering**: Support code blocks, links, formatting in messages
4. **Message Actions**: Copy, share, delete individual messages
5. **Context Loading**: Pre-load session context when opening chat from session detail
6. **Voice Input**: Dictation support for hands-free messaging
7. **Multiple Threads**: Support multiple conversation threads with switching
8. **Search**: Search chat history for keywords
9. **Export**: Export conversation as text/PDF

### Backend Enhancements Needed

1. **Message History Pagination**: GET /chat/{threadId}?limit=50&offset=0
2. **Thread Management**: POST /chat/threads (create named threads)
3. **Delete Thread**: DELETE /chat/{threadId}
4. **Streaming**: SSE endpoint for token-by-token responses

---

## Implementation Checklist

### Data Layer (T056-T057)

- [ ] T056: Implement chat API service (services/api/chat.ts)
  - [ ] sendMessage() function
  - [ ] getChatHistory() function
  - [ ] Error handling for 400/401/429/503
  - [ ] Request/response type definitions
  - [ ] Unit tests

- [ ] T057: Create useChat hook (hooks/useChat.ts)
  - [ ] State management (messages, threadId, loading, error)
  - [ ] loadChatHistory() on mount
  - [ ] sendMessage() with optimistic updates
  - [ ] persistChatHistory() helper
  - [ ] clearError() function
  - [ ] Unit tests

### UI Components (T058-T060)

- [ ] T058: Create ChatBubble component (components/chat/ChatBubble.tsx)
  - [ ] User message styling (right-aligned, purple)
  - [ ] Assistant message styling (left-aligned, gray, avatar)
  - [ ] Timestamp formatting
  - [ ] Theme support
  - [ ] Unit tests

- [ ] T059: Create ChatInput component (components/chat/ChatInput.tsx)
  - [ ] Text input with multiline support
  - [ ] Send button with arrow icon
  - [ ] Loading state (spinner)
  - [ ] Auto-focus on mount
  - [ ] Disabled state when empty/loading
  - [ ] Unit tests

- [ ] T060: Create ChatHeader component (components/chat/ChatHeader.tsx)
  - [ ] Close button
  - [ ] Title ("Claude") and subtitle ("sonnet-4.5")
  - [ ] Status indicator (green dot)
  - [ ] More button (future)
  - [ ] Unit tests

### Screens & Integration (T061-T064)

- [ ] T061: Implement Interactive Chat modal (app/chat.tsx)
  - [ ] PageSheet presentation style
  - [ ] ChatHeader integration
  - [ ] FlatList with ChatBubble
  - [ ] ChatInput integration
  - [ ] KeyboardAvoidingView
  - [ ] EmptyState component
  - [ ] Error banner
  - [ ] Disclaimer text
  - [ ] Auto-scroll to bottom
  - [ ] Integration tests

- [ ] T062: Add "Interactive" quick action button to Dashboard (app/(tabs)/index.tsx)
  - [ ] Button component
  - [ ] Navigation to /chat
  - [ ] Icon and styling

- [ ] T063: Implement send message flow (covered in T057)
  - [ ] Optimistic UI update
  - [ ] API call handling
  - [ ] Success state (append response)
  - [ ] Error state (remove optimistic message)
  - [ ] Retry logic

- [ ] T064: Implement chat history loading (covered in T057)
  - [ ] Load lastThreadId from AsyncStorage
  - [ ] Load thread messages
  - [ ] Handle cache miss
  - [ ] Prune expired threads (7 days)
  - [ ] Message limit (100 per thread)

### Testing

- [ ] Unit tests for all components
- [ ] Unit tests for useChat hook
- [ ] Unit tests for chat API service
- [ ] Integration tests for chat modal
- [ ] E2E test: Open chat, send message, close
- [ ] Manual testing: Offline behavior
- [ ] Manual testing: History persistence

### Documentation

- [ ] Update quickstart.md with chat feature
- [ ] Add chat API docs to contracts/acp-api.yaml (already exists)
- [ ] Update CLAUDE.md with chat-related context

---

## Dependencies

### NPM Packages (Existing)

- `react-native`: Core framework
- `expo-router`: Navigation (already handles modal presentation)
- `@expo/vector-icons`: Icons (arrow-up, close, etc.)
- `@react-native-async-storage/async-storage`: Chat history cache

### No New Dependencies Needed

All required functionality is available with existing packages.

**Future Enhancement Dependencies**:

- `react-native-markdown-display`: Markdown rendering (Phase 2)
- `react-native-keyboard-controller`: Smooth keyboard animations (Phase 2)

---

## Risks & Mitigations

| Risk                          | Impact                 | Mitigation                                             |
| ----------------------------- | ---------------------- | ------------------------------------------------------ |
| Claude API latency >3s        | Poor UX                | Show typing indicator, implement streaming (Phase 2)   |
| Network failures              | Failed messages        | Optimistic updates, clear error messages, retry button |
| Chat history cache corruption | Lost conversations     | Validate cache on load, fallback to empty state        |
| Message content XSS           | Security vulnerability | Sanitize input, plain text only in MVP                 |
| AsyncStorage quota exceeded   | App crashes            | Prune old threads, 100 message limit per thread        |

---

## Success Criteria

### Functional

- ✅ User can open chat modal from dashboard
- ✅ User can send messages and receive responses
- ✅ Conversation context maintained across 10+ messages
- ✅ Chat history persists across app restarts

### Non-Functional

- ✅ Response time <3s (SC-005)
- ✅ Modal opens instantly (<100ms)
- ✅ No memory leaks with 100+ messages
- ✅ Works offline (shows error gracefully)

### User Experience

- ✅ Chat feels instant (optimistic updates)
- ✅ Keyboard handling is smooth
- ✅ Errors are clear and actionable
- ✅ Empty state is inviting and helpful

---

## Phase Completion Criteria

Phase 6 is **COMPLETE** when:

1. All 9 tasks (T056-T064) are checked off
2. All unit tests pass (>80% coverage)
3. E2E test passes (chat.yaml)
4. Manual testing confirms:
   - Can send/receive messages
   - History persists across sessions
   - Errors handled gracefully
   - Performance meets targets (<3s responses)
5. Code reviewed and merged to main branch
6. Documentation updated (quickstart.md, CLAUDE.md)

---

## Quick Start (For Developers)

### Run This Phase

```bash
# Ensure Phase 2 (Foundation) is complete
npm start

# Test on iOS simulator
npm run ios

# Test chat feature
# 1. Tap "Interactive" button on dashboard
# 2. Send a test message: "Hello Claude"
# 3. Verify response appears within 3 seconds
# 4. Close and reopen chat
# 5. Verify message history persists
```

### Key Files to Implement

1. `services/api/chat.ts` - API integration
2. `hooks/useChat.ts` - State management
3. `components/chat/ChatBubble.tsx` - Message display
4. `components/chat/ChatInput.tsx` - Input field
5. `components/chat/ChatHeader.tsx` - Modal header
6. `app/chat.tsx` - Main chat screen
7. `app/(tabs)/index.tsx` - Add quick action button

### Testing

```bash
# Run unit tests
npm test -- chat

# Run E2E test
maestro test tests/e2e/chat.yaml
```

---

**Next Phase**: Phase 7 - User Story 5 (Start New AI Sessions)
