/**
 * Public Changelog Page by ID
 *
 * Publicly accessible changelog page for a specific changelog version.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink, Eye, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { ExportButtons } from '@/components/changelog/export-buttons';

// Enable ISR - revalidate every 24 hours
export const revalidate = 86400;

interface PageProps {
  params: {
    username: string;
    repo: string;
    id: string;
  };
}

async function getChangelogById(changelogId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/changelog/id/${changelogId}`, {
    next: { revalidate: 86400 }, // 24 hours
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, repo } = await params;

  return {
    title: `${username}/${repo} - Changelog | ChangelogCraft`,
    description: `View changelog for ${username}/${repo}`,
    openGraph: {
      title: `${username}/${repo} - Changelog`,
      description: `AI-generated changelog for ${username}/${repo}`,
      type: 'website',
    },
  };
}

export default async function ChangelogByIdPage({ params }: PageProps) {
  const { username, repo, id } = await params;
  const data = await getChangelogById(id);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ChangelogCraft</span>
            </Link>
            <Button asChild>
              <Link href="/">Create Your Own</Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold">Changelog Not Found</h1>
          <p className="mb-8 text-muted-foreground">
            The changelog for {username}/{repo} could not be found.
          </p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </main>
      </div>
    );
  }

  const { changelog, repository } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ChangelogCraft</span>
          </Link>
          <Button asChild>
            <Link href="/">Create Your Own</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Repository Info */}
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
                    href={repository.htmlUrl}
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
                {changelog.templateType && (
                  <Badge variant="outline">{changelog.templateType}</Badge>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{changelog.viewCount.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Generated {formatDate(changelog.generatedAt, 'relative')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changelog Content */}
          <Card>
            <CardHeader>
              <CardTitle>{changelog.title}</CardTitle>
              <CardDescription>
                {changelog.commitCount} commits from {formatDate(changelog.dateFrom)} to{' '}
                {formatDate(changelog.dateTo)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:font-semibold prose-code:text-blue-600 prose-code:bg-blue-50 dark:prose-code:bg-blue-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {changelog.markdown}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export This Changelog</CardTitle>
              <CardDescription>
                Download or copy this changelog for your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportButtons markdown={changelog.markdown} repositoryName={repository.name} />
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Create Your Own Changelog</h3>
              <p className="mb-4 text-muted-foreground">
                Generate beautiful AI-powered changelogs for your repositories
              </p>
              <Button size="lg" asChild>
                <Link href="/">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by <Link href="/" className="font-medium text-foreground hover:underline">ChangelogCraft</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
