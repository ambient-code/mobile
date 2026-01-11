import { View, ScrollView, StyleSheet } from 'react-native'
import { TOKENS } from '@/utils/constants'
import { StatusBadge } from '@/components/design-system/StatusBadge'
import { StatCard } from '@/components/design-system/StatCard'
import { ControlButton } from '@/components/design-system/ControlButton'
import { SectionHeader } from '@/components/design-system/SectionHeader'
import { ProgressBar } from '@/components/design-system/ProgressBar'
import { EmptyState } from '@/components/design-system/EmptyState'

export default function TestComponents() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Status Badges" />
      <View style={styles.badgeGroup}>
        <StatusBadge status="running" label="Running" />
        <StatusBadge status="done" label="Completed" />
        <StatusBadge status="error" label="Failed" />
        <StatusBadge status="paused" label="Paused" />
      </View>

      <SectionHeader title="Large Status Badge" style={styles.sectionSpacing} />
      <StatusBadge status="running" label="Active Session" size="large" />

      <SectionHeader title="Stat Cards" style={styles.sectionSpacing} />
      <View style={styles.cardGrid}>
        <StatCard label="Active" value="42" icon="account" variant="success" style={styles.card} />
        <StatCard label="Pending" value="8" icon="clock" variant="warning" style={styles.card} />
        <StatCard label="Errors" value="3" icon="alert" variant="danger" style={styles.card} />
        <StatCard label="Total" value="53" icon="chart-line" variant="default" style={styles.card} />
      </View>

      <SectionHeader title="Progress Bars" style={styles.sectionSpacing} />
      <ProgressBar progress={0.25} color={TOKENS.danger} />
      <View style={{ height: 12 }} />
      <ProgressBar progress={0.65} color={TOKENS.primary} />
      <View style={{ height: 12 }} />
      <ProgressBar progress={0.9} color={TOKENS.success} />

      <SectionHeader title="Buttons" style={styles.sectionSpacing} />
      <ControlButton label="Active Button" isActive onPress={() => {}} />
      <ControlButton label="Inactive Button" onPress={() => {}} style={{ marginTop: 8 }} />
      <ControlButton label="Disabled Button" onPress={() => {}} disabled style={{ marginTop: 8 }} />

      <SectionHeader title="Empty State" style={styles.sectionSpacing} />
      <View style={{ height: 300 }}>
        <EmptyState
          icon="briefcase"
          title="No sessions"
          description="You don't have any active sessions. Start a new workflow to get started."
          actionLabel="Create Session"
          onAction={() => {}}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: TOKENS.bg,
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  badgeGroup: {
    gap: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
  },
})
