/**
 * ChatInput Component
 *
 * Text input for sending chat messages with send button.
 * Features:
 * - Multi-line input with automatic growth
 * - Send button (arrow.up icon) enabled only when text present
 * - 4000 character limit
 * - Disabled state during message sending
 */
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

const MAX_MESSAGE_LENGTH = 4000

/**
 * Chat input with send button
 */
export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const { colors } = useTheme()
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setText('')
    }
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <View
      style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}
    >
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Message Claude..."
        placeholderTextColor={colors.textSecondary}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={MAX_MESSAGE_LENGTH}
        editable={!disabled}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor: canSend ? colors.accent : colors.border,
          },
        ]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}
      >
        <IconSymbol name="arrow.up" size={20} color={canSend ? '#fff' : colors.textSecondary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 40,
    maxHeight: 120, // ~5 lines
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
})
