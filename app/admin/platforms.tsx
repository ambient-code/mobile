import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { useState } from 'react'

export default function PlatformComparisonDashboard() {
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)
    // TODO: Implement refresh logic
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Platform Comparison Dashboard</Text>
        <Text style={styles.placeholder}>Dashboard implementation in progress...</Text>
        <Text style={styles.description}>
          This screen will display platform metrics:
          {'\n'}- Active users by platform (web, mobile, both) - pie chart
          {'\n'}- Platform-specific error rates
          {'\n'}- OS version breakdown for mobile (iOS, Android)
          {'\n'}- OS version breakdown for web (macOS, Windows, Linux)
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
})
