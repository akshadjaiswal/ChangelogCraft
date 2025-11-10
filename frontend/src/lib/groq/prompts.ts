/**
 * Groq AI Prompts
 *
 * System and user prompts for changelog generation.
 */

import type { TemplateType, GitHubCommit } from '@/types';

/**
 * System prompt for changelog generation
 */
export const CHANGELOG_SYSTEM_PROMPT = `You are an expert technical writer specialized in creating user-friendly changelogs. Your task is to analyze git commit messages and generate a beautiful, well-organized changelog.

Guidelines:

1. Categorize commits into:
   - ✨ Features (new functionality, enhancements)
   - 🐛 Bug Fixes (fixes, patches, corrections)
   - ⚠️ Breaking Changes (API changes, major refactors)
   - 📝 Documentation (docs, README updates)
   - 🎨 Style/Refactor (code cleanup, formatting)
   - 🔧 Chores (dependency updates, config changes)

2. Rewriting Rules:
   - Convert technical jargon to user-friendly language
   - Be concise but descriptive
   - Focus on user impact, not implementation details
   - Use active voice
   - Remove redundant words like "fix", "add", "update" at the start
   - Each entry should be one clear sentence

3. Filtering:
   - IGNORE: Merge commits, automated dependency updates (unless major)
   - IGNORE: Trivial commits like "fix typo", "update .gitignore"
   - COMBINE: Similar commits into one entry
   - Only include meaningful changes

4. Format as markdown with proper structure:
   - Use ## for category headers
   - Use - for list items
   - Add emojis to category headers
   - Keep descriptions under 80 characters per line
   - Order categories by importance: Breaking Changes, Features, Bug Fixes, Documentation, Style/Refactor, Chores
   - Only include categories that have entries

5. Output Format:
   - Start with a brief summary line if there are significant changes
   - Each category should have a header followed by bullet points
   - Be consistent in formatting across all entries

Example output:

## ⚠️ Breaking Changes
- Authentication now requires API key instead of password
- Database schema updated - migration required

## ✨ Features
- Dark mode toggle for improved viewing experience
- Real-time notifications with customizable alerts
- Export data to CSV and JSON formats

## 🐛 Bug Fixes
- Resolved login redirect loop issue
- Fixed API timeout errors on slow connections
- Corrected date formatting in reports

## 📝 Documentation
- Updated installation guide with troubleshooting steps
- Added API examples for common use cases

Now analyze the provided commits and generate a concise, user-friendly changelog following these guidelines.`;

/**
 * Generate user prompt for changelog generation
 */
export function buildChangelogUserPrompt(
  repoName: string,
  commits: GitHubCommit[],
  dateFrom: Date,
  dateTo: Date,
  templateType: TemplateType = 'detailed'
): string {
  const commitList = commits
    .map((commit) => {
      const sha = commit.sha.slice(0, 7);
      const message = commit.commit.message.split('\n')[0]; // First line only
      const author = commit.commit.author.name;
      const date = new Date(commit.commit.author.date).toLocaleDateString();
      return `[${sha}] ${message} - ${author} (${date})`;
    })
    .join('\n');

  const templateInstructions = getTemplateInstructions(templateType);

  return `Repository: ${repoName}
Date Range: ${dateFrom.toLocaleDateString()} to ${dateTo.toLocaleDateString()}
Total Commits: ${commits.length}

Template Style: ${templateType}
${templateInstructions}

Commits:
${commitList}

Generate a changelog following the guidelines and template style specified above.`;
}

/**
 * Get template-specific instructions
 */
function getTemplateInstructions(templateType: TemplateType): string {
  switch (templateType) {
    case 'minimal':
      return `Instructions: Create a minimal changelog with short, concise entries. No emojis in entries, only in headers. Keep descriptions very brief (under 50 characters per entry).`;

    case 'detailed':
      return `Instructions: Create a detailed changelog with comprehensive descriptions. Include context and impact for each change. Aim for 60-80 characters per entry.`;

    case 'emoji':
      return `Instructions: Create an emoji-rich changelog with expressive descriptions. Use relevant emojis in entries to make the changelog more engaging and visual. Be descriptive but fun.`;

    default:
      return '';
  }
}

/**
 * Generate prompt for commit categorization (individual commit processing)
 */
export function buildCommitCategorizationPrompt(commitMessage: string): string {
  return `Analyze this git commit message and:
1. Categorize it as one of: features, bug_fixes, breaking_changes, documentation, style_refactor, chores
2. Rewrite it as a user-friendly changelog entry (one sentence, clear and concise)

Commit message: "${commitMessage}"

Respond in JSON format:
{
  "category": "category_name",
  "description": "user-friendly description"
}`;
}

/**
 * Generate prompt for changelog summarization
 */
export function buildSummaryPrompt(markdown: string): string {
  return `Analyze this changelog and create a brief, engaging summary (1-2 sentences) that highlights the most important changes.

Changelog:
${markdown}

Provide only the summary text, no additional formatting.`;
}

/**
 * Get template examples for UI
 */
export const TEMPLATE_EXAMPLES = {
  minimal: {
    name: 'Minimal',
    description: 'Clean and concise, perfect for small updates',
    example: `## ✨ Features
- Dark mode support
- CSV export

## 🐛 Bug Fixes
- Login redirect fixed
- API timeout resolved`,
  },
  detailed: {
    name: 'Detailed',
    description: 'Comprehensive with context and impact',
    example: `## ✨ Features
- Added dark mode toggle for improved viewing experience in low-light environments
- Implemented CSV export functionality with customizable field selection

## 🐛 Bug Fixes
- Resolved login redirect loop that occurred after password reset
- Fixed API timeout errors on slow network connections`,
  },
  emoji: {
    name: 'Emoji-Rich',
    description: 'Expressive and engaging with emojis',
    example: `## ✨ Features
- 🌙 Dark mode toggle for improved viewing experience
- 📊 CSV export with customizable fields
- 🔔 Real-time notifications

## 🐛 Bug Fixes
- 🔄 Login redirect loop resolved
- ⏱️ API timeout errors fixed`,
  },
};
