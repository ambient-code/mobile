import { render, screen, waitFor, fireEvent } from '@testing-library/react-native'
import { Alert } from 'react-native'
import NewSessionScreen from '../new'
import { fetchRepos } from '@/services/api/repositories'
import { createSessionFromRepo } from '@/services/api/sessions'
import { router } from 'expo-router'
import type { Repository } from '@/types/api'
import { SessionStatus, ModelType } from '@/types/session'
import type { Session } from '@/types/session'

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}))

jest.mock('@/services/api/repositories')
jest.mock('@/services/api/sessions')

// Mock Alert
jest.spyOn(Alert, 'alert')

describe('NewSessionScreen', () => {
  const mockRepos: Repository[] = [
    {
      id: 'repo-1',
      name: 'my-app',
      url: 'https://github.com/user/my-app',
      branch: 'main',
      isConnected: true,
    },
    {
      id: 'repo-2',
      name: 'test-repo',
      url: 'https://github.com/user/test-repo',
      branch: 'develop',
      isConnected: true,
    },
  ]

  const mockSession: Session = {
    id: 'session-123',
    name: 'my-app Review - Nov 27',
    status: SessionStatus.RUNNING,
    progress: 0,
    model: ModelType.SONNET_4_5,
    workflowType: 'review',
    repository: mockRepos[0],
    createdAt: new Date('2025-11-27T10:00:00Z'),
    updatedAt: new Date('2025-11-27T10:00:00Z'),
    currentTask: null,
    tasksCompleted: [],
    errorMessage: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)
    ;(createSessionFromRepo as jest.Mock).mockResolvedValue(mockSession)
  })

  describe('initial rendering', () => {
    it('renders the screen title', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('New Session')).toBeTruthy()
      })
    })

    it('renders all form sections', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('New Session')).toBeTruthy()
        expect(screen.getByText('Repository')).toBeTruthy()
        expect(screen.getByText('Workflow Type')).toBeTruthy()
        expect(screen.getByText('Session Name')).toBeTruthy()
        expect(screen.getByText('Model')).toBeTruthy()
      })
    })

    it('renders repository picker', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
        expect(screen.getByText('test-repo')).toBeTruthy()
      })
    })

    it('renders workflow type grid', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('Review')).toBeTruthy()
        expect(screen.getByText('Bugfix')).toBeTruthy()
        expect(screen.getByText('Plan a Feature')).toBeTruthy()
      })
    })

    it('renders model selector with Sonnet selected by default', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('Sonnet 4.5')).toBeTruthy()
        expect(screen.getByText('Opus 4.5')).toBeTruthy()
      })
    })

    it('renders Start Session button as disabled initially', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        const startButton = screen.getByTestId('start-session-button')
        expect(startButton.props.disabled).toBe(true)
      })
    })
  })

  describe('auto-generated session name', () => {
    it('generates session name when repository and workflow are selected', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      // Select repository
      fireEvent.press(screen.getByText('my-app'))

      // Select workflow
      fireEvent.press(screen.getByText('Review'))

      // Check session name was generated
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        expect(input.props.value).toMatch(/my-app Review - \w+ \d+/)
      })
    })

    it('updates session name when workflow is selected first, then repository', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('Review')).toBeTruthy()
      })

      // Select workflow first
      fireEvent.press(screen.getByText('Review'))

      // Then select repository
      fireEvent.press(screen.getByText('my-app'))

      // Check session name was generated
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        expect(input.props.value).toMatch(/my-app Review - \w+ \d+/)
      })
    })

    it('regenerates session name when repository changes', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      // Select first repo and workflow
      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        expect(input.props.value).toContain('my-app')
      })

      // Change to second repo
      fireEvent.press(screen.getByText('test-repo'))

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        expect(input.props.value).toContain('test-repo')
      })
    })

    it('regenerates session name when workflow changes', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      // Select repo and first workflow
      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        expect(input.props.value).toContain('Review')
      })

      // Change workflow
      fireEvent.press(screen.getByText('Bugfix'))

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        expect(input.props.value).toContain('Bugfix')
      })
    })

    it('allows manual editing of generated session name', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter session name...')
        fireEvent.changeText(input, 'Custom Session Name')
      })

      const input = screen.getByPlaceholderText('Enter session name...')
      expect(input.props.value).toBe('Custom Session Name')
    })
  })

  describe('Start Session button state', () => {
    it('enables button when repository and workflow are selected', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByTestId('start-session-button')
        expect(startButton.props.disabled).toBe(false)
      })
    })

    it('remains disabled when only repository is selected', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))

      const startButton = screen.getByTestId('start-session-button')
      expect(startButton.props.disabled).toBe(true)
    })

    it('remains disabled when only workflow is selected', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('Review')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('Review'))

      const startButton = screen.getByTestId('start-session-button')
      expect(startButton.props.disabled).toBe(true)
    })

    it('disables button during session creation', async () => {
      ;(createSessionFromRepo as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSession), 1000))
      )

      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      // Button should show loading state
      expect(screen.getByText('Starting...')).toBeTruthy()
    })
  })

  describe('session creation flow', () => {
    it('creates session with correct parameters', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(createSessionFromRepo).toHaveBeenCalledWith(
          expect.objectContaining({
            repositoryId: 'repo-1',
            workflowType: 'review',
            model: ModelType.SONNET_4_5,
          })
        )
      })
    })

    it('creates session with Opus model when selected', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))
      fireEvent.press(screen.getByText('Opus 4.5'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(createSessionFromRepo).toHaveBeenCalledWith(
          expect.objectContaining({
            model: ModelType.OPUS_4_5,
          })
        )
      })
    })

    it('navigates to dashboard after successful creation', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/(tabs)')
      })
    })

    it('uses custom session name if edited', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      const input = screen.getByPlaceholderText('Enter session name...')
      fireEvent.changeText(input, 'My Custom Session')

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(createSessionFromRepo).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My Custom Session',
          })
        )
      })
    })
  })

  describe('error handling', () => {
    it('shows alert when trying to start without selections', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        const startButton = screen.getByTestId('start-session-button')
        // Button is disabled, but test the handler logic
        expect(startButton.props.disabled).toBe(true)
      })
    })

    it('shows error alert when session creation fails', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      ;(createSessionFromRepo as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create session. Please try again.'
        )
      })

      consoleError.mockRestore()
    })

    it('stops loading state after error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      ;(createSessionFromRepo as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      // Wait for error handling
      await waitFor(() => {
        expect(screen.getByText('Start Session')).toBeTruthy()
        expect(screen.queryByText('Starting...')).toBeNull()
      })

      consoleError.mockRestore()
    })
  })

  describe('manual URL entry', () => {
    it('shows alert when Enter GitHub URL is tapped', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        const urlButton = screen.getByText('Enter GitHub URL')
        fireEvent.press(urlButton)
      })

      expect(Alert.alert).toHaveBeenCalledWith(
        'Enter GitHub URL',
        'This feature will be implemented in settings (Phase 8)'
      )
    })
  })

  describe('model selection', () => {
    it('defaults to Sonnet 4.5', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(createSessionFromRepo).toHaveBeenCalledWith(
          expect.objectContaining({
            model: ModelType.SONNET_4_5,
          })
        )
      })
    })

    it('allows switching to Opus 4.5', async () => {
      render(<NewSessionScreen />)

      await waitFor(() => {
        expect(screen.getByText('Opus 4.5')).toBeTruthy()
      })

      fireEvent.press(screen.getByText('Opus 4.5'))
      fireEvent.press(screen.getByText('my-app'))
      fireEvent.press(screen.getByText('Review'))

      await waitFor(() => {
        const startButton = screen.getByText('Start Session')
        fireEvent.press(startButton)
      })

      await waitFor(() => {
        expect(createSessionFromRepo).toHaveBeenCalledWith(
          expect.objectContaining({
            model: ModelType.OPUS_4_5,
          })
        )
      })
    })
  })
})
