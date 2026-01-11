import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TOKENS } from '@/utils/constants'
import { ControlButton } from './ControlButton'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={64} color={TOKENS.textMuted} />

      <Text style={[styles.title, { color: TOKENS.textPrimary }]}>{title}</Text>

      <Text style={[styles.description, { color: TOKENS.textSecondary }]}>{description}</Text>

      {actionLabel && onAction && (
        <ControlButton label={actionLabel} onPress={onAction} style={styles.action} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TOKENS.spacing32,
    paddingVertical: TOKENS.spacing32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: TOKENS.spacing16,
    textAlign: 'center',
  },
  description: {
    fontSize: TOKENS.bodySize,
    marginTop: TOKENS.spacing8,
    textAlign: 'center',
    lineHeight: 24,
  },
  action: {
    marginTop: TOKENS.spacing24,
    minWidth: 200,
  },
})
