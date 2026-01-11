/**
 * ChatHeader Component
 *
 * Header for the chat modal showing Claude status and controls.
 * Features:
 * - "Claude" title with green status dot (online indicator)
 * - "sonnet-4.5" subtitle (model badge)
 * - Close button (X icon)
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface ChatHeaderProps {
  onClose: () => void
}

/**
 * Chat modal header component
 */
export function ChatHeader({ onClose }: ChatHeaderProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}
    >
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Claude</Text>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>sonnet-4.5</Text>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
        <IconSymbol name="xmark" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
})
