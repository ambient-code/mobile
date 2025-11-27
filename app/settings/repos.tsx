import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchRepos, addRepo, removeRepo } from '../../services/api/repositories'
import { PreferencesService } from '../../services/storage/preferences'
import type { Repository } from '../../types/api'

export default function ConnectedReposScreen() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepos()
  }, [])

  async function loadRepos() {
    try {
      // Try cache first
      const cached = await PreferencesService.getConnectedRepos()
      if (cached.length > 0) {
        setRepos(cached)
        setLoading(false)
      }

      // Fetch from API
      const data = await fetchRepos()
      setRepos(data)
      await PreferencesService.setConnectedRepos(data)
    } catch (error) {
      console.error('Failed to load repos:', error)
      Alert.alert('Error', 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  function handleAddRepo() {
    Alert.prompt(
      'Add Repository',
      'Enter GitHub repository URL',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (url) => {
            if (!url) return

            // Validate URL
            if (!isValidGitHubUrl(url)) {
              Alert.alert(
                'Invalid URL',
                'Please enter a valid GitHub repository URL'
              )
              return
            }

            try {
              const newRepo = await addRepo(url)
              const updated = [...repos, newRepo]
              setRepos(updated)
              await PreferencesService.setConnectedRepos(updated)
            } catch (error) {
              console.error('Failed to add repo:', error)
              Alert.alert('Error', 'Failed to add repository')
            }
          },
        },
      ],
      'plain-text'
    )
  }

  async function handleRemoveRepo(repo: Repository) {
    Alert.alert('Remove Repository', `Remove ${repo.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeRepo(repo.id)
            const updated = repos.filter((r) => r.id !== repo.id)
            setRepos(updated)
            await PreferencesService.setConnectedRepos(updated)
          } catch (error) {
            console.error('Failed to remove repo:', error)
            Alert.alert('Error', 'Failed to remove repository')
          }
        },
      },
    ])
  }

  function isValidGitHubUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.hostname === 'github.com'
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddRepo}>
        <Ionicons name="add-circle" size={24} color="#8b5cf6" />
        <Text style={styles.addButtonText}>Add Repository</Text>
      </TouchableOpacity>

      {/* Repository List */}
      {repos.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="git-branch-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No repositories connected</Text>
          <Text style={styles.emptySubtext}>
            Add a repository to start creating sessions
          </Text>
        </View>
      ) : (
        <FlatList
          data={repos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.repoItem}>
              <View style={styles.repoInfo}>
                <Text style={styles.repoName}>{item.name}</Text>
                <Text style={styles.repoUrl}>{item.url}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveRepo(item)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  repoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  repoInfo: {
    flex: 1,
  },
  repoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  repoUrl: {
    fontSize: 13,
    color: '#6b7280',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
})
