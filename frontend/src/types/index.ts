/**
 * Global TypeScript Types
 *
 * Central type definitions for the ChangelogCraft application.
 */

// =============================================================================
// USER TYPES
// =============================================================================

export interface User {
  id: string;
  githubId: number;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt?: number;
}

// =============================================================================
// GITHUB API TYPES
// =============================================================================

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  type: string;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
}

export interface GitHubOAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

// =============================================================================
// REPOSITORY TYPES
// =============================================================================

export interface Repository {
  id: string;
  userId: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  description?: string | null;
  htmlUrl: string;
  language?: string | null;
  stars: number;
  isPrivate: boolean;
  defaultBranch: string;
  lastCommitSha?: string | null;
  lastFetchedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// CHANGELOG TYPES
// =============================================================================

export type ChangelogCategory =
  | 'features'
  | 'bug_fixes'
  | 'breaking_changes'
  | 'documentation'
  | 'style_refactor'
  | 'chores';

export interface ChangelogEntry {
  category: ChangelogCategory;
  description: string;
  sha: string;
  authorName?: string;
}

export interface ChangelogContent {
  features: ChangelogEntry[];
  bug_fixes: ChangelogEntry[];
  breaking_changes: ChangelogEntry[];
  documentation: ChangelogEntry[];
  style_refactor: ChangelogEntry[];
  chores: ChangelogEntry[];
}

export type TemplateType = 'minimal' | 'detailed' | 'emoji';

export interface Changelog {
  id: string;
  repositoryId: string;
  version?: string | null;
  title: string;
  content: ChangelogContent;
  markdown: string;
  commitCount: number;
  dateFrom?: string | null;
  dateTo?: string | null;
  templateType: TemplateType;
  isPublished: boolean;
  viewCount: number;
  generatedAt: string;
  createdAt: string;
}

export interface PublicChangelog extends Changelog {
  repository: {
    id: string;
    name: string;
    fullName: string;
    description?: string | null;
    htmlUrl: string;
    language?: string | null;
    stars: number;
  };
}

// =============================================================================
// COMMIT TYPES
// =============================================================================

export interface Commit {
  id: string;
  repositoryId: string;
  sha: string;
  message: string;
  authorName?: string | null;
  authorEmail?: string | null;
  committedAt: string;
  category?: string | null;
  aiSummary?: string | null;
  isProcessed: boolean;
  createdAt: string;
}

// =============================================================================
// API USAGE TYPES
// =============================================================================

export interface ApiUsage {
  id: string;
  userId: string;
  endpoint: 'groq' | 'github';
  requestType?: string | null;
  tokensUsed?: number | null;
  cost: number;
  createdAt: string;
}

export interface ApiUsageStats {
  totalRequests: number;
  groqRequests: number;
  githubRequests: number;
  totalTokens: number;
  estimatedCost: number;
}

// =============================================================================
// GENERATION TYPES
// =============================================================================

export type DateRangePreset = '7days' | '30days' | '90days';

export interface GenerationSettings {
  dateRange: DateRangePreset;
  templateType: TemplateType;
  excludePatterns?: string[];
  commitLimit?: number;
}

export interface GenerationRequest {
  repositoryId: string;
  settings: GenerationSettings;
}

export interface GenerationResponse {
  changelogId: string;
  markdown: string;
  content: ChangelogContent;
  commitCount: number;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// =============================================================================
// CATEGORY METADATA
// =============================================================================

export interface CategoryMetadata {
  key: ChangelogCategory;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const CATEGORY_METADATA: Record<ChangelogCategory, CategoryMetadata> = {
  features: {
    key: 'features',
    label: 'Features',
    emoji: '✨',
    color: 'blue',
    description: 'New functionality and enhancements',
  },
  bug_fixes: {
    key: 'bug_fixes',
    label: 'Bug Fixes',
    emoji: '🐛',
    color: 'red',
    description: 'Fixes, patches, and corrections',
  },
  breaking_changes: {
    key: 'breaking_changes',
    label: 'Breaking Changes',
    emoji: '⚠️',
    color: 'orange',
    description: 'API changes and major refactors',
  },
  documentation: {
    key: 'documentation',
    label: 'Documentation',
    emoji: '📝',
    color: 'green',
    description: 'Documentation updates',
  },
  style_refactor: {
    key: 'style_refactor',
    label: 'Style & Refactor',
    emoji: '🎨',
    color: 'pink',
    description: 'Code cleanup and formatting',
  },
  chores: {
    key: 'chores',
    label: 'Chores',
    emoji: '🔧',
    color: 'gray',
    description: 'Dependency updates and config changes',
  },
};

// =============================================================================
// HELPER TYPES
// =============================================================================

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
