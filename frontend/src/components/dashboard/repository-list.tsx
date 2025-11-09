/**
 * Repository List Component
 *
 * Displays a grid of repository cards with search functionality.
 */

'use client';

import { useState, useMemo } from 'react';
import { RepositoryCard } from './repository-card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FolderOpen } from 'lucide-react';
import type { GitHubRepository } from '@/types';

interface RepositoryListProps {
  repositories: GitHubRepository[];
  isLoading?: boolean;
}

export function RepositoryList({ repositories, isLoading }: RepositoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter repositories based on search query
  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return repositories;

    const query = searchQuery.toLowerCase();
    return repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
    );
  }, [repositories, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <FolderOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No repositories found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          It looks like you don't have any repositories yet. Create one on GitHub to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredRepositories.length} of {repositories.length} repositories
        </p>
      )}

      {/* Repository Grid */}
      {filteredRepositories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories.map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No matches found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try a different search term or clear your search to see all repositories.
          </p>
        </div>
      )}
    </div>
  );
}
