import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import type { User } from '../../types/user'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image
        source={{
          uri:
            user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
        }}
        style={styles.avatar}
      />

      {/* Name */}
      <Text style={styles.name}>{user.name}</Text>

      {/* Role Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{user.role}</Text>
      </View>

      {/* SSO Status Badge */}
      <View style={[styles.badge, styles.ssoBadge]}>
        <View style={styles.ssoIndicator} />
        <Text style={styles.ssoBadgeText}>{user.ssoProvider}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  ssoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
  },
  ssoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  ssoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
})
