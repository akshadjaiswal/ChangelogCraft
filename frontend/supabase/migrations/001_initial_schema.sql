-- ChangelogCraft Database Schema
-- Migration: 001_initial_schema
-- Created: 2025-11-09

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  access_token TEXT NOT NULL, -- Encrypted by Supabase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_username ON users(username);

-- =============================================================================
-- REPOSITORIES TABLE
-- =============================================================================
CREATE TABLE repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,              -- "owner/repo"
  description TEXT,
  html_url TEXT NOT NULL,
  language TEXT,
  stars INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  default_branch TEXT DEFAULT 'main',
  last_commit_sha TEXT,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, github_repo_id)
);

-- Indexes for performance
CREATE INDEX idx_repos_user_id ON repositories(user_id);
CREATE INDEX idx_repos_full_name ON repositories(full_name);
CREATE INDEX idx_repos_github_id ON repositories(github_repo_id);

-- =============================================================================
-- CHANGELOGS TABLE
-- =============================================================================
CREATE TABLE changelogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  version TEXT,                          -- "v1.2.0" or null for unreleased
  title TEXT DEFAULT 'Unreleased',
  content JSONB NOT NULL,                -- Structured changelog data
  markdown TEXT NOT NULL,                -- Rendered markdown
  commit_count INTEGER NOT NULL,
  date_from TIMESTAMP WITH TIME ZONE,
  date_to TIMESTAMP WITH TIME ZONE,
  template_type TEXT DEFAULT 'detailed', -- 'minimal', 'detailed', 'emoji'
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_changelogs_repo_id ON changelogs(repository_id);
CREATE INDEX idx_changelogs_published ON changelogs(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_changelogs_generated_at ON changelogs(generated_at DESC);

-- =============================================================================
-- COMMITS_CACHE TABLE
-- =============================================================================
CREATE TABLE commits_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  sha TEXT NOT NULL,
  message TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  committed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT,                         -- Assigned by AI
  ai_summary TEXT,                       -- AI-rewritten description
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repository_id, sha)
);

-- Indexes for performance
CREATE INDEX idx_commits_repo_id ON commits_cache(repository_id);
CREATE INDEX idx_commits_processed ON commits_cache(is_processed);
CREATE INDEX idx_commits_committed_at ON commits_cache(committed_at DESC);
CREATE INDEX idx_commits_sha ON commits_cache(sha);

-- =============================================================================
-- API_USAGE TABLE
-- =============================================================================
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,                -- 'groq', 'github'
  request_type TEXT,                     -- 'generate', 'fetch_commits'
  tokens_used INTEGER,
  cost DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for usage analytics
CREATE INDEX idx_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_usage_endpoint ON api_usage(endpoint);
CREATE INDEX idx_usage_created_at ON api_usage(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users: Can only view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Repositories: Users can manage their own repositories
CREATE POLICY "Users can view own repositories" ON repositories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own repositories" ON repositories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repositories" ON repositories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repositories" ON repositories
  FOR DELETE USING (auth.uid() = user_id);

-- Changelogs: Public can view published, users can manage own
CREATE POLICY "Anyone can view published changelogs" ON changelogs
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Users can manage own changelogs" ON changelogs
  FOR ALL USING (
    repository_id IN (
      SELECT id FROM repositories WHERE user_id = auth.uid()
    )
  );

-- Commits Cache: Users can manage their own cached commits
CREATE POLICY "Users can view own commits cache" ON commits_cache
  FOR SELECT USING (
    repository_id IN (
      SELECT id FROM repositories WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own commits cache" ON commits_cache
  FOR INSERT WITH CHECK (
    repository_id IN (
      SELECT id FROM repositories WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own commits cache" ON commits_cache
  FOR UPDATE USING (
    repository_id IN (
      SELECT id FROM repositories WHERE user_id = auth.uid()
    )
  );

-- API Usage: Users can view their own usage data
CREATE POLICY "Users can view own api usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api usage" ON api_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment changelog view count
CREATE OR REPLACE FUNCTION increment_changelog_views(changelog_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE changelogs SET view_count = view_count + 1 WHERE id = changelog_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA (Optional - for development)
-- =============================================================================

-- Note: Insert sample data manually or via seed script if needed

COMMENT ON TABLE users IS 'Stores GitHub authenticated users';
COMMENT ON TABLE repositories IS 'Stores connected GitHub repositories';
COMMENT ON TABLE changelogs IS 'Stores generated changelogs';
COMMENT ON TABLE commits_cache IS 'Caches GitHub commits to reduce API calls';
COMMENT ON TABLE api_usage IS 'Tracks API usage for rate limiting and analytics';
