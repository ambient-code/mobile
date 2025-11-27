import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'
import { fetchRepos, addRepo, removeRepo } from '../repositories'
import type { Repository } from '@/types/api'

describe('Repositories API', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(apiClient.getInstance())
    jest.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('fetchRepos', () => {
    it('fetches all connected repositories successfully', async () => {
      const mockRepos: Repository[] = [
        {
          id: '1',
          name: 'my-app',
          url: 'https://github.com/user/my-app',
          branch: 'main',
          isConnected: true,
        },
        {
          id: '2',
          name: 'another-repo',
          url: 'https://github.com/user/another-repo',
          branch: 'develop',
          isConnected: true,
        },
      ]

      mock.onGet('/repositories').reply(200, mockRepos)

      const result = await fetchRepos()

      expect(result).toEqual(mockRepos)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('my-app')
    })

    it('returns empty array when no repositories exist', async () => {
      mock.onGet('/repositories').reply(200, [])

      const result = await fetchRepos()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('throws error when API request fails', async () => {
      mock.onGet('/repositories').reply(500, { error: 'Internal server error' })

      await expect(fetchRepos()).rejects.toThrow()
    })

    it('throws error when API returns 404', async () => {
      mock.onGet('/repositories').reply(404, { error: 'Not found' })

      await expect(fetchRepos()).rejects.toThrow()
    })

    it('handles network errors gracefully', async () => {
      mock.onGet('/repositories').networkError()

      await expect(fetchRepos()).rejects.toThrow()
    })
  })

  describe('addRepo', () => {
    it('adds a new repository successfully', async () => {
      const newRepo: Repository = {
        id: '3',
        name: 'new-repo',
        url: 'https://github.com/user/new-repo',
        branch: 'main',
        isConnected: true,
      }

      mock.onPost('/repositories', { url: newRepo.url }).reply(201, newRepo)

      const result = await addRepo(newRepo.url)

      expect(result).toEqual(newRepo)
      expect(result.name).toBe('new-repo')
      expect(result.isConnected).toBe(true)
    })

    it('sends correct request body', async () => {
      const url = 'https://github.com/user/test-repo'
      const mockRepo: Repository = {
        id: '4',
        name: 'test-repo',
        url,
        branch: 'main',
        isConnected: true,
      }

      mock.onPost('/repositories').reply((config) => {
        expect(JSON.parse(config.data)).toEqual({ url })
        return [201, mockRepo]
      })

      await addRepo(url)
    })

    it('throws error when repository URL is invalid', async () => {
      const invalidUrl = 'not-a-valid-url'

      mock.onPost('/repositories', { url: invalidUrl }).reply(400, {
        error: 'Invalid repository URL',
      })

      await expect(addRepo(invalidUrl)).rejects.toThrow()
    })

    it('throws error when repository already exists', async () => {
      const existingUrl = 'https://github.com/user/existing-repo'

      mock.onPost('/repositories', { url: existingUrl }).reply(409, {
        error: 'Repository already connected',
      })

      await expect(addRepo(existingUrl)).rejects.toThrow()
    })

    it('handles unauthorized access', async () => {
      const url = 'https://github.com/private/repo'

      mock.onPost('/repositories', { url }).reply(403, {
        error: 'Access denied',
      })

      await expect(addRepo(url)).rejects.toThrow()
    })
  })

  describe('removeRepo', () => {
    it('removes a repository successfully', async () => {
      const repoId = '1'

      mock.onDelete(`/repositories/${repoId}`).reply(204)

      await expect(removeRepo(repoId)).resolves.toBeUndefined()
    })

    it('sends DELETE request to correct endpoint', async () => {
      const repoId = '42'

      mock.onDelete(`/repositories/${repoId}`).reply((config) => {
        expect(config.url).toBe(`/repositories/${repoId}`)
        return [204]
      })

      await removeRepo(repoId)
    })

    it('throws error when repository not found', async () => {
      const repoId = 'nonexistent'

      mock.onDelete(`/repositories/${repoId}`).reply(404, {
        error: 'Repository not found',
      })

      await expect(removeRepo(repoId)).rejects.toThrow()
    })

    it('throws error when trying to remove repository with active sessions', async () => {
      const repoId = '1'

      mock.onDelete(`/repositories/${repoId}`).reply(409, {
        error: 'Cannot remove repository with active sessions',
      })

      await expect(removeRepo(repoId)).rejects.toThrow()
    })

    it('handles server errors gracefully', async () => {
      const repoId = '1'

      mock.onDelete(`/repositories/${repoId}`).reply(500, {
        error: 'Internal server error',
      })

      await expect(removeRepo(repoId)).rejects.toThrow()
    })
  })
})
