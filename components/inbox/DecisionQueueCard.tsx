import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'

interface DecisionQueueCardProps {
  count: number
  totalMinutes: number
}

export function DecisionQueueCard({ count, totalMinutes }: DecisionQueueCardProps) {
  const { colors } = useTheme()

  const handleStartReviews = () => {
    router.push('/decisions')
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={handleStartReviews}
      accessibilityRole="button"
      accessibilityLabel={`${count} pending decisions, estimated ${totalMinutes} minutes`}
      accessibilityHint="Opens decision queue"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Decision Queue</Text>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        ~{totalMinutes} min to review
      </Text>
      <View style={[styles.button, { backgroundColor: colors.accent }]}>
        <Text style={styles.buttonText}>Start Reviews →</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
