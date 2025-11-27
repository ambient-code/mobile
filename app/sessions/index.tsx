import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useSessions } from '@/hooks/useSessions'
import { SessionCard } from '@/components/session/SessionCard'
import { SessionStatus, type Session } from '@/types/session'
import { useLocalSearchParams } from 'expo-router'

type FilterType = 'all' | SessionStatus

export default function SessionsListScreen() {
  const { colors } = useTheme()
  const { filter: urlFilter } = useLocalSearchParams()
  const [filter, setFilter] = useState<FilterType>('all')

  // Set initial filter from URL parameter
  useEffect(() => {
    if (urlFilter === 'running') {
      setFilter(SessionStatus.RUNNING)
    }
  }, [urlFilter])

  const { data: allSessions, isLoading } = useSessions()

  // Memoize filtered sessions to prevent unnecessary re-calculations
  const sessions = useMemo(() => {
    if (!allSessions) return []

    if (filter === 'all') return allSessions

    return allSessions.filter((session) => session.status === filter)
  }, [allSessions, filter])

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Running', value: SessionStatus.RUNNING },
    { label: 'Paused', value: SessionStatus.PAUSED },
    { label: 'Done', value: SessionStatus.DONE },
  ]

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((f) => {
          const isActive = filter === f.value
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.accent : colors.card,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${f.label}`}
              accessibilityState={{ selected: isActive }}
              accessibilityHint={`Double tap to show ${f.label.toLowerCase()} sessions`}
            >
              <Text style={[styles.filterText, { color: isActive ? '#fff' : colors.text }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Sessions List - Using FlatList for better performance */}
      <FlatList
        data={sessions}
        renderItem={useCallback(
          ({ item }: { item: Session }) => (
            <SessionCard session={item} />
          ),
          []
        )}
        keyExtractor={useCallback((item: Session) => item.id, [])}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading sessions...
            </Text>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No sessions found
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
