/**
 * Repository Hooks
 *
 * TanStack Query hooks for fetching and managing repositories.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GitHubRepository } from '@/types';

export const repositoryKeys = {
  all: ['repositories'] as const,
  list: () => [...repositoryKeys.all, 'list'] as const,
  detail: (id: string) => [...repositoryKeys.all, 'detail', id] as const,
};

/**
 * Fetch all user repositories from GitHub
 */
export function useRepositories() {
  return useQuery({
    queryKey: repositoryKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      return data.repositories as GitHubRepository[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single repository
 */
export function useRepository(id: string) {
  return useQuery({
    queryKey: repositoryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/repositories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Sync repository to database
 */
export function useSyncRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repoId: number) => {
      const response = await fetch('/api/repositories/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync repository');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
    },
  });
}
