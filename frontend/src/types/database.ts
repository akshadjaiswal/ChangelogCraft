/**
 * Supabase Database Types
 *
 * TypeScript definitions for all database tables and their relationships.
 * These types match the schema defined in the SQL migration.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          github_id: number;
          username: string;
          email: string | null;
          avatar_url: string | null;
          access_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          github_id: number;
          username: string;
          email?: string | null;
          avatar_url?: string | null;
          access_token: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          github_id?: number;
          username?: string;
          email?: string | null;
          avatar_url?: string | null;
          access_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      repositories: {
        Row: {
          id: string;
          user_id: string;
          github_repo_id: number;
          name: string;
          full_name: string;
          description: string | null;
          html_url: string;
          language: string | null;
          stars: number;
          is_private: boolean;
          default_branch: string;
          last_commit_sha: string | null;
          last_fetched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          github_repo_id: number;
          name: string;
          full_name: string;
          description?: string | null;
          html_url: string;
          language?: string | null;
          stars?: number;
          is_private?: boolean;
          default_branch?: string;
          last_commit_sha?: string | null;
          last_fetched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          github_repo_id?: number;
          name?: string;
          full_name?: string;
          description?: string | null;
          html_url?: string;
          language?: string | null;
          stars?: number;
          is_private?: boolean;
          default_branch?: string;
          last_commit_sha?: string | null;
          last_fetched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      changelogs: {
        Row: {
          id: string;
          repository_id: string;
          version: string | null;
          title: string;
          content: Json;
          markdown: string;
          commit_count: number;
          date_from: string | null;
          date_to: string | null;
          template_type: string;
          is_published: boolean;
          view_count: number;
          generated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          repository_id: string;
          version?: string | null;
          title?: string;
          content: Json;
          markdown: string;
          commit_count: number;
          date_from?: string | null;
          date_to?: string | null;
          template_type?: string;
          is_published?: boolean;
          view_count?: number;
          generated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          repository_id?: string;
          version?: string | null;
          title?: string;
          content?: Json;
          markdown?: string;
          commit_count?: number;
          date_from?: string | null;
          date_to?: string | null;
          template_type?: string;
          is_published?: boolean;
          view_count?: number;
          generated_at?: string;
          created_at?: string;
        };
      };
      commits_cache: {
        Row: {
          id: string;
          repository_id: string;
          sha: string;
          message: string;
          author_name: string | null;
          author_email: string | null;
          committed_at: string;
          category: string | null;
          ai_summary: string | null;
          is_processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          repository_id: string;
          sha: string;
          message: string;
          author_name?: string | null;
          author_email?: string | null;
          committed_at: string;
          category?: string | null;
          ai_summary?: string | null;
          is_processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          repository_id?: string;
          sha?: string;
          message?: string;
          author_name?: string | null;
          author_email?: string | null;
          committed_at?: string;
          category?: string | null;
          ai_summary?: string | null;
          is_processed?: boolean;
          created_at?: string;
        };
      };
      api_usage: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          request_type: string | null;
          tokens_used: number | null;
          cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          request_type?: string | null;
          tokens_used?: number | null;
          cost?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          request_type?: string | null;
          tokens_used?: number | null;
          cost?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_changelog_views: {
        Args: { changelog_id: string };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
