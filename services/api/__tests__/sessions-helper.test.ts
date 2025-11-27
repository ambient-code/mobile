import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '../client'
import { createSessionFromRepo, SessionsAPI } from '../sessions'
import { SessionStatus, ModelType } from '@/types/session'
import type { Session } from '@/types/session'

describe('createSessionFromRepo', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(apiClient.getInstance())
    jest.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  const createMockSession = (overrides?: Partial<Session>): Session => ({
    id: 'session-123',
    name: 'my-app Review - Nov 27',
    status: SessionStatus.RUNNING,
    progress: 0,
    model: ModelType.SONNET_4_5,
    workflowType: 'review',
    repository: {
      id: 'repo-1',
      name: 'my-app',
      url: 'https://github.com/user/my-app',
      branch: 'main',
      isConnected: true,
    },
    createdAt: new Date('2025-11-27T10:00:00Z'),
    updatedAt: new Date('2025-11-27T10:00:00Z'),
    currentTask: null,
    tasksCompleted: [],
    errorMessage: null,
    ...overrides,
  })

  describe('successful session creation', () => {
    it('creates session with minimum required parameters', async () => {
      const mockSession = createMockSession()

      mock.onPost('/sessions').reply((config) => {
        const payload = JSON.parse(config.data)
        expect(payload).toEqual({
          name: 'my-app Review - Nov 27',
          workflowType: 'review',
          model: 'sonnet-4.5',
          repositoryUrl: 'repo-1',
        })
        return [
          201,
          {
            ...mockSession,
            createdAt: mockSession.createdAt.toISOString(),
            updatedAt: mockSession.updatedAt.toISOString(),
          },
        ]
      })

      const result = await createSessionFromRepo({
        name: 'my-app Review - Nov 27',
        repositoryId: 'repo-1',
        workflowType: 'review',
        model: 'sonnet-4.5',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('my-app Review - Nov 27')
      expect(result.workflowType).toBe('review')
      expect(result.model).toBe(ModelType.SONNET_4_5)
    })

    it('creates session with Opus model', async () => {
      const mockSession = createMockSession({
        model: ModelType.OPUS_4_5,
        name: 'my-app Bugfix - Nov 27',
      })

      mock.onPost('/sessions').reply((config) => {
        const payload = JSON.parse(config.data)
        expect(payload.model).toBe('opus-4.5')
        return [
          201,
          {
            ...mockSession,
            createdAt: mockSession.createdAt.toISOString(),
            updatedAt: mockSession.updatedAt.toISOString(),
          },
        ]
      })

      const result = await createSessionFromRepo({
        name: 'my-app Bugfix - Nov 27',
        repositoryId: 'repo-1',
        workflowType: 'bugfix',
        model: 'opus-4.5',
      })

      expect(result.model).toBe(ModelType.OPUS_4_5)
    })

    it('creates session with different workflow types', async () => {
      const workflows = ['review', 'bugfix', 'plan', 'research', 'chat', 'ideate']

      for (const workflow of workflows) {
        const mockSession = createMockSession({
          workflowType: workflow,
          name: `test-repo ${workflow} - Nov 27`,
        })

        mock.onPost('/sessions').reply((config) => {
          const payload = JSON.parse(config.data)
          expect(payload.workflowType).toBe(workflow)
          return [
            201,
            {
              ...mockSession,
              createdAt: mockSession.createdAt.toISOString(),
              updatedAt: mockSession.updatedAt.toISOString(),
            },
          ]
        })

        const result = await createSessionFromRepo({
          name: `test-repo ${workflow} - Nov 27`,
          repositoryId: 'repo-1',
          workflowType: workflow,
          model: 'sonnet-4.5',
        })

        expect(result.workflowType).toBe(workflow)
        mock.reset()
      }
    })
  })

  describe('API contract verification', () => {
    it('passes repositoryId as repositoryUrl to backend', async () => {
      const mockSession = createMockSession()
      let capturedPayload: any

      mock.onPost('/sessions').reply((config) => {
        capturedPayload = JSON.parse(config.data)
        return [
          201,
          {
            ...mockSession,
            createdAt: mockSession.createdAt.toISOString(),
            updatedAt: mockSession.updatedAt.toISOString(),
          },
        ]
      })

      await createSessionFromRepo({
        name: 'test session',
        repositoryId: 'repo-123',
        workflowType: 'review',
        model: 'sonnet-4.5',
      })

      // Verify the API contract quirk: repositoryId is sent as repositoryUrl
      expect(capturedPayload.repositoryUrl).toBe('repo-123')
      expect(capturedPayload.repositoryId).toBeUndefined()
    })

    it('does not include description in request when not provided', async () => {
      const mockSession = createMockSession()
      let capturedPayload: any

      mock.onPost('/sessions').reply((config) => {
        capturedPayload = JSON.parse(config.data)
        return [
          201,
          {
            ...mockSession,
            createdAt: mockSession.createdAt.toISOString(),
            updatedAt: mockSession.updatedAt.toISOString(),
          },
        ]
      })

      await createSessionFromRepo({
        name: 'test session',
        repositoryId: 'repo-1',
        workflowType: 'review',
        model: 'sonnet-4.5',
      })

      expect(capturedPayload.description).toBeUndefined()
      expect(Object.keys(capturedPayload)).toEqual([
        'name',
        'workflowType',
        'model',
        'repositoryUrl',
      ])
    })
  })

  describe('error handling', () => {
    it('throws error when session name is empty', async () => {
      mock.onPost('/sessions').reply(400, {
        error: 'Session name is required',
      })

      await expect(
        createSessionFromRepo({
          name: '',
          repositoryId: 'repo-1',
          workflowType: 'review',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })

    it('throws error when repository not found', async () => {
      mock.onPost('/sessions').reply(404, {
        error: 'Repository not found',
      })

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'nonexistent-repo',
          workflowType: 'review',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })

    it('throws error when workflow type is invalid', async () => {
      mock.onPost('/sessions').reply(400, {
        error: 'Invalid workflow type',
      })

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'repo-1',
          workflowType: 'invalid-workflow',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })

    it('throws error when model type is invalid', async () => {
      mock.onPost('/sessions').reply(400, {
        error: 'Invalid model type',
      })

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'repo-1',
          workflowType: 'review',
          model: 'invalid-model',
        })
      ).rejects.toThrow()
    })

    it('handles server errors gracefully', async () => {
      mock.onPost('/sessions').reply(500, {
        error: 'Internal server error',
      })

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'repo-1',
          workflowType: 'review',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })

    it('handles network errors', async () => {
      mock.onPost('/sessions').networkError()

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'repo-1',
          workflowType: 'review',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })
  })

  describe('Zod schema validation', () => {
    it('validates response data matches session schema', async () => {
      const mockSession = createMockSession()

      mock.onPost('/sessions').reply(201, {
        ...mockSession,
        createdAt: mockSession.createdAt.toISOString(),
        updatedAt: mockSession.updatedAt.toISOString(),
      })

      const result = await createSessionFromRepo({
        name: 'test session',
        repositoryId: 'repo-1',
        workflowType: 'review',
        model: 'sonnet-4.5',
      })

      // Zod schema will transform ISO strings to Date objects
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(result.repository).toBeDefined()
      expect(result.repository.url).toMatch(/^https?:\/\//)
    })

    it('throws validation error when response is malformed', async () => {
      mock.onPost('/sessions').reply(201, {
        id: 'session-123',
        // Missing required fields like name, status, model, etc.
      })

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'repo-1',
          workflowType: 'review',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })

    it('throws validation error when repository URL is invalid', async () => {
      const mockSession = createMockSession()

      mock.onPost('/sessions').reply(201, {
        ...mockSession,
        repository: {
          ...mockSession.repository,
          url: 'not-a-valid-url', // Invalid URL
        },
        createdAt: mockSession.createdAt.toISOString(),
        updatedAt: mockSession.updatedAt.toISOString(),
      })

      await expect(
        createSessionFromRepo({
          name: 'test session',
          repositoryId: 'repo-1',
          workflowType: 'review',
          model: 'sonnet-4.5',
        })
      ).rejects.toThrow()
    })
  })
})
