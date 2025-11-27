import { View, Text, StyleSheet } from 'react-native'
import type { ErrorEvent } from '@/services/analytics/types'

interface ErrorTableProps {
  errors: ErrorEvent[]
  title?: string
}

/**
 * Table component for displaying top errors
 * Shows error message, type, count, and affected users
 */
export function ErrorTable({ errors, title = 'Top Errors' }: ErrorTableProps) {
  if (errors.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No errors to display</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.messageColumn]}>Error</Text>
          <Text style={[styles.headerCell, styles.typeColumn]}>Type</Text>
          <Text style={[styles.headerCell, styles.countColumn]}>Count</Text>
        </View>
        {errors.map((error, index) => (
          <View key={error.errorId} style={[styles.row, index % 2 === 0 && styles.rowEven]}>
            <Text style={[styles.cell, styles.messageColumn]} numberOfLines={2}>
              {error.message}
            </Text>
            <View style={styles.typeColumn}>
              <View style={[styles.typeBadge, getTypeBadgeStyle(error.errorType)]}>
                <Text style={styles.typeText}>{error.errorType}</Text>
              </View>
            </View>
            <Text style={[styles.cell, styles.countColumn]}>{error.count}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function getTypeBadgeStyle(errorType: '4xx' | '5xx') {
  return errorType === '4xx'
    ? { backgroundColor: '#FF9500' } // Warning - client errors
    : { backgroundColor: '#FF3B30' } // Error - server errors
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
  table: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  rowEven: {
    backgroundColor: '#FAFAFA',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  cell: {
    fontSize: 14,
    color: '#000',
  },
  messageColumn: {
    flex: 2,
    paddingRight: 8,
  },
  typeColumn: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countColumn: {
    flex: 0.7,
    textAlign: 'right',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
})
