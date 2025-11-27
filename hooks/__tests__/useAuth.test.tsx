import { renderHook, waitFor } from '@testing-library/react-native'
import { useAuth, AuthProvider } from '../useAuth'
import { TokenManager } from '@/services/auth/token-manager'
import { AuthAPI } from '@/services/api/auth'
import type { ReactNode } from 'react'

jest.mock('@/services/auth/token-manager')
jest.mock('@/services/api/auth')

describe('useAuth', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with unauthenticated state', async () => {
    ;(TokenManager.isAuthenticated as jest.Mock).mockResolvedValue(false)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('loads authenticated user on mount', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }

    ;(TokenManager.isAuthenticated as jest.Mock).mockResolvedValue(true)
    ;(AuthAPI.getUserProfile as jest.Mock).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
  })

  it('clears tokens and logs out when profile fetch fails', async () => {
    ;(TokenManager.isAuthenticated as jest.Mock).mockResolvedValue(true)
    ;(AuthAPI.getUserProfile as jest.Mock).mockRejectedValue(new Error('Network error'))
    ;(TokenManager.clearTokens as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(TokenManager.clearTokens).toHaveBeenCalled()
  })
})
