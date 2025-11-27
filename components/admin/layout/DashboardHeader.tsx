import { View, Text, StyleSheet } from 'react-native'

interface DashboardHeaderProps {
  title: string
  lastUpdated?: Date
  subtitle?: string
}

export function DashboardHeader({ title, lastUpdated, subtitle }: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>Last updated: {formatLastUpdated(lastUpdated)}</Text>
      )}
    </View>
  )
}

function formatLastUpdated(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) {
    return 'just now'
  } else if (diffMins === 1) {
    return '1 minute ago'
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`
  } else {
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) {
      return '1 hour ago'
    } else {
      return `${diffHours} hours ago`
    }
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#8E8E93',
  },
})
