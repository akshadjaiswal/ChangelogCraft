/**
 * Repositories Page
 *
 * Full repository list with search, filtering, sorting, and pagination.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRepositories } from '@/hooks/use-repositories';
import { RepositoryCard } from '@/components/dashboard/repository-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, SlidersHorizontal } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function RepositoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: repositories, isLoading: reposLoading, error } = useRepositories();

  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show error toast if API call fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to load repositories', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    }
  }, [error]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Get unique languages
  const languages = Array.from(
    new Set(repositories?.map((repo: any) => repo.language).filter(Boolean))
  ).sort();

  // Filter and sort repositories
  let filteredRepos = repositories || [];

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredRepos = filteredRepos.filter((repo: any) =>
      repo.name?.toLowerCase().includes(query) ||
      repo.fullName?.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query) ||
      repo.language?.toLowerCase().includes(query)
    );
  }

  // Apply language filter
  if (languageFilter !== 'all') {
    filteredRepos = filteredRepos.filter((repo: any) => repo.language === languageFilter);
  }

  // Apply sorting
  filteredRepos.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stars':
        return (b.stars || 0) - (a.stars || 0);
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  // Paginated repositories
  const paginatedRepos = filteredRepos.slice(0, displayedCount);
  const hasMore = filteredRepos.length > displayedCount;

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage your repositories and generate changelogs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex gap-2">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[150px]">
                <SlidersHorizontal className="mr-2 size-4" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="stars">Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {paginatedRepos.length} of {filteredRepos.length} repositories
          {searchQuery || languageFilter !== 'all' ? ' (filtered)' : ''}
        </div>

        {/* Repository Grid */}
        {reposLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : paginatedRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <Search className="mb-4 size-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No repositories found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || languageFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your GitHub repositories will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedRepos.map((repo: any) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                >
                  Load More ({filteredRepos.length - displayedCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
