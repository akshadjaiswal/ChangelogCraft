/**
 * Commit Parser Utilities
 *
 * Helper functions for parsing and categorizing git commits.
 */

import type { GitHubCommit, ChangelogCategory } from '@/types';

/**
 * Parse conventional commit message
 * Format: type(scope): description
 */
export interface ParsedCommit {
  type: string | null;
  scope: string | null;
  description: string;
  body: string | null;
  breaking: boolean;
  raw: string;
}

export function parseConventionalCommit(message: string): ParsedCommit {
  const raw = message;
  const lines = message.split('\n');
  const firstLine = lines[0];
  const body = lines.slice(1).join('\n').trim() || null;

  // Check for breaking change indicator
  const breaking = message.includes('BREAKING CHANGE') || firstLine.includes('!:');

  // Parse conventional commit format: type(scope): description
  const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = firstLine.match(conventionalRegex);

  if (match) {
    return {
      type: match[1],
      scope: match[2] || null,
      description: match[4],
      body,
      breaking: breaking || !!match[3],
      raw,
    };
  }

  // Fallback: no conventional format
  return {
    type: null,
    scope: null,
    description: firstLine,
    body,
    breaking,
    raw,
  };
}

/**
 * Infer category from commit message
 */
export function inferCategory(message: string): ChangelogCategory {
  const parsed = parseConventionalCommit(message);
  const lowerMessage = message.toLowerCase();

  // Check for breaking changes first
  if (parsed.breaking) {
    return 'breaking_changes';
  }

  // Map conventional commit types to categories
  if (parsed.type) {
    const typeMap: Record<string, ChangelogCategory> = {
      feat: 'features',
      feature: 'features',
      fix: 'bug_fixes',
      bugfix: 'bug_fixes',
      docs: 'documentation',
      doc: 'documentation',
      style: 'style_refactor',
      refactor: 'style_refactor',
      perf: 'features',
      test: 'chores',
      build: 'chores',
      ci: 'chores',
      chore: 'chores',
      revert: 'chores',
    };

    if (typeMap[parsed.type.toLowerCase()]) {
      return typeMap[parsed.type.toLowerCase()];
    }
  }

  // Keyword-based inference
  if (
    lowerMessage.includes('breaking') ||
    lowerMessage.includes('breaking change') ||
    lowerMessage.includes('deprecated')
  ) {
    return 'breaking_changes';
  }

  if (
    lowerMessage.includes('add') ||
    lowerMessage.includes('implement') ||
    lowerMessage.includes('create') ||
    lowerMessage.includes('new feature') ||
    lowerMessage.includes('enhance')
  ) {
    return 'features';
  }

  if (
    lowerMessage.includes('fix') ||
    lowerMessage.includes('bug') ||
    lowerMessage.includes('resolve') ||
    lowerMessage.includes('patch') ||
    lowerMessage.includes('correct')
  ) {
    return 'bug_fixes';
  }

  if (
    lowerMessage.includes('doc') ||
    lowerMessage.includes('readme') ||
    lowerMessage.includes('comment') ||
    lowerMessage.includes('documentation')
  ) {
    return 'documentation';
  }

  if (
    lowerMessage.includes('refactor') ||
    lowerMessage.includes('cleanup') ||
    lowerMessage.includes('reorganize') ||
    lowerMessage.includes('style') ||
    lowerMessage.includes('format')
  ) {
    return 'style_refactor';
  }

  // Default to chores
  return 'chores';
}

/**
 * Check if commit should be excluded
 */
export function shouldExcludeCommit(message: string, excludePatterns?: string[]): boolean {
  const lowerMessage = message.toLowerCase();

  // Default exclusion patterns
  const defaultExclusions = [
    'merge',
    'merge branch',
    'merge pull request',
    'wip',
    'work in progress',
    'bump version',
    'update dependencies',
    'update package',
    'fix typo',
    'typo',
    'update .gitignore',
    'initial commit',
  ];

  const allExclusions = [...defaultExclusions, ...(excludePatterns || [])].map((p) =>
    p.toLowerCase()
  );

  return allExclusions.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Clean commit message for display
 */
export function cleanCommitMessage(message: string): string {
  const parsed = parseConventionalCommit(message);

  // Remove conventional commit prefix if present
  let cleaned = parsed.description;

  // Remove common prefixes
  cleaned = cleaned.replace(/^(add|update|fix|remove|delete|create|implement):\s*/i, '');

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Ensure it ends with a period if it doesn't have punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Group commits by category
 */
export function groupCommitsByCategory(
  commits: GitHubCommit[],
  excludePatterns?: string[]
): Record<ChangelogCategory, GitHubCommit[]> {
  const grouped: Record<ChangelogCategory, GitHubCommit[]> = {
    features: [],
    bug_fixes: [],
    breaking_changes: [],
    documentation: [],
    style_refactor: [],
    chores: [],
  };

  for (const commit of commits) {
    const message = commit.commit.message;

    // Skip excluded commits
    if (shouldExcludeCommit(message, excludePatterns)) {
      continue;
    }

    const category = inferCategory(message);
    grouped[category].push(commit);
  }

  return grouped;
}

/**
 * Extract GitHub issue/PR references from commit message
 */
export function extractIssueReferences(message: string): number[] {
  const issueRegex = /#(\d+)/g;
  const matches = message.matchAll(issueRegex);
  const issueNumbers: number[] = [];

  for (const match of matches) {
    issueNumbers.push(parseInt(match[1]));
  }

  return issueNumbers;
}

/**
 * Get commit summary (first line)
 */
export function getCommitSummary(message: string): string {
  return message.split('\n')[0].trim();
}

/**
 * Get commit body (everything after first line)
 */
export function getCommitBody(message: string): string | null {
  const lines = message.split('\n');
  if (lines.length <= 1) return null;

  const body = lines.slice(1).join('\n').trim();
  return body || null;
}

/**
 * Check if commit is a merge commit
 */
export function isMergeCommit(commit: GitHubCommit): boolean {
  return (
    commit.parents.length > 1 ||
    commit.commit.message.toLowerCase().startsWith('merge')
  );
}

/**
 * Format commit for changelog display
 */
export function formatCommitForChangelog(commit: GitHubCommit): {
  message: string;
  sha: string;
  author: string;
  date: string;
} {
  return {
    message: cleanCommitMessage(commit.commit.message),
    sha: commit.sha.slice(0, 7),
    author: commit.commit.author.name,
    date: commit.commit.author.date,
  };
}

/**
 * Deduplicate similar commits
 */
export function deduplicateCommits(commits: GitHubCommit[]): GitHubCommit[] {
  const seen = new Set<string>();
  const unique: GitHubCommit[] = [];

  for (const commit of commits) {
    const summary = getCommitSummary(commit.commit.message).toLowerCase();

    // Skip if we've seen a very similar message
    let isDuplicate = false;
    for (const seenSummary of seen) {
      if (calculateSimilarity(summary, seenSummary) > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seen.add(summary);
      unique.push(commit);
    }
  }

  return unique;
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance (edit distance) between two strings
 */
function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
