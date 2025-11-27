import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useTheme } from '@/hooks/useTheme'
import { getAnnouncements } from '@/services/announcements'
import type { Announcement } from '@/types/announcement'

const STORAGE_KEY = '@acp_read_announcements'

export default function AnnouncementsScreen() {
  const { colors } = useTheme()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load read announcement IDs from AsyncStorage
  useEffect(() => {
    loadReadIds()
  }, [])

  // Load announcements after read IDs are loaded
  useEffect(() => {
    if (!isLoading) {
      setAnnouncements(getAnnouncements())
    }
  }, [isLoading])

  const loadReadIds = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        setReadIds(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load read announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (announcementId: string) => {
    try {
      const newReadIds = [...readIds, announcementId]
      setReadIds(newReadIds)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReadIds))
    } catch (error) {
      console.error('Failed to mark announcement as read:', error)
    }
  }

  const handleAnnouncementPress = useCallback(
    (announcement: Announcement) => {
      if (announcement.isNew && !readIds.includes(announcement.id)) {
        markAsRead(announcement.id)
      }
    },
    [readIds]
  )

  const isUnread = useCallback(
    (announcement: Announcement) => {
      return announcement.isNew && !readIds.includes(announcement.id)
    },
    [readIds]
  )

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const renderAnnouncement = useCallback(
    ({ item }: { item: Announcement }) => {
      const unread = isUnread(item)

      return (
        <TouchableOpacity
          style={[
            styles.announcementCard,
            {
              backgroundColor: colors.card,
              borderColor: unread ? colors.accent : colors.border,
            },
          ]}
          onPress={() => handleAnnouncementPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }, unread && styles.titleUnread]}>
                {item.title}
              </Text>
              {unread && (
                <View style={[styles.newBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </TouchableOpacity>
      )
    },
    [colors, isUnread, handleAnnouncementPress]
  )

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol name="gift.fill" size={28} color={colors.accent} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Announcements</Text>
      </View>

      {/* Announcements List */}
      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <IconSymbol name="gift" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No announcements yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Check back later for updates and news
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  announcementCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    padding: 60,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
})
