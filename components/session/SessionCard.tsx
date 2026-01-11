import React, { useCallback, memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Session } from '@/types/session'
import { SessionProgress } from './SessionProgress'
import { ModelBadge } from './ModelBadge'
import { StatusBadge } from '../ui/Badge'
import { useTheme } from '@/hooks/useTheme'
import { useRouter } from 'expo-router'

interface SessionCardProps {
  session: Session
}

function SessionCardComponent({ session }: SessionCardProps) {
  const { colors } = useTheme()
  const router = useRouter()

  const handlePress = useCallback(() => {
    router.push(`/sessions/${session.id}`)
  }, [router, session.id])

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Session: ${session.name}, ${session.status}, ${session.progress}% complete`}
      accessibilityHint="Double tap to view session details"
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {session.name}
        </Text>
        <ModelBadge model={session.model} />
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBadgeWrapper}>
          <StatusBadge status={session.status} />
        </View>
        <View style={styles.progressWrapper}>
          <Text style={[styles.progress, { color: colors.textPrimary }]}>{session.progress}%</Text>
        </View>
      </View>

      <SessionProgress progress={session.progress} />

      {session.currentTask && (
        <Text style={[styles.currentTask, { color: colors.textSecondary }]} numberOfLines={1}>
          {session.currentTask}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeWrapper: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  progressWrapper: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  progress: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentTask: {
    fontSize: 13,
    fontStyle: 'italic',
  },
})

/**
 * Memoized SessionCard to prevent unnecessary re-renders
 * Only re-renders when session ID, progress, status, or currentTask changes
 */
export const SessionCard = memo(
  SessionCardComponent,
  (prevProps, nextProps) =>
    prevProps.session.id === nextProps.session.id &&
    prevProps.session.progress === nextProps.session.progress &&
    prevProps.session.status === nextProps.session.status &&
    prevProps.session.currentTask === nextProps.session.currentTask
)
