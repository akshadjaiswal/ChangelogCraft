/**
 * Changelog Hooks
 *
 * TanStack Query hooks for fetching and managing changelogs.
 */

import { useQuery } from '@tanstack/react-query';
import type { Changelog } from '@/types';

interface ChangelogWithRepository extends Changelog {
  repository: {
    id: string;
    name: string;
    full_name: string;
    html_url: string;
    language: string | null;
  };
}

interface ChangelogsResponse {
  changelogs: ChangelogWithRepository[];
  count: number;
}

export const changelogKeys = {
  all: ['changelogs'] as const,
  list: () => [...changelogKeys.all, 'list'] as const,
};

/**
 * Fetch all user changelogs
 */
export function useChangelogs() {
  return useQuery<ChangelogsResponse>({
    queryKey: changelogKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/changelogs');
      if (!response.ok) {
        throw new Error('Failed to fetch changelogs');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
