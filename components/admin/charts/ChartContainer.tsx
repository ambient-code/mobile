import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'

interface ChartContainerProps {
  title: string
  loading?: boolean
  error?: string
  children: React.ReactNode
}

/**
 * Container wrapper for chart components
 * Provides consistent styling, loading states, and error handling
 */
export function ChartContainer({ title, loading, error, children }: ChartContainerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!loading && !error && <View style={styles.chartWrapper}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  chartWrapper: {
    marginTop: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
})
