/**
 * Groq AI Client
 *
 * Client for interacting with Groq's LLM API for changelog generation.
 */

import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam, ChatCompletionChunk } from 'groq-sdk/resources/chat/completions';

/**
 * Create Groq client instance
 */
export function createGroqClient(apiKey?: string) {
  return new Groq({
    apiKey: apiKey || process.env.GROQ_API_KEY!,
  });
}

/**
 * Groq API Configuration
 */
export const GROQ_CONFIG = {
  model: 'openai/gpt-oss-20b',
  temperature: 0.4,
  maxTokens: 2000,
  topP: 1,
  stream: true,
} as const;

/**
 * Groq API Helper Class
 */
export class GroqAPI {
  private client: Groq;

  constructor(apiKey?: string) {
    this.client = createGroqClient(apiKey);
  }

  /**
   * Generate changelog with streaming
   */
  async generateChangelog(
    systemPrompt: string,
    userPrompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const stream = await this.client.chat.completions.create({
        messages,
        model: GROQ_CONFIG.model,
        temperature: GROQ_CONFIG.temperature,
        max_tokens: GROQ_CONFIG.maxTokens,
        top_p: GROQ_CONFIG.topP,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk?.(content);
        }
      }

      return fullContent;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate changelog without streaming (for server-side)
   */
  async generateChangelogSync(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const completion = await this.client.chat.completions.create({
        messages,
        model: GROQ_CONFIG.model,
        temperature: GROQ_CONFIG.temperature,
        max_tokens: GROQ_CONFIG.maxTokens,
        top_p: GROQ_CONFIG.topP,
        stream: false,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a streaming response for API routes
   */
  async createStreamingResponse(
    systemPrompt: string,
    userPrompt: string
  ): Promise<ReadableStream> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const stream = await this.client.chat.completions.create({
        messages,
        model: GROQ_CONFIG.model,
        temperature: GROQ_CONFIG.temperature,
        max_tokens: GROQ_CONFIG.maxTokens,
        top_p: GROQ_CONFIG.topP,
        stream: true,
      });

      const encoder = new TextEncoder();

      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get model info and pricing
   */
  getModelInfo() {
    return {
      model: GROQ_CONFIG.model,
      description: 'Meta Llama 3.1 70B - Versatile and powerful',
      contextWindow: 8192,
      maxOutput: 2048,
      pricing: {
        input: 0.59, // per million tokens
        output: 0.79, // per million tokens
      },
    };
  }

  /**
   * Error handler
   */
  private handleError(error: any): Error {
    console.error('[GroqAPI Error]', error);

    if (error?.status === 401) {
      return new Error('Invalid Groq API key. Please check your configuration.');
    }

    if (error?.status === 429) {
      return new Error('Groq API rate limit exceeded. Please try again in a few moments.');
    }

    if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
      return new Error('Groq service is temporarily unavailable. Please try again later.');
    }

    if (error?.message?.includes('context_length_exceeded')) {
      return new Error('Too many commits to process. Please reduce the date range.');
    }

    return new Error(error?.message || 'Failed to generate changelog with AI');
  }
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Calculate estimated cost
 */
export function calculateEstimatedCost(inputTokens: number, outputTokens: number): number {
  const modelInfo = new GroqAPI().getModelInfo();
  const inputCost = (inputTokens / 1_000_000) * modelInfo.pricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelInfo.pricing.output;
  return inputCost + outputCost;
}
