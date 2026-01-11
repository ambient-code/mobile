import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { useSessionDetail } from '@/hooks/useSessions'
import { useUpdateSession } from '@/hooks/useUpdateSession'
import { useToast } from '@/hooks/useToast'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

export default function SessionReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const { data: session, isLoading } = useSessionDetail(id!)
  const updateSession = useUpdateSession()
  const { showToast } = useToast()

  const [comments, setComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestChanges = async () => {
    if (!comments.trim()) {
      Alert.alert('Comment Required', 'Please add comments describing what needs to change.')
      return
    }

    setIsSubmitting(true)
    try {
      await updateSession.mutateAsync({
        id: id!,
        request: {
          action: 'reject',
          feedback: comments.trim(),
        },
      })

      trackEvent(TelemetryEvents.SESSION_REJECTED, {
        sessionId: id!,
        hasFeedback: true,
      })

      showToast({
        type: 'session',
        title: 'Changes Requested',
        message: 'Claude will address your feedback',
        sessionId: id!,
      })

      router.back()
    } catch {
      Alert.alert('Error', 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = () => {
    Alert.alert(
      'Approve Session?',
      'This will mark the session as complete and merge the changes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setIsSubmitting(true)
            try {
              await updateSession.mutateAsync({
                id: id!,
                request: { action: 'approve' },
              })

              trackEvent(TelemetryEvents.SESSION_APPROVED, {
                sessionId: id!,
              })

              showToast({
                type: 'success',
                title: 'Session Approved',
                message: `${session?.name} has been approved and marked complete`,
                sessionId: id!,
              })

              router.back()
            } catch {
              Alert.alert('Error', 'Failed to approve session. Please try again.')
            } finally {
              setIsSubmitting(false)
            }
          },
        },
      ]
    )
  }

  if (isLoading || !session) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        {/* Session Info */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sessionName, { color: colors.textPrimary }]}>{session.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Review the changes and provide feedback
          </Text>
        </View>

        {/* Tasks Completed */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Changes Made</Text>
          {session.tasksCompleted.map((task, index) => (
            <View key={index} style={styles.taskItem}>
              <Text style={[styles.bullet, { color: colors.success }]}>✓</Text>
              <Text style={[styles.taskText, { color: colors.textPrimary }]}>{task}</Text>
            </View>
          ))}
        </View>

        {/* Comment Box */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Feedback</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Add comments to guide the next iteration. Be specific about what needs to change.
          </Text>
          <TextInput
            style={[
              styles.commentInput,
              { backgroundColor: colors.bg, color: colors.textPrimary, borderColor: colors.border },
            ]}
            placeholder="e.g., 'Please add error handling for the API call' or 'The button color should match our brand'"
            placeholderTextColor={colors.textSecondary}
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              { backgroundColor: colors.warning },
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleRequestChanges}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Request Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: colors.success, backgroundColor: 'transparent' },
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleApprove}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, { color: colors.success }]}>Approve & Merge</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {},
  secondaryButton: {
    borderWidth: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
