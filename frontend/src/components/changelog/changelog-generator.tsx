/**
 * Changelog Generator Component
 *
 * UI for generating changelogs with settings and streaming display.
 */

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import type { DateRangePreset, TemplateType } from '@/types';
import { TEMPLATE_EXAMPLES } from '@/lib/groq/prompts';
import { changelogKeys } from '@/hooks/use-changelogs';
import { toast } from 'sonner';

interface ChangelogGeneratorProps {
  repositoryId: string;
  repositoryName: string;
  onGenerate: (markdown: string) => void;
}

export function ChangelogGenerator({
  repositoryId,
  repositoryName,
  onGenerate,
}: ChangelogGeneratorProps) {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRangePreset>('30days');
  const [templateType, setTemplateType] = useState<TemplateType>('detailed');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStreamedContent('');

    try {
      const response = await fetch('/api/changelog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryId,
          dateRange,
          templateType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle specific error cases
        if (error.error === 'No commits found in the specified date range') {
          toast.error('No commits found', {
            description: `No commits were found in the selected date range (${dateRange}). Try selecting a longer time period.`,
            action: {
              label: 'Change Range',
              onClick: () => {
                // Suggest longer date range
                if (dateRange === '7days') {
                  setDateRange('30days');
                } else if (dateRange === '30days') {
                  setDateRange('90days');
                }
              },
            },
          });
        } else {
          toast.error('Failed to generate changelog', {
            description: error.error || 'An unexpected error occurred',
          });
        }

        setStreamedContent('');
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      const markdown = data.markdown;

      // Update streamed content
      setStreamedContent(markdown);

      // Call onGenerate with full markdown
      onGenerate(markdown);

      // Invalidate changelogs query to refresh dashboard
      queryClient.invalidateQueries({ queryKey: changelogKeys.all });

      toast.success('Changelog generated successfully!', {
        description: `Generated from ${data.commitCount} commits`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);

      // Handle network errors or other unexpected errors
      const errorMessage = error.message || 'An unexpected error occurred';
      let description = errorMessage;

      if (errorMessage.includes('fetch')) {
        description = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('timeout')) {
        description = 'Request timed out. The repository might be too large. Try a shorter date range.';
      }

      toast.error('Failed to generate changelog', {
        description,
      });

      setStreamedContent('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>
            Customize how your changelog will be generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as DateRangePreset)}
              disabled={isGenerating}
            >
              <SelectTrigger id="date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the time period for commits to include
            </p>
          </div>

          {/* Template Type */}
          <div className="space-y-2">
            <Label htmlFor="template">Template Style</Label>
            <Select
              value={templateType}
              onValueChange={(value) => setTemplateType(value as TemplateType)}
              disabled={isGenerating}
            >
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATE_EXAMPLES).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the style and detail level of your changelog
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Changelog
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Streaming Preview */}
      {(isGenerating || streamedContent) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isGenerating && <Loader2 className="h-5 w-5 animate-spin" />}
              Generated Changelog
            </CardTitle>
            <CardDescription>
              {isGenerating
                ? 'AI is generating your changelog...'
                : 'Changelog generation complete!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {streamedContent || 'Generating...'}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
