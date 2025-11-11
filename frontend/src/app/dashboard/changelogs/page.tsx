/**
 * Changelogs Page
 *
 * Full changelog list with search, filtering, sorting, and pagination.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChangelogs } from '@/hooks/use-changelogs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Search, Eye, ExternalLink, FileText, SlidersHorizontal } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function ChangelogsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: changelogsData, isLoading: changelogsLoading, error: changelogsError } = useChangelogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show error toast if API call fails
  useEffect(() => {
    if (changelogsError) {
      toast.error('Failed to load changelogs', {
        description: changelogsError instanceof Error ? changelogsError.message : 'Please try again later',
      });
    }
  }, [changelogsError]);

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

  const changelogs = changelogsData?.changelogs || [];

  // Get unique template types
  const templateTypes = Array.from(
    new Set(changelogs.map((cl: any) => cl.templateType).filter(Boolean))
  ).sort();

  // Filter and sort changelogs
  let filteredChangelogs = [...changelogs];

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredChangelogs = filteredChangelogs.filter((changelog: any) =>
      changelog.title?.toLowerCase().includes(query) ||
      changelog.repository?.name?.toLowerCase().includes(query) ||
      changelog.repository?.fullName?.toLowerCase().includes(query)
    );
  }

  // Apply template filter
  if (templateFilter !== 'all') {
    filteredChangelogs = filteredChangelogs.filter((cl: any) => cl.templateType === templateFilter);
  }

  // Apply sorting
  filteredChangelogs.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'views':
        return (b.viewCount || 0) - (a.viewCount || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Paginated changelogs
  const paginatedChangelogs = filteredChangelogs.slice(0, displayedCount);
  const hasMore = filteredChangelogs.length > displayedCount;

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Changelogs</h1>
          <p className="text-muted-foreground">
            View and manage your generated changelogs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search changelogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex gap-2">
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-[150px]">
                <SlidersHorizontal className="mr-2 size-4" />
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {templateTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest First</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {paginatedChangelogs.length} of {filteredChangelogs.length} changelogs
          {searchQuery || templateFilter !== 'all' ? ' (filtered)' : ''}
        </div>

        {/* Changelogs Grid */}
        {changelogsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : paginatedChangelogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <FileText className="mb-4 size-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No changelogs found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || templateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Generate your first changelog to get started'}
            </p>
            {!searchQuery && templateFilter === 'all' && (
              <Button variant="default" size="sm" asChild className="mt-4">
                <Link href="/dashboard/repositories">
                  Browse Repositories
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedChangelogs.map((changelog: any) => {
                const username = changelog.repository.full_name.split('/')[0];
                const repoName = changelog.repository.full_name.split('/')[1];
                const changelogUrl = `/changelog/${username}/${repoName}/${changelog.id}`;

                return (
                  <Card key={changelog.id} className="flex flex-col transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-1 flex-col gap-3 p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 font-semibold">{changelog.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {changelog.repository.name}
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {changelog.templateType}
                        </Badge>
                        {changelog.repository.language && (
                          <Badge variant="outline" className="text-xs">
                            {changelog.repository.language}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{changelog.commitCount} commits</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {changelog.viewCount} views
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(changelog.createdAt), { addSuffix: true })}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={changelogUrl}>
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={changelog.repository.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                >
                  Load More ({filteredChangelogs.length - displayedCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
