/**
 * Commits Hooks
 *
 * TanStack Query hooks for fetching commits.
 */

import { useQuery } from '@tanstack/react-query';
import type { GitHubCommit, DateRangePreset } from '@/types';

export const commitKeys = {
  all: ['commits'] as const,
  lists: () => [...commitKeys.all, 'list'] as const,
  list: (repoId: string, dateRange: DateRangePreset) =>
    [...commitKeys.lists(), repoId, dateRange] as const,
};

interface CommitsResponse {
  commits: GitHubCommit[];
  count: number;
  dateRange: {
    since: string;
    until: string;
  };
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
}

/**
 * Fetch commits for a repository
 */
export function useCommits(repoId: string, dateRange: DateRangePreset = '30days') {
  return useQuery({
    queryKey: commitKeys.list(repoId, dateRange),
    queryFn: async () => {
      const response = await fetch(
        `/api/repositories/${repoId}/commits?dateRange=${dateRange}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch commits');
      }

      return response.json() as Promise<CommitsResponse>;
    },
    enabled: !!repoId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
