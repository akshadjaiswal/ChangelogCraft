/**
 * Dashboard Page
 *
 * Overview dashboard with stats and recent activity.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRepositories } from '@/hooks/use-repositories';
import { useChangelogs } from '@/hooks/use-changelogs';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Eye, FileText, FolderGit2, ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: repositories, isLoading: reposLoading, error } = useRepositories();
  const { data: changelogsData, isLoading: changelogsLoading, error: changelogsError } = useChangelogs();

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

  // Calculate stats
  const totalViews = changelogsData?.changelogs?.reduce((sum: number, cl: any) => sum + (cl.viewCount || 0), 0) || 0;
  const stats = {
    totalRepositories: repositories?.length || 0,
    totalChangelogs: changelogsData?.count || 0,
    totalViews,
  };

  // Get recent changelogs (last 5)
  const recentChangelogs = changelogsData?.changelogs?.slice(0, 5) || [];

  // Get recent repositories (last 4 updated)
  const recentRepos = repositories?.slice(0, 4) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your changelog activity
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={reposLoading || changelogsLoading} />

        {/* Recent Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Changelogs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5" />
                    Recent Changelogs
                  </CardTitle>
                  <CardDescription>Your latest generated changelogs</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/changelogs">
                    View All
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {changelogsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : recentChangelogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No changelogs yet</p>
                  <Button variant="link" size="sm" asChild className="mt-2">
                    <Link href="/dashboard/repositories">Generate your first changelog</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentChangelogs.map((changelog: any) => (
                    <Link
                      key={changelog.id}
                      href={`/changelog/${changelog.repository.full_name.split('/')[0]}/${changelog.repository.full_name.split('/')[1]}/${changelog.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{changelog.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{changelog.repository.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {changelog.templateType}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="size-3" />
                            {changelog.viewCount}
                          </span>
                        </div>
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(changelog.createdAt), { addSuffix: true })}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Repositories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderGit2 className="size-5" />
                    Your Repositories
                  </CardTitle>
                  <CardDescription>Quick access to your repositories</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/repositories">
                    View All
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reposLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : recentRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderGit2 className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No repositories connected</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your GitHub repositories will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRepos.map((repo: any) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{repo.name}</p>
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-2 flex gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/repositories/${repo.id}`}>
                            <Sparkles className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
