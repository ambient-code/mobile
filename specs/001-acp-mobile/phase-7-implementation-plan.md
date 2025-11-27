# Phase 7 Implementation Plan: Start New AI Sessions (US5)

**Feature**: User Story 5 - Start New AI Sessions
**Priority**: P2
**Branch**: `feature/phase-7-create-sessions`
**Total Tasks**: 11 tasks
**Estimated Parallelizable**: 5 tasks marked [P]

## Quick Reference

**Jump to**:

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Implementation Sequence](#implementation-sequence)
- [Task Details](#task-details)
- [Testing Strategy](#testing-strategy)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Story Goal

Initiate new AI coding sessions from phone to kick off work remotely.

### Why P2

Enables proactive work initiation, completes the workflow loop. While monitoring (US1) and reviewing (US2) are critical, the ability to start new work remotely is valuable for productivity and responsiveness.

### Success Criteria

✅ FAB (floating action button) visible on dashboard
✅ New Session screen shows repository picker (connected repos or manual URL)
✅ Workflow type grid shows 7 options with "Soon" badges for disabled
✅ Session name auto-generates as `{repo} {Workflow} - {Month Day}` and is editable
✅ Model selection shows sonnet-4.5 (default) and opus-4.5
✅ "Start Session" button disabled until repository selected

### Independent Test

Tap FAB → new session screen opens → select repository from connected repos or enter URL → choose workflow type → see auto-generated session name (editable) → select model → tap "Start Session" → verify session appears in dashboard.

---

## Prerequisites

### Completed Phases Required

- ✅ Phase 1: Setup & Infrastructure
- ✅ Phase 2: Foundational Infrastructure
- ✅ Phase 3: User Story 1 - Monitor Sessions (for Session types and SessionCard component)
- ⚠️ Phase 4: User Story 2 - Review Work (optional, but recommended for complete workflow)

### Existing Dependencies

**Types** (from Phase 2):

- `types/session.ts` - Session, SessionStatus, ModelType
- `types/api.ts` - Repository type (will be created in T015 if missing)

**API Infrastructure** (from Phase 2):

- `services/api/client.ts` - HTTP client with auth
- `services/api/sessions.ts` - fetchSessions(), fetchSessionDetail()

**Components** (from Phase 3):

- `components/session/SessionCard.tsx` - For displaying created session
- `components/session/ModelBadge.tsx` - For model selection UI

**Constants** (from Phase 2):

- `utils/constants.ts` - Already contains WORKFLOWS array (see lines 70-121)

### New Files to Create

```
services/api/repositories.ts          # T065 - Repository API
components/layout/FAB.tsx              # T068 - Floating Action Button
components/session/RepositoryPicker.tsx # T069 - Repo selection UI
components/session/WorkflowTypeGrid.tsx # T070 - Workflow selection grid
components/session/ModelSelector.tsx    # T071 - Model selection radio
assets/icons/lightbulb.svg             # T072 - Custom SVG icon
app/sessions/new.tsx                   # T073 - New session screen
```

---

## Implementation Sequence

### Phase 7.1: Data Layer (Parallelizable)

**Duration**: ~30-45 minutes
**Can be done in parallel with UI component work**

```bash
# Tasks T065, T066, T067 [P] - All can run in parallel
```

- **T065** [P]: `services/api/repositories.ts` - Repository API service
- **T066** [P]: Add `createSession()` to `services/api/sessions.ts`
- **T067** [P]: Already complete! WORKFLOWS in `utils/constants.ts`

**Validation**: Repository API can fetch repos, session API can create sessions

---

### Phase 7.2: UI Components (Parallelizable)

**Duration**: ~1-2 hours
**Can be done in parallel with data layer**

```bash
# Tasks T068-T072 [P] - All independent components
```

- **T068** [P]: `components/layout/FAB.tsx` - Floating action button
- **T069** [P]: `components/session/RepositoryPicker.tsx` - Repository picker
- **T070** [P]: `components/session/WorkflowTypeGrid.tsx` - Workflow grid
- **T071** [P]: `components/session/ModelSelector.tsx` - Model selector
- **T072** [P]: `assets/icons/lightbulb.svg` - Lightbulb SVG icon

**Validation**: Each component renders correctly in isolation

---

### Phase 7.3: Screen Integration (Sequential)

**Duration**: ~1-2 hours
**MUST wait for Phase 7.1 and 7.2 to complete**

```bash
# Tasks T073-T075 - Sequential integration tasks
```

- **T073**: `app/sessions/new.tsx` - New Session screen
- **T074**: Add FAB to Dashboard `app/(tabs)/index.tsx`
- **T075**: Implement auto-generate session name logic

**Validation**: End-to-end flow works from dashboard → create session → session appears

---

## Task Details

### T065 [P] [US5] - Repository API Service

**File**: `services/api/repositories.ts`
**Dependencies**: None (uses existing HTTP client)
**Parallelizable**: Yes

#### Implementation

```typescript
import { apiClient } from './client'
import type { Repository } from '@/types/api'

/**
 * Fetch all connected repositories for the current user
 */
export async function fetchRepos(): Promise<Repository[]> {
  const response = await apiClient.get<Repository[]>('/repositories')
  return response.data
}

/**
 * Add a new repository by GitHub URL
 * @param url - GitHub repository URL (e.g., https://github.com/owner/repo)
 */
export async function addRepo(url: string): Promise<Repository> {
  const response = await apiClient.post<Repository>('/repositories', { url })
  return response.data
}

/**
 * Remove a connected repository
 * @param id - Repository ID
 */
export async function removeRepo(id: string): Promise<void> {
  await apiClient.delete(`/repositories/${id}`)
}
```

#### Type Definition (if missing in `types/api.ts`)

```typescript
// Add to types/api.ts if not present
export type Repository = {
  id: string
  name: string
  url: string
  branch: string
  isConnected: boolean
}
```

#### Testing

```typescript
// Manual test in app
import { fetchRepos, addRepo, removeRepo } from '@/services/api/repositories'

// Should return array of repos
const repos = await fetchRepos()

// Should add new repo
const newRepo = await addRepo('https://github.com/owner/repo')

// Should remove repo
await removeRepo(newRepo.id)
```

---

### T066 [P] [US5] - Add createSession() Method

**File**: `services/api/sessions.ts`
**Dependencies**: None (extends existing file)
**Parallelizable**: Yes

#### Implementation

Add this method to the existing `services/api/sessions.ts`:

```typescript
import type { Session, ModelType } from '@/types/session'

/**
 * Create a new AI coding session
 */
export async function createSession(params: {
  name: string
  repositoryId: string
  workflowType: string
  model: ModelType
  description?: string
}): Promise<Session> {
  const response = await apiClient.post<Session>('/sessions', {
    name: params.name,
    repository_id: params.repositoryId,
    workflow_type: params.workflowType,
    model: params.model,
    description: params.description || '',
  })
  return response.data
}
```

#### Testing

```typescript
// Manual test
import { createSession } from '@/services/api/sessions'

const newSession = await createSession({
  name: 'my-repo Review - Nov 27',
  repositoryId: 'repo-123',
  workflowType: 'review',
  model: 'sonnet-4.5',
})
// Should return Session object with id, status='pending', etc.
```

---

### T067 [P] [US5] - Workflow Types Constant

**File**: `utils/constants.ts`
**Dependencies**: None
**Parallelizable**: Yes
**Status**: ✅ ALREADY COMPLETE!

The WORKFLOWS constant already exists in `utils/constants.ts` (lines 70-121):

```typescript
export const WORKFLOWS = [
  {
    id: 'review',
    label: 'Review',
    icon: 'eye',
    description: 'Code review and analysis',
    enabled: true,
  },
  {
    id: 'bugfix',
    label: 'Bugfix',
    icon: 'tool',
    description: 'Debug and fix issues',
    enabled: true,
  },
  {
    id: 'plan',
    label: 'Plan a Feature',
    icon: 'clipboard',
    description: 'Feature planning and design',
    enabled: true,
  },
  {
    id: 'research',
    label: 'Research',
    icon: 'book',
    description: 'Explore and document code',
    enabled: true,
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'message-circle',
    description: 'Interactive conversation',
    enabled: true,
  },
  {
    id: 'ideate',
    label: 'Ideate',
    icon: 'lightbulb',
    description: 'Brainstorm and ideate',
    enabled: true,
  },
  { id: 'new', label: 'New...', icon: 'plus', description: 'Coming soon', enabled: false },
]
```

**Action**: No code changes needed! ✅

---

### T068 [P] [US5] - FAB Component

**File**: `components/layout/FAB.tsx`
**Dependencies**: None
**Parallelizable**: Yes

#### Implementation

```typescript
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export function FAB() {
  const handlePress = () => {
    router.push('/sessions/new')
  }

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress} activeOpacity={0.8}>
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1', // Purple accent
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
```

#### Design Notes

- Purple circle (#6366f1) matching accent color
- 56x56 size (Material Design standard)
- Bottom-right positioning (24px margins)
- Plus icon (Ionicons `add`)
- Shadow elevation for depth

---

### T069 [P] [US5] - RepositoryPicker Component

**File**: `components/session/RepositoryPicker.tsx`
**Dependencies**: T065 (repositories API)
**Parallelizable**: Yes (can build UI, wire API later)

#### Implementation

```typescript
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
        <ActivityIndicator size="large" color="#6366f1" />
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
```

#### Features

- Shows connected repos in cards
- Checkmark for selected repo
- "Enter GitHub URL" button with dashed border
- Loading state with spinner
- Folder icon + checkmark icons

---

### T070 [P] [US5] - WorkflowTypeGrid Component

**File**: `components/session/WorkflowTypeGrid.tsx`
**Dependencies**: T067 (WORKFLOWS constant - already exists!)
**Parallelizable**: Yes

#### Implementation

```typescript
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WORKFLOWS } from '@/utils/constants'

type Props = {
  selectedWorkflow?: string
  onSelectWorkflow: (workflowId: string) => void
}

const CARD_GAP = 12
const CARDS_PER_ROW = 2
const SCREEN_PADDING = 24
const cardWidth =
  (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) /
  CARDS_PER_ROW

export function WorkflowTypeGrid({ selectedWorkflow, onSelectWorkflow }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Workflow Type</Text>
      <View style={styles.grid}>
        {WORKFLOWS.map((workflow) => {
          const isSelected = selectedWorkflow === workflow.id
          const isDisabled = !workflow.enabled

          return (
            <TouchableOpacity
              key={workflow.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isDisabled && styles.cardDisabled,
              ]}
              onPress={() => workflow.enabled && onSelectWorkflow(workflow.id)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name={workflow.icon as any}
                  size={24}
                  color={isSelected ? '#6366f1' : isDisabled ? '#cbd5e1' : '#475569'}
                />
                {isDisabled && (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>Soon</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  isSelected && styles.cardLabelSelected,
                  isDisabled && styles.cardLabelDisabled,
                ]}
              >
                {workflow.label}
              </Text>
              <Text style={[styles.cardDescription, isDisabled && styles.cardDescriptionDisabled]}>
                {workflow.description}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: cardWidth,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  soonBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardLabelSelected: {
    color: '#6366f1',
  },
  cardLabelDisabled: {
    color: '#cbd5e1',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  cardDescriptionDisabled: {
    color: '#cbd5e1',
  },
})
```

#### Features

- 2-column grid layout (responsive width)
- "Soon" badge for disabled workflows
- Selected state with purple border
- Icon + label + description
- Disabled state (opacity 0.5)

---

### T071 [P] [US5] - ModelSelector Component

**File**: `components/session/ModelSelector.tsx`
**Dependencies**: None
**Parallelizable**: Yes

#### Implementation

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ModelType } from '@/types/session'

type Props = {
  selectedModel: ModelType
  onSelectModel: (model: ModelType) => void
}

const MODELS = [
  {
    id: 'sonnet-4.5' as ModelType,
    label: 'Sonnet 4.5',
    description: 'Fast & efficient',
    icon: 'flash',
  },
  {
    id: 'opus-4.5' as ModelType,
    label: 'Opus 4.5',
    description: 'Most capable',
    icon: 'star',
  },
]

export function ModelSelector({ selectedModel, onSelectModel }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Model</Text>
      <View style={styles.options}>
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id

          return (
            <TouchableOpacity
              key={model.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelectModel(model.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Ionicons
                    name={model.icon as any}
                    size={20}
                    color={isSelected ? '#6366f1' : '#64748b'}
                  />
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {model.label}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{model.description}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
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
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  optionLabelSelected: {
    color: '#6366f1',
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 28, // Align with label (icon width + gap)
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#6366f1',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
})
```

#### Features

- Radio button selection
- Icon + label + description
- Sonnet (flash icon, "Fast & efficient")
- Opus (star icon, "Most capable")
- Purple selected state

---

### T072 [P] [US5] - Lightbulb SVG Icon

**File**: `assets/icons/lightbulb.svg`
**Dependencies**: None
**Parallelizable**: Yes

#### Implementation

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Lightbulb outline -->
  <path
    d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.4-1.4 4.5-3.5 5.5-.4.2-.5.5-.5.9V18H10v-2.6c0-.4-.1-.7-.5-.9C7.4 13.5 6 11.4 6 9a6 6 0 0 1 6-6z"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Filament lines -->
  <path
    d="M12 7v4M10 9h4"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>
```

#### Design Notes

- 24x24 viewBox
- Stroke-based design (matches Ionicons style)
- Uses `currentColor` for theme compatibility
- Filament cross inside bulb for detail

**Alternative**: Since this is just one icon and Ionicons has `bulb`, consider using:

```typescript
<Ionicons name="bulb" size={24} color={color} />
```

**Recommendation**: Use Ionicons `bulb` instead of custom SVG for consistency. Mark T072 as optional.

---

### T073 [US5] - New Session Screen

**File**: `app/sessions/new.tsx`
**Dependencies**: T068-T072 (all UI components), T065-T066 (API)
**Parallelizable**: No (must wait for components)

#### Implementation

```typescript
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { RepositoryPicker } from '@/components/session/RepositoryPicker'
import { WorkflowTypeGrid } from '@/components/session/WorkflowTypeGrid'
import { ModelSelector } from '@/components/session/ModelSelector'
import { createSession } from '@/services/api/sessions'
import type { Repository } from '@/types/api'
import type { ModelType } from '@/types/session'

export default function NewSessionScreen() {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>()
  const [sessionName, setSessionName] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelType>('sonnet-4.5')
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
    if (!selectedRepo || !selectedWorkflow) {
      Alert.alert('Missing Information', 'Please select a repository and workflow type.')
      return
    }

    setLoading(true)
    try {
      await createSession({
        name: sessionName,
        repositoryId: selectedRepo.id,
        workflowType: selectedWorkflow,
        model: selectedModel,
      })

      // Navigate back to dashboard
      router.replace('/(tabs)')

      // Show success toast (if Toast component available)
      Alert.alert('Success', 'Session created successfully!')
    } catch (error) {
      console.error('Failed to create session:', error)
      Alert.alert('Error', 'Failed to create session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isStartDisabled = !selectedRepo || !selectedWorkflow || loading

  return (
    <View style={styles.container}>
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
          style={[styles.startButton, isStartDisabled && styles.startButtonDisabled]}
          onPress={handleStartSession}
          disabled={isStartDisabled}
        >
          <Text style={styles.startButtonText}>
            {loading ? 'Starting...' : 'Start Session'}
          </Text>
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
```

#### Features

- Vertical scroll layout with sections
- Auto-generate name on repo + workflow selection
- Editable session name
- Disabled "Start Session" until repo selected
- Loading state during creation
- Error handling with alerts
- Success navigation to dashboard

---

### T074 [US5] - Add FAB to Dashboard

**File**: `app/(tabs)/index.tsx`
**Dependencies**: T068 (FAB component)
**Parallelizable**: No (depends on FAB)

#### Implementation

Add FAB to the existing Dashboard screen:

```typescript
import { FAB } from '@/components/layout/FAB'

export default function DashboardScreen() {
  // ... existing code ...

  return (
    <View style={styles.container}>
      {/* ... existing dashboard content ... */}

      {/* Add FAB at the end */}
      <FAB />
    </View>
  )
}

// FAB styles are self-contained, no additional styles needed
```

#### Notes

- FAB positions itself absolutely (bottom-right)
- No layout changes needed in dashboard
- FAB navigates to `/sessions/new` on press

---

### T075 [US5] - Auto-Generate Session Name

**File**: `app/sessions/new.tsx` (already implemented in T073)
**Dependencies**: None
**Parallelizable**: No (part of T073)

#### Implementation

Already included in T073 above! See `generateSessionName()` function:

```typescript
const generateSessionName = (repoName: string, workflowType: string) => {
  const workflowLabel = WORKFLOWS.find((w) => w.id === workflowType)?.label || workflowType
  const date = new Date()
  const month = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()
  return `${repoName} ${workflowLabel} - ${month} ${day}`
}

// Example outputs:
// "my-repo Review - Nov 27"
// "acp-mobile Bugfix - Nov 28"
// "openshift Plan a Feature - Dec 1"
```

**Status**: ✅ Complete as part of T073

---

## Testing Strategy

### Unit Testing (Optional but Recommended)

```typescript
// services/api/__tests__/repositories.test.ts
import { fetchRepos, addRepo, removeRepo } from '../repositories'

describe('repositories API', () => {
  it('fetchRepos returns array of repositories', async () => {
    const repos = await fetchRepos()
    expect(Array.isArray(repos)).toBe(true)
  })

  it('addRepo creates new repository', async () => {
    const repo = await addRepo('https://github.com/owner/repo')
    expect(repo).toHaveProperty('id')
    expect(repo.name).toBe('owner/repo')
  })
})

// services/api/__tests__/sessions.test.ts
import { createSession } from '../sessions'

describe('sessions API', () => {
  it('createSession returns new session', async () => {
    const session = await createSession({
      name: 'Test Session',
      repositoryId: 'repo-123',
      workflowType: 'review',
      model: 'sonnet-4.5',
    })
    expect(session).toHaveProperty('id')
    expect(session.status).toBe('pending')
  })
})
```

### Integration Testing (Manual)

**Test Case 1: Create Session with Connected Repo**

1. Open app → Dashboard
2. Tap FAB (purple circle, bottom-right)
3. New Session screen opens
4. See list of connected repos
5. Tap a repo → it highlights (purple border)
6. Tap "Review" workflow → highlights
7. Session name auto-fills: "repo-name Review - Nov 27"
8. Model shows "Sonnet 4.5" selected (default)
9. "Start Session" button enabled (purple, not gray)
10. Tap "Start Session"
11. Loading state shows "Starting..."
12. Returns to dashboard
13. New session appears in list with "pending" status

**Test Case 2: Create Session with Custom URL**

1. From New Session screen
2. Tap "Enter GitHub URL" (dashed border)
3. Alert shows "This feature will be implemented in settings"
4. Dismiss alert
5. Continue with connected repo instead

**Test Case 3: Edit Session Name**

1. Select repo + workflow (auto-name fills)
2. Tap session name field
3. Edit to "My Custom Session Name"
4. Tap "Start Session"
5. Session created with custom name

**Test Case 4: Change Model**

1. Select repo + workflow
2. Tap "Opus 4.5" radio button
3. Radio dot moves to Opus
4. Border highlights purple
5. Tap "Start Session"
6. Session created with opus-4.5 model

**Test Case 5: Validation**

1. Open New Session screen (no selections)
2. "Start Session" button is gray (disabled)
3. Tap disabled button → nothing happens
4. Select only repo → still disabled
5. Select only workflow → still disabled
6. Select both → button turns purple (enabled)

**Test Case 6: Workflow Grid Layout**

1. View workflow grid
2. See 2 columns of cards
3. 7 total cards (Review, Bugfix, Plan, Research, Chat, Ideate, New...)
4. "New..." card has yellow "Soon" badge
5. "New..." card is grayed out (opacity 0.5)
6. Tap "New..." → nothing happens (disabled)
7. Tap "Review" → highlights purple

### Acceptance Criteria Validation

✅ **AC1**: FAB visible on dashboard
→ Test: Open dashboard, see purple FAB bottom-right

✅ **AC2**: Repository picker shows connected repos + manual URL
→ Test: See list of repos + "Enter GitHub URL" button

✅ **AC3**: Workflow grid shows 7 options with "Soon" badges
→ Test: See 7 cards, "New..." has "Soon" badge, is disabled

✅ **AC4**: Session name auto-generates as `{repo} {Workflow} - {Month Day}`
→ Test: Select repo + workflow, see "repo-name Review - Nov 27"

✅ **AC5**: Model selection shows sonnet-4.5 (default) and opus-4.5
→ Test: See both options, sonnet selected by default

✅ **AC6**: "Start Session" disabled until repository selected
→ Test: Gray when no repo, purple when repo + workflow selected

---

## Troubleshooting

### Issue: FAB not visible on dashboard

**Symptoms**: Purple button doesn't appear bottom-right

**Solutions**:

1. Check `app/(tabs)/index.tsx` imports FAB correctly
2. Verify FAB component has `position: 'absolute'` in styles
3. Check parent View doesn't have `overflow: 'hidden'`
4. Ensure FAB is rendered last (after all other content)

---

### Issue: Repository list empty

**Symptoms**: "Enter GitHub URL" button shows but no repos

**Solutions**:

1. Check API endpoint: `GET /repositories`
2. Verify user has connected repos in backend
3. Check network tab for 401 (auth issue) or 404 (endpoint missing)
4. Test API directly: `curl -H "Authorization: Bearer $TOKEN" $API_URL/repositories`
5. Add mock data during development:

```typescript
const mockRepos = [
  {
    id: '1',
    name: 'my-repo',
    url: 'https://github.com/owner/my-repo',
    branch: 'main',
    isConnected: true,
  },
]
```

---

### Issue: Session name doesn't auto-generate

**Symptoms**: Name field stays empty after selections

**Solutions**:

1. Check `handleRepoSelect` and `handleWorkflowSelect` call `setSessionName()`
2. Verify `generateSessionName()` returns correct format
3. Check `WORKFLOWS` import is correct
4. Add console.log to debug:

```typescript
console.log('Repo:', selectedRepo?.name)
console.log('Workflow:', selectedWorkflow)
console.log('Generated name:', generatedName)
```

---

### Issue: "Start Session" never enables

**Symptoms**: Button stays gray even after selections

**Solutions**:

1. Check `isStartDisabled` logic: `!selectedRepo || !selectedWorkflow || loading`
2. Verify `selectedRepo` state updates (add console.log)
3. Verify `selectedWorkflow` state updates
4. Check for TypeScript errors in state setters
5. Test each condition:

```typescript
console.log('Repo selected:', selectedRepo)
console.log('Workflow selected:', selectedWorkflow)
console.log('Loading:', loading)
console.log('Is disabled:', isStartDisabled)
```

---

### Issue: Session created but doesn't appear in dashboard

**Symptoms**: Success alert shows but session missing from list

**Solutions**:

1. Check `createSession()` returns session with `id`
2. Verify dashboard fetches sessions on focus (use useFocusEffect)
3. Check session status is valid (backend might filter by status)
4. Add navigation delay to allow backend to process:

```typescript
await createSession(...)
await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
router.replace('/(tabs)')
```

5. Force refresh in dashboard `useSessions` hook

---

### Issue: WorkflowTypeGrid cards too narrow

**Symptoms**: Text wraps awkwardly, cards look cramped

**Solutions**:

1. Adjust `SCREEN_PADDING` constant (default: 24)
2. Reduce `CARD_GAP` (default: 12)
3. Try 3 columns on tablets:

```typescript
const CARDS_PER_ROW = Dimensions.get('window').width > 600 ? 3 : 2
```

4. Add minHeight to cards:

```typescript
card: {
  minHeight: 120,
  // ... other styles
}
```

---

### Issue: TypeScript error on ModelType

**Symptoms**: `Type '"sonnet-4.5"' is not assignable to type 'ModelType'`

**Solutions**:

1. Check `types/session.ts` defines ModelType:

```typescript
export type ModelType = 'sonnet-4.5' | 'opus-4.5'
```

2. Verify import: `import type { ModelType } from '@/types/session'`
3. Check path alias `@/` is configured in `tsconfig.json`

---

## Quick Start Guide

**Ready to implement Phase 7? Follow this checklist:**

### Day 1: Data Layer (1-2 hours)

- [ ] Create `services/api/repositories.ts` (T065)
- [ ] Add `createSession()` to `services/api/sessions.ts` (T066)
- [ ] Verify T067 complete (WORKFLOWS already exists!)
- [ ] Test APIs manually with curl or Postman

### Day 2: UI Components Part 1 (2-3 hours)

- [ ] Create `components/layout/FAB.tsx` (T068)
- [ ] Create `components/session/RepositoryPicker.tsx` (T069)
- [ ] Test components in isolation (add to /modal.tsx temporarily)

### Day 3: UI Components Part 2 (2-3 hours)

- [ ] Create `components/session/WorkflowTypeGrid.tsx` (T070)
- [ ] Create `components/session/ModelSelector.tsx` (T071)
- [ ] Skip T072 (use Ionicons `bulb` instead of custom SVG)
- [ ] Test components in isolation

### Day 4: Integration (2-3 hours)

- [ ] Create `app/sessions/new.tsx` (T073)
- [ ] Add FAB to `app/(tabs)/index.tsx` (T074)
- [ ] T075 auto-complete (part of T073)
- [ ] Test end-to-end flow

### Day 5: Testing & Polish (2-3 hours)

- [ ] Run all integration tests (Test Cases 1-6)
- [ ] Fix any bugs found
- [ ] Add error boundaries
- [ ] Test on iOS and Android
- [ ] Create PR for review

**Total time: 8-14 hours over 5 days**

---

## Update tasks.md

After completing Phase 7, update the checklist in `specs/001-acp-mobile/tasks.md`:

```markdown
## Phase 7: User Story 5 - Start New AI Sessions (Priority: P2) (11 tasks)

**Story Goal**: Initiate new AI coding sessions from phone to kick off work remotely

**Independent Test**: ✅ PASSED - [Date]

**Tasks**:

### Data Layer [US5]

- [x] T065 [P] [US5] Implement repositories API service in services/api/repositories.ts with fetchRepos(), addRepo(), removeRepo()
- [x] T066 [P] [US5] Add createSession() method to services/api/sessions.ts
- [x] T067 [P] [US5] Create workflow types constant in utils/constants.ts with 7 workflows and their metadata (ALREADY COMPLETE)

### UI Components [US5]

- [x] T068 [P] [US5] Create FAB component in components/layout/FAB.tsx with purple circle + plus icon, bottom-right positioning
- [x] T069 [P] [US5] Create RepositoryPicker component in components/session/RepositoryPicker.tsx showing connected repos list + "Enter GitHub URL" option
- [x] T070 [P] [US5] Create WorkflowTypeGrid component in components/session/WorkflowTypeGrid.tsx with 7 workflow cards, "Soon" badges for disabled
- [x] T071 [P] [US5] Create ModelSelector component in components/session/ModelSelector.tsx with sonnet-4.5/opus-4.5 radio buttons and descriptions
- [x] T072 [P] [US5] Create custom lightbulb SVG icon in assets/icons/lightbulb.svg for Ideate workflow (OPTIONAL - using Ionicons instead)

### Screens & Integration [US5]

- [x] T073 [US5] Implement New Session screen in app/sessions/new.tsx with RepositoryPicker, WorkflowTypeGrid, session name field, ModelSelector, "Start Session" button
- [x] T074 [US5] Add FAB to Dashboard (app/(tabs)/index.tsx) that navigates to New Session screen
- [x] T075 [US5] Implement auto-generate session name on repository + workflow selection: "{repo-name} {Workflow} - {Month Day}"
```

---

## Architecture Decisions

### ADR-1: Use Ionicons instead of custom SVG for lightbulb

**Context**: T072 requires a custom lightbulb SVG icon for the Ideate workflow.

**Decision**: Use Ionicons `bulb` icon instead of creating custom SVG.

**Rationale**:

- Consistency: All other icons use Ionicons
- Simplicity: No need to manage SVG assets
- Maintainability: Ionicons handles size/color theming
- Quality: Ionicons icons are professionally designed

**Consequences**:

- T072 becomes optional (mark as OPTIONAL in tasks.md)
- All workflow icons use Ionicons
- Easier to change icons in future (just change name string)

---

### ADR-2: Auto-generate session name on selection, allow editing

**Context**: T075 requires auto-generating session names in format `{repo} {Workflow} - {Month Day}`.

**Decision**: Auto-generate name when BOTH repo and workflow are selected, but allow user to edit.

**Rationale**:

- UX: Saves user typing, provides sensible default
- Flexibility: User can customize if needed (e.g., "Production Bugfix - Nov 27")
- Clarity: Date helps identify when session was created
- Convention: Consistent naming across all sessions

**Alternative considered**: Generate on "Start Session" press

- Rejected because user can't see/edit before creating

**Implementation**:

```typescript
// Triggers on both repo select AND workflow select
handleRepoSelect() -> if workflow set, generate name
handleWorkflowSelect() -> if repo set, generate name
```

---

### ADR-3: Disable "Start Session" until repository selected

**Context**: AC6 requires "Start Session" disabled until repository selected.

**Decision**: Require BOTH repository AND workflow to enable button.

**Rationale**:

- Validation: Can't create session without repo context
- Workflow: Workflow type is required for backend session creation
- UX: Gray button clearly indicates missing steps
- Error prevention: Avoids "Failed to create session" errors

**Alternative considered**: Enable after repo only

- Rejected because workflow is also required

**Implementation**:

```typescript
const isStartDisabled = !selectedRepo || !selectedWorkflow || loading
```

---

## Summary

**Phase 7** adds the ability to create new AI sessions from mobile:

- **11 tasks** total (1 already complete, 1 optional)
- **5 parallelizable** tasks (data layer + UI components)
- **Depends on**: Phases 1-3 (infrastructure + monitoring)
- **Independent test**: Create session end-to-end from dashboard
- **Key files**: `app/sessions/new.tsx`, `services/api/repositories.ts`, 4 new components

**Expected outcome**: Users can tap FAB → select repo → choose workflow → pick model → start session, completing the mobile workflow loop.

**Next phase**: Phase 8 (Settings & Preferences) - manage notifications, repos, appearance

---

## Appendix: File Checklist

Use this checklist to verify all files are created:

```
Phase 7 Files Created:
[ ] services/api/repositories.ts
[ ] components/layout/FAB.tsx
[ ] components/session/RepositoryPicker.tsx
[ ] components/session/WorkflowTypeGrid.tsx
[ ] components/session/ModelSelector.tsx
[ ] app/sessions/new.tsx

Phase 7 Files Modified:
[ ] services/api/sessions.ts (added createSession)
[ ] app/(tabs)/index.tsx (added FAB)
[ ] specs/001-acp-mobile/tasks.md (marked tasks complete)

Phase 7 Files NOT Created (OK):
[ ] assets/icons/lightbulb.svg (using Ionicons instead)
[ ] utils/constants.ts (WORKFLOWS already exists)
```

**Total new files**: 6
**Total modified files**: 3
**Total LOC**: ~800 lines of TypeScript/TSX

---

**END OF IMPLEMENTATION PLAN**

_This plan is a coldstart-able prompt - you can hand it to Claude Code and say "implement Phase 7" and it contains everything needed to complete all 11 tasks._
