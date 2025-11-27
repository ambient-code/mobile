import { apiClient } from './client'
import type { Repository } from '@/types/api'

/**
 * Fetch all connected repositories for the current user
 */
export async function fetchRepos(): Promise<Repository[]> {
  const response = await apiClient.get<Repository[]>('/repositories')
  return response
}

/**
 * Add a new repository by GitHub URL
 * @param url - GitHub repository URL (e.g., https://github.com/owner/repo)
 */
export async function addRepo(url: string): Promise<Repository> {
  const response = await apiClient.post<Repository>('/repositories', { url })
  return response
}

/**
 * Remove a connected repository
 * @param id - Repository ID
 */
export async function removeRepo(id: string): Promise<void> {
  await apiClient.delete(`/repositories/${id}`)
}
