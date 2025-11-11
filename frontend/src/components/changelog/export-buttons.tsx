'use client';

/**
 * Export Buttons Component
 *
 * Client component for copying and downloading changelog markdown.
 */

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonsProps {
  markdown: string;
  repositoryName: string;
}

export function ExportButtons({ markdown, repositoryName }: ExportButtonsProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHANGELOG-${repositoryName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleCopy} variant="outline">
        Copy Markdown
      </Button>
      <Button onClick={handleDownload} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download CHANGELOG.md
      </Button>
    </div>
  );
}
