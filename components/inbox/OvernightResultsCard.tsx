import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { OvernightResult } from '@/types/inbox'
import { useTheme } from '@/hooks/useTheme'
import { AgentAvatar } from '../ui/AgentAvatar'

interface OvernightResultsCardProps {
  results: OvernightResult[]
}

export function OvernightResultsCard({ results }: OvernightResultsCardProps) {
  const { colors } = useTheme()
  const displayResults = results.slice(0, 3) // Show max 3

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Overnight Results</Text>
      <View style={styles.results}>
        {displayResults.map((result, index) => (
          <View key={index} style={styles.resultRow}>
            <AgentAvatar agentName={result.agentName} size="small" />
            <Text style={[styles.task, { color: colors.text }]} numberOfLines={1}>
              {result.task}
            </Text>
            <Text
              style={[
                styles.status,
                {
                  color: result.status === 'completed' ? colors.success : colors.warning,
                },
              ]}
            >
              {result.status === 'completed' ? '✓' : '!'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  results: {
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  task: {
    flex: 1,
    fontSize: 14,
  },
  status: {
    fontSize: 18,
    fontWeight: '700',
  },
})
