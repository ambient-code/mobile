import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { InboxSummary } from '@/types/inbox'
import { useTheme } from '@/hooks/useTheme'

interface InboxHeaderProps {
  userName: string
  summary: InboxSummary
}

export function InboxHeader({ userName, summary }: InboxHeaderProps) {
  const { colors } = useTheme()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.greeting, { color: colors.text }]}>
        {getGreeting()}, {userName}
      </Text>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {summary.completedOvernight}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{summary.stuckAgents}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Stuck</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>
            {summary.pendingDecisions}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Decisions</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
})
