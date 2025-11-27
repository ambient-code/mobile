import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { useSystemHealth } from '@/services/analytics/hooks'
import { StatusIndicator } from '@/components/admin/metrics/StatusIndicator'
import { MetricCard } from '@/components/admin/metrics/MetricCard'
import { DashboardHeader } from '@/components/admin/layout/DashboardHeader'

export default function OverviewDashboard() {
  const { data, isLoading, error, refetch, isRefetching } = useSystemHealth()

  const onRefresh = () => {
    refetch()
  }

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading system health...</Text>
      </View>
    )
  }

  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load system health</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Text>
        <Text style={styles.retryHint}>Pull down to retry</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#007AFF" />
      }
    >
      <DashboardHeader
        title="System Health Overview"
        subtitle="Real-time platform metrics"
        lastUpdated={data?.timestamp}
      />

      <View style={styles.content}>
        <StatusIndicator status={data?.status ?? 'down'} reasons={data?.statusReasons} />

        <Text style={styles.sectionTitle}>Active Users</Text>
        <MetricCard
          label="Total Active Users"
          value={data?.metrics.activeUsers.total ?? 0}
          status="success"
        />
        <View style={styles.row}>
          <View style={styles.halfCard}>
            <MetricCard
              label="Web"
              value={data?.metrics.activeUsers.web ?? 0}
              subtitle="users"
            />
          </View>
          <View style={styles.halfCard}>
            <MetricCard
              label="Mobile"
              value={data?.metrics.activeUsers.mobile ?? 0}
              subtitle="users"
            />
          </View>
        </View>
        <MetricCard
          label="Cross-Platform"
          value={data?.metrics.activeUsers.both ?? 0}
          subtitle="users active on both web and mobile"
        />

        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <MetricCard
          label="Error Rate"
          value={`${data?.metrics.errorRate.toFixed(2) ?? 0}%`}
          status={getErrorRateStatus(data?.metrics.errorRate ?? 0)}
        />
        <MetricCard
          label="Latency (p95)"
          value={`${data?.metrics.latencyP95.toFixed(0) ?? 0}ms`}
          status={getLatencyStatus(data?.metrics.latencyP95 ?? 0)}
        />
        <MetricCard
          label="Requests Per Minute"
          value={data?.metrics.requestsPerMinute.toFixed(0) ?? 0}
          status="success"
        />
      </View>
    </ScrollView>
  )
}

function getErrorRateStatus(errorRate: number): 'success' | 'warning' | 'error' {
  if (errorRate < 1) return 'success'
  if (errorRate < 5) return 'warning'
  return 'error'
}

function getLatencyStatus(latency: number): 'success' | 'warning' | 'error' {
  if (latency < 100) return 'success'
  if (latency < 500) return 'warning'
  return 'error'
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryHint: {
    fontSize: 12,
    color: '#8E8E93',
  },
})
