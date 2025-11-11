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
import { ChangelogGenerator } from '@/components/changelog/changelog-generator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Star, GitFork, Calendar, Copy, Download, ArrowLeft } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">Repository not found</h2>
          <p className="mb-6 text-muted-foreground">
            The repository you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <Link href="/dashboard/repositories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Repositories
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/repositories" className="transition-colors hover:text-foreground">
            Repositories
          </Link>
          <span>/</span>
          <span className="text-foreground">{repository.name}</span>
        </nav>

        {/* Repository Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <CardTitle className="text-2xl">{repository.name}</CardTitle>
                <CardDescription className="text-base">
                  {repository.description || 'No description'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
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
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {repository.language && (
                <Badge variant="secondary">{repository.language}</Badge>
              )}
              {repository.private && (
                <Badge variant="outline">Private</Badge>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>{repository.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <GitFork className="h-4 w-4" />
                <span>{repository.forks_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
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

        {/* Generated Changelog Display with Tabs */}
        {generatedMarkdown && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Changelog</CardTitle>
                  <CardDescription>
                    Preview and export your changelog
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMarkdown);
                      toast.success('Copied to clipboard!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
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
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="prose prose-slate dark:prose-invert max-w-none rounded-lg border bg-card p-6 prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:font-semibold prose-code:text-blue-600 prose-code:bg-blue-50 dark:prose-code:bg-blue-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {generatedMarkdown}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap font-mono text-sm">
                      {generatedMarkdown}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
