import React, { useState } from 'react'
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { InboxHeader } from '@/components/inbox/InboxHeader'
import { StuckAgentBanner } from '@/components/inbox/StuckAgentBanner'
import { DecisionQueueCard } from '@/components/inbox/DecisionQueueCard'
import { OvernightResultsCard } from '@/components/inbox/OvernightResultsCard'
import { ForecastCard } from '@/components/inbox/ForecastCard'
import { mockInboxData, mockPendingDecisions } from '@/utils/mockInboxData'
import { useTheme } from '@/hooks/useTheme'

export default function InboxScreen() {
  const { colors } = useTheme()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate fetch delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    setRefreshing(false)
  }

  const { user, summary, stuckAgents, overnightResults, forecast } = mockInboxData

  // Calculate total minutes for decision queue
  const totalMinutes = mockPendingDecisions.reduce(
    (sum, decision) => sum + decision.estimatedMinutes,
    0
  )

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      <InboxHeader userName={user.name} summary={summary} />

      <StuckAgentBanner agents={stuckAgents} />

      <DecisionQueueCard count={summary.pendingDecisions} totalMinutes={totalMinutes} />

      <OvernightResultsCard results={overnightResults} />

      <ForecastCard forecast={forecast} />

      {/* Bottom padding */}
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
