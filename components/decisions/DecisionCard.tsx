import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { PendingDecision } from '@/types/decisions'
import { useTheme } from '@/hooks/useTheme'
import { AgentAvatar } from '../ui/AgentAvatar'

interface DecisionCardProps {
  decision: PendingDecision
  onStartReview: () => void
}

export function DecisionCard({ decision, onStartReview }: DecisionCardProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <AgentAvatar agentName={decision.agentName} size="medium" />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            {decision.title}
          </Text>
          <Text style={[styles.context, { color: colors.textSecondary }]}>
            {decision.context} • ~{decision.estimatedMinutes} min
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onStartReview}
        accessibilityRole="button"
        accessibilityLabel={`Start review for ${decision.title}`}
        accessibilityHint="Opens 3-step review flow"
      >
        <Text style={styles.buttonText}>Start Review</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  context: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
