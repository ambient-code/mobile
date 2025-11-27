import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState, useEffect } from 'react'
import { fetchRepos } from '@/services/api/repositories'
import type { Repository } from '@/types/api'

type Props = {
  selectedRepoId?: string
  onSelectRepo: (repo: Repository) => void
  onEnterUrl: () => void
}

export function RepositoryPicker({ selectedRepoId, onSelectRepo, onEnterUrl }: Props) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepos()
  }, [])

  const loadRepos = async () => {
    try {
      const data = await fetchRepos()
      setRepos(data)
    } catch (error) {
      console.error('Failed to load repos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" testID="activity-indicator" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Repository</Text>

      {repos.map((repo) => (
        <TouchableOpacity
          key={repo.id}
          style={[styles.repoCard, selectedRepoId === repo.id && styles.repoCardSelected]}
          onPress={() => onSelectRepo(repo)}
        >
          <View style={styles.repoInfo}>
            <Ionicons name="folder" size={20} color="#6366f1" />
            <Text style={styles.repoName}>{repo.name}</Text>
          </View>
          {selectedRepoId === repo.id && (
            <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.urlButton} onPress={onEnterUrl}>
        <Ionicons name="link" size={20} color="#6366f1" />
        <Text style={styles.urlButtonText}>Enter GitHub URL</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  repoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  repoCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  repoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repoName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  urlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  urlButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366f1',
  },
})
