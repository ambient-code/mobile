import React, { useEffect, useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useRouter } from 'expo-router'

export interface ToastNotification {
  id: string
  type: 'review' | 'session' | 'info' | 'success' | 'error'
  title: string
  message: string
  sessionId?: string
}

interface ToastProps {
  notification: ToastNotification | null
  onDismiss: () => void
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const { colors } = useTheme()
  const router = useRouter()
  const translateY = useRef(new Animated.Value(-200)).current
  const opacity = useRef(new Animated.Value(0)).current

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss()
    })
  }, [translateY, opacity, onDismiss])

  useEffect(() => {
    if (notification) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        handleDismiss()
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [notification, translateY, opacity, handleDismiss])

  const handlePress = () => {
    if (notification?.sessionId) {
      router.push(`/sessions/${notification.sessionId}`)
      handleDismiss()
    }
  }

  if (!notification) return null

  const getIcon = () => {
    switch (notification.type) {
      case 'review':
        return 'bell.fill'
      case 'session':
        return 'sparkles'
      case 'success':
        return 'checkmark.circle.fill'
      case 'error':
        return 'xmark.circle.fill'
      default:
        return 'bell.fill'
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'review':
        return colors.warning + 'E6'
      case 'session':
        return colors.accent + 'E6'
      case 'success':
        return colors.success + 'E6'
      case 'error':
        return colors.error + 'E6'
      default:
        return colors.card + 'E6'
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { backgroundColor: getBackgroundColor() }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <IconSymbol name={getIcon()} size={24} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{notification.title}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissText}></Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  dismissButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dismissText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
})
