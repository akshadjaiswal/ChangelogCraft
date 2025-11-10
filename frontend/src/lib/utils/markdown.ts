/**
 * Markdown Utilities
 *
 * Helper functions for processing and rendering markdown content.
 */

/**
 * Sanitize markdown to prevent XSS attacks
 */
export function sanitizeMarkdown(markdown: string): string {
  // Remove potentially dangerous HTML tags
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Parse markdown to extract sections
 */
export function parseMarkdownSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = markdown.split('\n');

  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection) {
        sections.set(currentSection, currentContent.join('\n').trim());
      }

      // Start new section
      currentSection = line.replace('## ', '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.set(currentSection, currentContent.join('\n').trim());
  }

  return sections;
}

/**
 * Count words in markdown
 */
export function countWords(markdown: string): number {
  // Remove markdown syntax and count words
  const text = markdown
    .replace(/[#*`_~\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text ? text.split(' ').length : 0;
}

/**
 * Extract emojis from markdown
 */
export function extractEmojis(markdown: string): string[] {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return markdown.match(emojiRegex) || [];
}

/**
 * Remove emojis from text
 */
export function removeEmojis(text: string): string {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.replace(emojiRegex, '').trim();
}

/**
 * Convert markdown to plain text
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1') // Remove images
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
    .replace(/\n{3,}/g, '\n\n') // Normalize newlines
    .trim();
}

/**
 * Get reading time estimate (words per minute)
 */
export function getReadingTime(markdown: string, wordsPerMinute: number = 200): number {
  const wordCount = countWords(markdown);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Truncate markdown to a specific length
 */
export function truncateMarkdown(markdown: string, maxLength: number): string {
  const plainText = markdownToPlainText(markdown);
  if (plainText.length <= maxLength) {
    return markdown;
  }

  return plainText.substring(0, maxLength) + '...';
}

/**
 * Add syntax highlighting class hints to code blocks
 */
export function enhanceCodeBlocks(markdown: string): string {
  return markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text';
    return `\`\`\`${language}\n${code}\`\`\``;
  });
}

/**
 * Generate table of contents from markdown headers
 */
export function generateTableOfContents(markdown: string): Array<{ level: number; text: string; slug: string }> {
  const headers: Array<{ level: number; text: string; slug: string }> = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      headers.push({ level, text, slug });
    }
  }

  return headers;
}

/**
 * Validate markdown syntax
 */
export function validateMarkdown(markdown: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for unclosed code blocks
  const codeBlockMatches = markdown.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }

  // Check for unclosed inline code
  const inlineCodeMatches = markdown.match(/`/g);
  if (inlineCodeMatches && inlineCodeMatches.length % 2 !== 0) {
    errors.push('Unclosed inline code detected');
  }

  // Check for mismatched brackets
  const openBrackets = (markdown.match(/\[/g) || []).length;
  const closeBrackets = (markdown.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('Mismatched square brackets in links');
  }

  // Check for mismatched parentheses in links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(markdown)) !== null) {
    if (!match[2]) {
      errors.push('Empty link URL detected');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
