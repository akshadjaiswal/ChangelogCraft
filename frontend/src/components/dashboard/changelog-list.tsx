'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, FileText, Calendar, GitCommit, Eye, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

interface ChangelogListProps {
  changelogs: ChangelogWithRepository[];
  isLoading: boolean;
  error: Error | null;
}

export function ChangelogList({ changelogs, isLoading, error }: ChangelogListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChangelogs = changelogs.filter((changelog) =>
    changelog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    changelog.repository.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">Failed to load changelogs. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search changelogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredChangelogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 text-center">
              {searchQuery ? 'No changelogs found matching your search.' : 'No changelogs generated yet.'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-400 mt-2">
                Generate your first changelog from a repository to get started.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChangelogs.map((changelog) => (
            <Card key={changelog.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{changelog.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {changelog.repository.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    {changelog.templateType && (
                      <Badge variant="secondary" className="text-xs">
                        {changelog.templateType}
                      </Badge>
                    )}
                    {changelog.repository.language && (
                      <Badge variant="outline" className="text-xs">
                        {changelog.repository.language}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <GitCommit className="h-3 w-3" />
                    <span>{changelog.commitCount} commits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{changelog.viewCount} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(changelog.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild variant="default" size="sm" className="flex-1">
                    <Link href={`/changelog/${changelog.repository.full_name.split('/')[0]}/${changelog.repository.full_name.split('/')[1]}/${changelog.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={changelog.repository.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
