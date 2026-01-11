import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { StuckAgent } from '@/types/inbox'
import { useTheme } from '@/hooks/useTheme'
import { AgentAvatar } from '../ui/AgentAvatar'

interface StuckAgentBannerProps {
  agents: StuckAgent[]
}

export function StuckAgentBanner({ agents }: StuckAgentBannerProps) {
  const { colors } = useTheme()

  if (agents.length === 0) {
    return null
  }

  const agent = agents[0] // Show first stuck agent

  const handleHelp = () => {
    // Navigate to session detail (if exists) or show modal
    console.log('Help requested for agent:', agent.name)
    // router.push(`/sessions/${agent.sessionId}`);
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.warning + '15', borderColor: colors.warning },
      ]}
    >
      <AgentAvatar agentName={agent.name} size="small" />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{agent.name} needs help</Text>
        <Text style={[styles.task, { color: colors.textSecondary }]} numberOfLines={1}>
          {agent.task}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.warning }]}
        onPress={handleHelp}
        accessibilityRole="button"
        accessibilityLabel={`Help ${agent.name} with ${agent.task}`}
      >
        <Text style={styles.buttonText}>Help</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  task: {
    fontSize: 13,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
