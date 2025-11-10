/**
 * Supabase Database Queries
 *
 * Centralized database query functions for better organization and reusability.
 */

import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

type DbClient = SupabaseClient<Database>;

// =============================================================================
// USER QUERIES
// =============================================================================

export const userQueries = {
  /**
   * Get user by ID
   */
  async getById(client: DbClient, userId: string) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user by GitHub ID
   */
  async getByGithubId(client: DbClient, githubId: number) {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  /**
   * Create or update user
   */
  async upsert(client: DbClient, user: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await client
      .from('users')
      .upsert(user, { onConflict: 'github_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user
   */
  async update(client: DbClient, userId: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// REPOSITORY QUERIES
// =============================================================================

export const repositoryQueries = {
  /**
   * Get all repositories for a user
   */
  async getAllByUserId(client: DbClient, userId: string) {
    const { data, error } = await client
      .from('repositories')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get repository by ID
   */
  async getById(client: DbClient, repositoryId: string) {
    const { data, error } = await client
      .from('repositories')
      .select('*')
      .eq('id', repositoryId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get repository by full name (owner/repo)
   */
  async getByFullName(client: DbClient, fullName: string) {
    const { data, error } = await client
      .from('repositories')
      .select('*')
      .eq('full_name', fullName)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create repository
   */
  async create(client: DbClient, repository: Database['public']['Tables']['repositories']['Insert']) {
    const { data, error } = await client
      .from('repositories')
      .insert(repository)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update repository
   */
  async update(client: DbClient, repositoryId: string, updates: Database['public']['Tables']['repositories']['Update']) {
    const { data, error } = await client
      .from('repositories')
      .update(updates)
      .eq('id', repositoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete repository
   */
  async delete(client: DbClient, repositoryId: string) {
    const { error } = await client
      .from('repositories')
      .delete()
      .eq('id', repositoryId);

    if (error) throw error;
  },
};

// =============================================================================
// CHANGELOG QUERIES
// =============================================================================

export const changelogQueries = {
  /**
   * Get changelogs for a repository
   */
  async getByRepositoryId(client: DbClient, repositoryId: string) {
    const { data, error } = await client
      .from('changelogs')
      .select('*')
      .eq('repository_id', repositoryId)
      .order('generated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get latest changelog for a repository
   */
  async getLatestByRepositoryId(client: DbClient, repositoryId: string) {
    const { data, error } = await client
      .from('changelogs')
      .select('*')
      .eq('repository_id', repositoryId)
      .eq('is_published', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get public changelog by repository full name
   */
  async getPublicByFullName(client: DbClient, fullName: string) {
    const { data, error } = await client
      .from('changelogs')
      .select(`
        *,
        repositories:repository_id (
          id,
          name,
          full_name,
          description,
          html_url,
          language,
          stars
        )
      `)
      .eq('is_published', true)
      .eq('repositories.full_name', fullName)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create changelog
   */
  async create(client: DbClient, changelog: Database['public']['Tables']['changelogs']['Insert']) {
    const { data, error } = await client
      .from('changelogs')
      .insert(changelog)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update changelog
   */
  async update(client: DbClient, changelogId: string, updates: Database['public']['Tables']['changelogs']['Update']) {
    const { data, error } = await client
      .from('changelogs')
      .update(updates)
      .eq('id', changelogId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Increment view count
   */
  async incrementViewCount(client: DbClient, changelogId: string) {
    const { error } = await client.rpc('increment_changelog_views', { changelog_id: changelogId });
    if (error) throw error;
  },
};

// =============================================================================
// COMMIT CACHE QUERIES
// =============================================================================

export const commitCacheQueries = {
  /**
   * Get cached commits for a repository
   */
  async getByRepositoryId(client: DbClient, repositoryId: string, since?: Date, until?: Date) {
    let query = client
      .from('commits_cache')
      .select('*')
      .eq('repository_id', repositoryId)
      .order('committed_at', { ascending: false });

    if (since) {
      query = query.gte('committed_at', since.toISOString());
    }
    if (until) {
      query = query.lte('committed_at', until.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Bulk insert commits (upsert)
   */
  async bulkUpsert(client: DbClient, commits: Database['public']['Tables']['commits_cache']['Insert'][]) {
    const { data, error } = await client
      .from('commits_cache')
      .upsert(commits, { onConflict: 'repository_id,sha' })
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update commit with AI processing
   */
  async updateWithAI(
    client: DbClient,
    commitId: string,
    category: string,
    aiSummary: string
  ) {
    const { data, error } = await client
      .from('commits_cache')
      .update({
        category,
        ai_summary: aiSummary,
        is_processed: true,
      })
      .eq('id', commitId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// API USAGE QUERIES
// =============================================================================

export const apiUsageQueries = {
  /**
   * Log API usage
   */
  async log(
    client: DbClient,
    usage: Database['public']['Tables']['api_usage']['Insert']
  ) {
    const { data, error } = await client
      .from('api_usage')
      .insert(usage)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get usage stats for a user
   */
  async getStatsByUserId(client: DbClient, userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await client
      .from('api_usage')
      .select('endpoint, request_type, tokens_used')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString());

    if (error) throw error;
    return data;
  },

  /**
   * Get total usage count by endpoint
   */
  async getCountByEndpoint(client: DbClient, userId: string, endpoint: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { count, error } = await client
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('created_at', since.toISOString());

    if (error) throw error;
    return count ?? 0;
  },
};
