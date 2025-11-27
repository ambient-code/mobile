import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import { useSessionDetail } from '@/hooks/useSessions'
import { SessionProgress } from '@/components/session/SessionProgress'
import { StatusBadge } from '@/components/ui/Badge'
import { ApprovalActions } from '@/components/session/ApprovalActions'
import { SessionStatus } from '@/types/session'

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const { data: session, isLoading, error } = useSessionDetail(id!)
  const [tasksExpanded, setTasksExpanded] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading session...
        </Text>
      </View>
    )
  }

  if (error || !session) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load session details
        </Text>
      </View>
    )
  }

  // Simplify model name
  const getSimpleModelName = (model: string) => {
    if (model.includes('sonnet')) return 'sonnet-4.5'
    if (model.includes('opus')) return 'opus-4.5'
    return model
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Header with Current Task */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>

        <View style={styles.metaRow}>
          <StatusBadge status={session.status} />
          <View style={[styles.modelBadge, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[styles.modelText, { color: colors.accent }]}>
              {getSimpleModelName(session.model)}
            </Text>
          </View>
        </View>

        {session.currentTask && (
          <View style={[styles.currentTaskBox, { backgroundColor: colors.bg }]}>
            <Text style={[styles.currentTaskLabel, { color: colors.textSecondary }]}>
              Currently working on:
            </Text>
            <Text style={[styles.currentTaskText, { color: colors.text }]}>
              {session.currentTask}
            </Text>
          </View>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progress</Text>
            <Text style={[styles.progressValue, { color: colors.accent }]}>
              {session.progress}%
            </Text>
          </View>
          <SessionProgress progress={session.progress} />
        </View>
      </View>

      {/* Error Message */}
      {session.errorMessage && session.status === SessionStatus.ERROR && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.error + '10', borderColor: colors.error, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.error }]}>Error</Text>
          <Text style={[styles.errorMessageText, { color: colors.error }]}>
            {session.errorMessage}
          </Text>
        </View>
      )}

      {/* Approval Actions - Only show for AWAITING_REVIEW status */}
      {session.status === SessionStatus.AWAITING_REVIEW && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.warning + '10',
              borderColor: colors.warning,
              borderWidth: 1,
              borderLeftWidth: 4,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Review Required</Text>
          <Text style={[styles.reviewPrompt, { color: colors.textSecondary }]}>
            This session has completed and is ready for your review.
          </Text>
          <ApprovalActions sessionId={session.id} sessionName={session.name} />
        </View>
      )}

      {/* Tasks Completed - Accordion */}
      {session.tasksCompleted.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setTasksExpanded(!tasksExpanded)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>
              Tasks Completed ({session.tasksCompleted.length})
            </Text>
            <Text style={[styles.accordionIcon, { color: colors.textSecondary }]}>
              {tasksExpanded ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {tasksExpanded && (
            <View style={styles.accordionContent}>
              {session.tasksCompleted.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <Text style={[styles.taskBullet, { color: colors.success }]}>✓</Text>
                  <Text style={[styles.taskItemText, { color: colors.textSecondary }]}>{task}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Details - Accordion */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setDetailsExpanded(!detailsExpanded)}
          activeOpacity={0.7}
        >
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Details</Text>
          <Text style={[styles.accordionIcon, { color: colors.textSecondary }]}>
            {detailsExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {detailsExpanded && (
          <View style={styles.accordionContent}>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                Repository:
              </Text>
              <Text style={[styles.metadataValue, { color: colors.accent }]}>
                {session.repository.name}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Branch:</Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>
                {session.repository.branch}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Workflow:</Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>
                {session.workflowType}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Created:</Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>
                {session.createdAt.toLocaleDateString()} at {session.createdAt.toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Updated:</Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>
                {session.updatedAt.toLocaleDateString()} at {session.updatedAt.toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentTaskBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentTaskLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentTaskText: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewPrompt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  accordionContent: {
    marginTop: 12,
  },
  taskItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  taskBullet: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    width: 100,
    fontWeight: '600',
  },
  metadataValue: {
    flex: 1,
    fontSize: 14,
  },
})
