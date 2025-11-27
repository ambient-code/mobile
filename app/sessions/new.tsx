import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { useOffline } from '@/hooks/useOffline'
import { RepositoryPicker } from '@/components/session/RepositoryPicker'
import { WorkflowTypeGrid } from '@/components/session/WorkflowTypeGrid'
import { ModelSelector } from '@/components/session/ModelSelector'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { createSessionFromRepo } from '@/services/api/sessions'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'
import { WORKFLOWS } from '@/utils/constants'
import type { Repository } from '@/types/api'
import { ModelType } from '@/types/session'

export default function NewSessionScreen() {
  const { isOffline } = useOffline()
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>()
  const [sessionName, setSessionName] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.SONNET_4_5)
  const [loading, setLoading] = useState(false)

  // Auto-generate session name when repo + workflow selected
  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo)
    if (selectedWorkflow) {
      setSessionName(generateSessionName(repo.name, selectedWorkflow))
    }
  }

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflow(workflowId)
    if (selectedRepo) {
      setSessionName(generateSessionName(selectedRepo.name, workflowId))
    }
  }

  const generateSessionName = (repoName: string, workflowType: string) => {
    const workflowLabel = WORKFLOWS.find((w) => w.id === workflowType)?.label || workflowType
    const date = new Date()
    const month = date.toLocaleString('default', { month: 'short' })
    const day = date.getDate()
    return `${repoName} ${workflowLabel} - ${month} ${day}`
  }

  const handleEnterUrl = () => {
    // TODO: Show modal to enter GitHub URL
    Alert.alert('Enter GitHub URL', 'This feature will be implemented in settings (Phase 8)')
  }

  const handleStartSession = async () => {
    if (isOffline) {
      Alert.alert('Offline', 'Cannot create sessions while offline. Please check your connection.')
      return
    }

    if (!selectedRepo || !selectedWorkflow) {
      Alert.alert('Missing Information', 'Please select a repository and workflow type.')
      return
    }

    setLoading(true)
    try {
      await createSessionFromRepo({
        name: sessionName,
        repositoryId: selectedRepo.id,
        workflowType: selectedWorkflow,
        model: selectedModel,
      })

      // Track session creation
      trackEvent(TelemetryEvents.SESSION_CREATED, {
        workflowType: selectedWorkflow,
        model: selectedModel,
        repositoryId: selectedRepo.id,
      })

      // Show success toast (using Alert for now)
      Alert.alert('Success', 'Session created successfully!')

      // Navigate back to dashboard
      router.replace('/(tabs)')
    } catch (error) {
      console.error('Failed to create session:', error)
      Alert.alert('Error', 'Failed to create session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isStartDisabled = !selectedRepo || !selectedWorkflow || loading || isOffline

  return (
    <View style={styles.container}>
      {/* Offline Banner */}
      {isOffline && <OfflineBanner />}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>New Session</Text>

        <RepositoryPicker
          selectedRepoId={selectedRepo?.id}
          onSelectRepo={handleRepoSelect}
          onEnterUrl={handleEnterUrl}
        />

        <WorkflowTypeGrid
          selectedWorkflow={selectedWorkflow}
          onSelectWorkflow={handleWorkflowSelect}
        />

        <View style={styles.nameSection}>
          <Text style={styles.label}>Session Name</Text>
          <TextInput
            style={styles.input}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="Enter session name..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          testID="start-session-button"
          style={[styles.startButton, isStartDisabled && styles.startButtonDisabled]}
          onPress={handleStartSession}
          disabled={isStartDisabled}
        >
          <Text style={styles.startButtonText}>{loading ? 'Starting...' : 'Start Session'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  nameSection: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  footer: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
})
