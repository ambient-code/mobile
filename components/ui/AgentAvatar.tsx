import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { AGENT_COLORS, AgentName } from '@/types/inbox'

interface AgentAvatarProps {
  agentName: AgentName
  size?: 'small' | 'medium' | 'large'
  style?: ViewStyle
}

export function AgentAvatar({ agentName, size = 'medium', style }: AgentAvatarProps) {
  const backgroundColor = AGENT_COLORS[agentName]
  const initial = agentName[0]

  const sizeStyles = {
    small: { width: 24, height: 24, borderRadius: 12 },
    medium: { width: 40, height: 40, borderRadius: 20 },
    large: { width: 56, height: 56, borderRadius: 28 },
  }

  const fontSizes = {
    small: 12,
    medium: 16,
    large: 22,
  }

  return (
    <View
      style={[styles.avatar, { backgroundColor }, sizeStyles[size], style]}
      accessibilityLabel={`${agentName} avatar`}
      accessibilityRole="image"
    >
      <Text style={[styles.initial, { fontSize: fontSizes[size] }]}>{initial}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})
