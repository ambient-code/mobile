import React, { useEffect, useRef, useCallback, memo } from 'react'
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native'
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
  const progressFlashAnim = useRef(new Animated.Value(0)).current
  const statusFlashAnim = useRef(new Animated.Value(0)).current
  const prevProgressRef = useRef(session.progress)
  const prevStatusRef = useRef(session.status)

  // Detect progress changes and trigger flash animation
  useEffect(() => {
    if (prevProgressRef.current !== session.progress) {
      // Progress changed - trigger flash animation

      // Flash animation: 0 -> 1 (inverted) -> 0 (normal) over 3 seconds
      Animated.sequence([
        Animated.timing(progressFlashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(progressFlashAnim, {
          toValue: 0,
          duration: 2850,
          useNativeDriver: false,
        }),
      ]).start()

      prevProgressRef.current = session.progress
    }
  }, [session.progress, progressFlashAnim, session.id])

  // Detect status changes and trigger flash animation
  useEffect(() => {
    if (prevStatusRef.current !== session.status) {
      // Status changed - trigger flash animation

      // Flash animation: 0 -> 1 (inverted) -> 0 (normal) over 3 seconds
      Animated.sequence([
        Animated.timing(statusFlashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(statusFlashAnim, {
          toValue: 0,
          duration: 2850,
          useNativeDriver: false,
        }),
      ]).start()

      prevStatusRef.current = session.status
    }
  }, [session.status, statusFlashAnim, session.id])

  const handlePress = useCallback(() => {
    router.push(`/sessions/${session.id}`)
  }, [router, session.id])

  // Progress text color animation
  const progressTextColor = progressFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, colors.card],
  })

  const progressBgColor = progressFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.text],
  })

  // Status badge flash animation (will wrap StatusBadge)
  const statusBgColor = statusFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.text],
  })

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
        <Animated.Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {session.name}
        </Animated.Text>
        <ModelBadge model={session.model} />
      </View>

      <View style={styles.statusRow}>
        <Animated.View
          style={[
            {
              backgroundColor: statusBgColor,
              borderRadius: 4,
              paddingHorizontal: 4,
              paddingVertical: 2,
            },
          ]}
        >
          <StatusBadge status={session.status} />
        </Animated.View>
        <Animated.View
          style={[
            styles.progressContainer,
            {
              backgroundColor: progressBgColor,
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
            },
          ]}
        >
          <Animated.Text style={[styles.progress, { color: progressTextColor }]}>
            {session.progress}%
          </Animated.Text>
        </Animated.View>
      </View>

      <SessionProgress progress={session.progress} />

      {session.currentTask && (
        <Animated.Text
          style={[styles.currentTask, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {session.currentTask}
        </Animated.Text>
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
  progressContainer: {
    // Container for progress percentage with flash effect
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
