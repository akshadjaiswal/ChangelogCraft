/**
 * Repository Detail Page
 *
 * View repository details and generate changelogs.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRepositories } from '@/hooks/use-repositories';
import { DashboardHeader } from '@/components/dashboard/header';
import { ChangelogGenerator } from '@/components/changelog/changelog-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ExternalLink, Star, GitFork, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';

export default function RepositoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { data: repositories, isLoading: reposLoading } = useRepositories();
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');

  const repositoryId = params.id as string;
  const repository = repositories?.find((r) => r.id.toString() === repositoryId);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state
  if (authLoading || reposLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show error if repository not found
  if (!repository) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Repository not found</h2>
            <p className="mb-6 text-muted-foreground">
              The repository you're looking for doesn't exist or you don't have access.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Repository Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{repository.name}</CardTitle>
                  <CardDescription className="text-base">
                    {repository.description || 'No description'}
                  </CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <a
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {repository.language && (
                  <Badge variant="secondary">{repository.language}</Badge>
                )}
                {repository.private && (
                  <Badge variant="outline">Private</Badge>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{repository.stargazers_count.toLocaleString()} stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>{repository.forks_count.toLocaleString()} forks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {formatDate(repository.updated_at, 'relative')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changelog Generator */}
          <ChangelogGenerator
            repositoryId={repositoryId}
            repositoryName={repository.name}
            onGenerate={setGeneratedMarkdown}
          />

          {/* Generated Changelog Display */}
          {generatedMarkdown && (
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Your changelog has been generated successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMarkdown);
                      toast.success('Copied to clipboard!');
                    }}
                    variant="outline"
                  >
                    Copy Markdown
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `CHANGELOG-${repository.name}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Changelog downloaded!');
                    }}
                    variant="outline"
                  >
                    Download CHANGELOG.md
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
