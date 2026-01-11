import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import type { User } from '../../types/user'
import { TOKENS } from '../../utils/constants'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image
        source={{
          uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
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
    backgroundColor: TOKENS.card,
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
    color: TOKENS.textPrimary,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: TOKENS.elevated,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: TOKENS.textSecondary,
  },
  ssoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TOKENS.success + '20',
  },
  ssoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TOKENS.success,
    marginRight: 6,
  },
  ssoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: TOKENS.success,
  },
})
