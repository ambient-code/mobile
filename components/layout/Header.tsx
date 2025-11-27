import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { getGreeting } from '@/utils/constants'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { NotificationsModal } from '@/components/modals/NotificationsModal'

interface HeaderProps {
  isRefetching?: boolean
}

// Memoized Header component to prevent unnecessary re-renders
export const Header = memo(({ isRefetching = false }: HeaderProps) => {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [greeting, setGreeting] = useState(() => getGreeting())
  const [notificationsVisible, setNotificationsVisible] = useState(false)

  useEffect(() => {
    // Only update greeting if it actually changed (hourly changes)
    const checkGreeting = () => {
      const newGreeting = getGreeting()
      if (newGreeting !== greeting) {
        setGreeting(newGreeting)
      }
    }

    // Check every 5 minutes instead of every minute (greetings change hourly)
    const interval = setInterval(checkGreeting, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [greeting])

  // Memoize getInitials function
  const getInitials = useCallback((name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return name[0]
  }, [])

  // Memoize firstName to prevent recalculation
  const firstName = useMemo(() => (user?.name ? user.name.split(' ')[0] : 'there'), [user?.name])

  // Memoize user initials
  const userInitials = useMemo(() => (user ? getInitials(user.name) : 'U'), [user, getInitials])

  // Memoize notifications toggle callback
  const openNotifications = useCallback(() => setNotificationsVisible(true), [])
  const closeNotifications = useCallback(() => setNotificationsVisible(false), [])

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={1}>
        {greeting}, {firstName}
      </Text>

      <View style={styles.actions}>
        {/* Notifications/Announcements */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={openNotifications}
          activeOpacity={0.7}
        >
          <IconSymbol name="bell.fill" size={20} color={colors.text} />
          {/* Unread badge */}
          <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.unreadBadgeText}>2</Text>
          </View>
        </TouchableOpacity>

        {/* Avatar with refresh spinner */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.accent }]}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </TouchableOpacity>
          {isRefetching && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
        </View>
      </View>

      <NotificationsModal visible={notificationsVisible} onClose={closeNotifications} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
