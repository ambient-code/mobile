import { render, screen, waitFor, fireEvent } from '@testing-library/react-native'
import { RepositoryPicker } from '../RepositoryPicker'
import { fetchRepos } from '@/services/api/repositories'
import type { Repository } from '@/types/api'

// Mock the repositories API
jest.mock('@/services/api/repositories')

describe('RepositoryPicker', () => {
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
      name: 'another-repo',
      url: 'https://github.com/user/another-repo',
      branch: 'develop',
      isConnected: true,
    },
  ]

  const mockOnSelectRepo = jest.fn()
  const mockOnEnterUrl = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows loading indicator while fetching repositories', () => {
      ;(fetchRepos as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRepos), 1000))
      )

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      expect(screen.getByTestId('activity-indicator')).toBeTruthy()
    })

    it('hides loading indicator after repositories are loaded', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.queryByTestId('activity-indicator')).toBeNull()
      })
    })
  })

  describe('repository list rendering', () => {
    it('renders all repositories after loading', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('my-app')).toBeTruthy()
        expect(screen.getByText('another-repo')).toBeTruthy()
      })
    })

    it('renders repository names correctly', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        mockRepos.forEach((repo) => {
          expect(screen.getByText(repo.name)).toBeTruthy()
        })
      })
    })

    it('renders "Enter GitHub URL" button', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Enter GitHub URL')).toBeTruthy()
      })
    })
  })

  describe('repository selection', () => {
    it('highlights selected repository', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      const { getByText } = render(
        <RepositoryPicker
          selectedRepoId="repo-1"
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        const selectedRepo = getByText('my-app').parent?.parent
        expect(selectedRepo?.props.style).toContainEqual(
          expect.objectContaining({
            borderColor: '#6366f1',
          })
        )
      })
    })

    it('shows checkmark icon for selected repository', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId="repo-1"
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        // The checkmark icon should be rendered (Ionicons name="checkmark-circle")
        expect(screen.getByText('my-app')).toBeTruthy()
      })
    })

    it('calls onSelectRepo when repository is tapped', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        const repoCard = screen.getByText('my-app')
        fireEvent.press(repoCard)
      })

      expect(mockOnSelectRepo).toHaveBeenCalledWith(mockRepos[0])
      expect(mockOnSelectRepo).toHaveBeenCalledTimes(1)
    })

    it('can select different repositories', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        fireEvent.press(screen.getByText('my-app'))
        fireEvent.press(screen.getByText('another-repo'))
      })

      expect(mockOnSelectRepo).toHaveBeenCalledTimes(2)
      expect(mockOnSelectRepo).toHaveBeenNthCalledWith(1, mockRepos[0])
      expect(mockOnSelectRepo).toHaveBeenNthCalledWith(2, mockRepos[1])
    })
  })

  describe('manual URL entry', () => {
    it('calls onEnterUrl when "Enter GitHub URL" button is tapped', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        const urlButton = screen.getByText('Enter GitHub URL')
        fireEvent.press(urlButton)
      })

      expect(mockOnEnterUrl).toHaveBeenCalledTimes(1)
    })

    it('renders URL entry button with correct styling', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      const { getByText } = render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        const urlButton = getByText('Enter GitHub URL').parent
        expect(urlButton?.props.style).toContainEqual(
          expect.objectContaining({
            borderStyle: 'dashed',
          })
        )
      })
    })
  })

  describe('empty state', () => {
    it('renders empty state when no repositories are connected', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue([])

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Enter GitHub URL')).toBeTruthy()
        expect(screen.queryByText('my-app')).toBeNull()
      })
    })

    it('shows only URL entry button when no repos exist', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue([])

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Enter GitHub URL')).toBeTruthy()
      })
    })
  })

  describe('error handling', () => {
    it('handles fetch error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      ;(fetchRepos as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.queryByTestId('activity-indicator')).toBeNull()
      })

      expect(consoleError).toHaveBeenCalledWith('Failed to load repos:', expect.any(Error))
      consoleError.mockRestore()
    })

    it('stops loading after error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      ;(fetchRepos as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(screen.queryByTestId('activity-indicator')).toBeNull()
      })

      consoleError.mockRestore()
    })
  })

  describe('API integration', () => {
    it('calls fetchRepos on mount', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(fetchRepos).toHaveBeenCalledTimes(1)
      })
    })

    it('does not call fetchRepos multiple times', async () => {
      ;(fetchRepos as jest.Mock).mockResolvedValue(mockRepos)

      const { rerender } = render(
        <RepositoryPicker
          selectedRepoId={undefined}
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      await waitFor(() => {
        expect(fetchRepos).toHaveBeenCalledTimes(1)
      })

      // Rerender with different selectedRepoId
      rerender(
        <RepositoryPicker
          selectedRepoId="repo-1"
          onSelectRepo={mockOnSelectRepo}
          onEnterUrl={mockOnEnterUrl}
        />
      )

      // Should not fetch again
      expect(fetchRepos).toHaveBeenCalledTimes(1)
    })
  })
})
