/**
 * Dashboard Page
 *
 * Main dashboard showing repositories and stats.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRepositories } from '@/hooks/use-repositories';
import { useChangelogs } from '@/hooks/use-changelogs';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RepositoryList } from '@/components/dashboard/repository-list';
import { ChangelogList } from '@/components/dashboard/changelog-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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
  const stats = {
    totalRepositories: repositories?.length || 0,
    totalChangelogs: changelogsData?.count || 0,
    apiUsage: 0, // TODO: Fetch from API
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your repositories and generate changelogs
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview stats={stats} isLoading={reposLoading} />

          {/* Tabs for Repositories and Changelogs */}
          <Tabs defaultValue="repositories" className="space-y-4">
            <TabsList>
              <TabsTrigger value="repositories">Repositories</TabsTrigger>
              <TabsTrigger value="changelogs">Generated Changelogs</TabsTrigger>
            </TabsList>

            <TabsContent value="repositories" className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Your Repositories</h2>
                <p className="text-sm text-muted-foreground">
                  Select a repository to generate a changelog
                </p>
              </div>

              <RepositoryList
                repositories={repositories || []}
                isLoading={reposLoading}
              />
            </TabsContent>

            <TabsContent value="changelogs" className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Generated Changelogs</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your generated changelogs
                </p>
              </div>

              <ChangelogList
                changelogs={changelogsData?.changelogs || []}
                isLoading={changelogsLoading}
                error={changelogsError}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
