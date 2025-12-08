import React, { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet } from 'react-native'
import { DecisionCard } from '@/components/decisions/DecisionCard'
import { mockPendingDecisions } from '@/utils/mockInboxData'
import { useTheme } from '@/hooks/useTheme'
import { router } from 'expo-router'

export default function DecisionQueueScreen() {
  const { colors } = useTheme()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }

  const handleStartReview = (decisionId: string) => {
    router.push(`/decisions/${decisionId}`)
  }

  return (
    <FlatList
      data={mockPendingDecisions}
      renderItem={({ item }) => (
        <DecisionCard decision={item} onStartReview={() => handleStartReview(item.id)} />
      )}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
})
