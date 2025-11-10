/**
 * GitHub API Client
 *
 * Wrapper around Octokit for interacting with the GitHub REST API.
 */

import { Octokit } from '@octokit/rest';
import type { GitHubRepository, GitHubCommit, GitHubUser } from '@/types';

/**
 * Create authenticated GitHub client
 */
export function createGitHubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
    userAgent: 'ChangelogCraft/1.0',
    timeZone: 'UTC',
  });
}

/**
 * GitHub API Helper Functions
 */
export class GitHubAPI {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = createGitHubClient(accessToken);
  }

  /**
   * Get authenticated user information
   */
  async getAuthenticatedUser(): Promise<GitHubUser> {
    try {
      const { data } = await this.octokit.users.getAuthenticated();
      return data as GitHubUser;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch authenticated user');
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(options?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    perPage?: number;
    page?: number;
  }): Promise<GitHubRepository[]> {
    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort: options?.sort || 'updated',
        direction: options?.direction || 'desc',
        per_page: options?.perPage || 100,
        page: options?.page || 1,
        affiliation: 'owner',
      });
      return data as GitHubRepository[];
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch repositories');
    }
  }

  /**
   * Get a specific repository
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });
      return data as GitHubRepository;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch repository ${owner}/${repo}`);
    }
  }

  /**
   * Get commits for a repository
   */
  async getCommits(
    owner: string,
    repo: string,
    options?: {
      since?: Date;
      until?: Date;
      perPage?: number;
      page?: number;
      sha?: string;
    }
  ): Promise<GitHubCommit[]> {
    try {
      const params: any = {
        owner,
        repo,
        per_page: options?.perPage || 100,
        page: options?.page || 1,
      };

      if (options?.since) {
        params.since = options.since.toISOString();
      }
      if (options?.until) {
        params.until = options.until.toISOString();
      }
      if (options?.sha) {
        params.sha = options.sha;
      }

      const { data } = await this.octokit.repos.listCommits(params);
      return data as GitHubCommit[];
    } catch (error) {
      throw this.handleError(error, `Failed to fetch commits for ${owner}/${repo}`);
    }
  }

  /**
   * Get all commits within a date range (handles pagination)
   */
  async getAllCommits(
    owner: string,
    repo: string,
    since?: Date,
    until?: Date,
    maxCommits: number = 100
  ): Promise<GitHubCommit[]> {
    const allCommits: GitHubCommit[] = [];
    let page = 1;
    const perPage = 100;

    try {
      while (allCommits.length < maxCommits) {
        const commits = await this.getCommits(owner, repo, {
          since,
          until,
          perPage,
          page,
        });

        if (commits.length === 0) break;

        allCommits.push(...commits);

        if (commits.length < perPage) break;
        if (allCommits.length >= maxCommits) break;

        page++;
      }

      return allCommits.slice(0, maxCommits);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch all commits for ${owner}/${repo}`);
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimit() {
    try {
      const { data } = await this.octokit.rateLimit.get();
      return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1000),
        used: data.rate.used,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch rate limit');
    }
  }

  /**
   * Check if repository exists and is accessible
   */
  async checkRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.repos.get({ owner, repo });
      return true;
    } catch (error: any) {
      if (error?.status === 404) {
        return false;
      }
      throw this.handleError(error, `Failed to check repository access for ${owner}/${repo}`);
    }
  }

  /**
   * Error handler with better error messages
   */
  private handleError(error: any, message: string): Error {
    console.error('[GitHubAPI Error]', message, error);

    if (error?.status === 401) {
      return new Error('GitHub authentication failed. Please reconnect your account.');
    }

    if (error?.status === 403) {
      if (error?.response?.headers?.['x-ratelimit-remaining'] === '0') {
        const resetDate = new Date(
          parseInt(error?.response?.headers?.['x-ratelimit-reset']) * 1000
        );
        return new Error(
          `GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`
        );
      }
      return new Error('Access forbidden. Check repository permissions.');
    }

    if (error?.status === 404) {
      return new Error('Repository not found or you do not have access.');
    }

    if (error?.status === 422) {
      return new Error('Invalid request. Please check your input.');
    }

    if (error?.status >= 500) {
      return new Error('GitHub service is temporarily unavailable. Please try again later.');
    }

    return new Error(error?.message || message);
  }
}

/**
 * Helper function to parse owner and repo from full name
 */
export function parseFullName(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid repository full name: ${fullName}`);
  }
  return { owner, repo };
}

/**
 * Helper function to get date range presets
 */
export function getDateRangePreset(preset: '7days' | '30days' | '90days'): {
  since: Date;
  until: Date;
} {
  const until = new Date();
  const since = new Date();

  switch (preset) {
    case '7days':
      since.setDate(since.getDate() - 7);
      break;
    case '30days':
      since.setDate(since.getDate() - 30);
      break;
    case '90days':
      since.setDate(since.getDate() - 90);
      break;
  }

  return { since, until };
}
