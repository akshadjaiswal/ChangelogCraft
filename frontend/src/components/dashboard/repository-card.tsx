/**
 * Repository Card Component
 *
 * Displays a single repository with actions.
 */

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink, Star } from 'lucide-react';
import type { GitHubRepository } from '@/types';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/date';

interface RepositoryCardProps {
  repository: GitHubRepository;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const router = useRouter();

  const handleGenerateChangelog = () => {
    router.push(`/dashboard/repositories/${repository.id}`);
  };

  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-500';

    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-600',
      Python: 'bg-blue-500',
      Java: 'bg-red-600',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
      Ruby: 'bg-red-500',
      PHP: 'bg-indigo-500',
      Swift: 'bg-orange-500',
      Kotlin: 'bg-purple-600',
      'C#': 'bg-green-600',
      'C++': 'bg-pink-600',
    };

    return colors[language] || 'bg-gray-500';
  };

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg truncate">
              <span className="truncate">{repository.name}</span>
              {repository.private && (
                <Badge variant="outline" className="text-xs">
                  Private
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">
              {repository.description || 'No description'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {repository.language && (
            <div className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full ${getLanguageColor(repository.language)}`} />
              <span>{repository.language}</span>
            </div>
          )}
          {repository.stargazers_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              <span>{repository.stargazers_count.toLocaleString()}</span>
            </div>
          )}
          <span>Updated {formatDate(repository.updated_at, 'relative')}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={handleGenerateChangelog} className="flex-1 gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Changelog
        </Button>
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
