import React, { useState, useEffect, useCallback, memo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { getGreeting } from '@/utils/constants'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { NotificationsModal } from '@/components/modals/NotificationsModal'
import { PreferencesService } from '@/services/storage/preferences'
import { getUnreadCount } from '@/services/announcements'

interface HeaderProps {
  isRefetching?: boolean
}

const STORAGE_KEY = '@acp_read_announcements'

// Pure function - no need for memoization
function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0]
  }
  return name[0]
}

// Memoized Header component to prevent unnecessary re-renders
export const Header = memo(({ isRefetching = false }: HeaderProps) => {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [greeting, setGreeting] = useState(() => getGreeting())
  const [notificationsVisible, setNotificationsVisible] = useState(false)
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0)

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

  // Load unread announcements count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        const readIds = stored ? JSON.parse(stored) : []
        const count = getUnreadCount(readIds)
        setUnreadAnnouncementsCount(count)
      } catch (error) {
        console.error('Failed to load unread announcements count:', error)
      }
    }

    loadUnreadCount()

    // Refresh count when returning to this screen
    const interval = setInterval(loadUnreadCount, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Simple derived values - no need for memoization
  const firstName = user?.name ? user.name.split(' ')[0] : 'there'
  const userInitials = user ? getInitials(user.name) : 'U'

  // Simple setters - no need for useCallback
  const openNotifications = () => setNotificationsVisible(true)
  const closeNotifications = () => setNotificationsVisible(false)

  // Sign out handler (defined before showUserMenu to avoid forward reference)
  const handleSignOut = useCallback(async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await PreferencesService.clearAll()
            // logout() will clear auth context and tokens
            router.replace('/login')
          } catch (error) {
            console.error('Sign out failed:', error)
          }
        },
      },
    ])
  }, [])

  // User menu handler
  const showUserMenu = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Settings', 'Sign Out', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            router.push('/settings')
          } else if (buttonIndex === 1) {
            handleSignOut()
          }
        }
      )
    } else {
      // Android: Show custom dialog
      Alert.alert('Account', '', [
        { text: 'Settings', onPress: () => router.push('/settings') },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: handleSignOut,
        },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }, [handleSignOut])

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.greeting, { color: colors.textPrimary }]} numberOfLines={1}>
        {greeting}, {firstName}
      </Text>

      <View style={styles.actions}>
        {/* Announcements */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={() => router.push('/announcements')}
          activeOpacity={0.7}
        >
          <IconSymbol name="gift.fill" size={20} color={colors.textPrimary} />
          {/* Unread badge */}
          {unreadAnnouncementsCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadAnnouncementsCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={openNotifications}
          activeOpacity={0.7}
        >
          <IconSymbol name="bell.fill" size={20} color={colors.textPrimary} />
          {/* Unread badge */}
          <View style={[styles.unreadBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.unreadBadgeText}>2</Text>
          </View>
        </TouchableOpacity>

        {/* Avatar with refresh spinner */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
            onPress={showUserMenu}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </TouchableOpacity>
          {isRefetching && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      </View>

      <NotificationsModal visible={notificationsVisible} onClose={closeNotifications} />
    </View>
  )
})

Header.displayName = 'Header'

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
