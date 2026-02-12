import { getOpenAIClient } from '@/lib/openai';
import { readStore } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import type { AppSettings, NewsItem } from '@/lib/types';

interface SummaryResult {
  summary: string;
  whyItMatters: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactScore: number;
}

const BATCH_SIZE = 5;

function buildPrompt(items: NewsItem[]): string {
  const itemDescriptions = items.map((item, i) => {
    return `[${i}] Title: "${item.title}"\nSource: ${item.source}\nURL: ${item.url}`;
  }).join('\n\n');

  return `You are a news analyst. For each of the following news items, provide a brief analysis.

${itemDescriptions}

Respond with a JSON array (no markdown fences) where each element corresponds to the item at that index and has these fields:
- "summary": A concise 1-2 sentence summary of the likely content based on the title and source.
- "whyItMatters": A single sentence explaining why this matters to a technology professional.
- "sentiment": One of "positive", "negative", or "neutral".
- "impactScore": An integer from 1 to 10 indicating how impactful this news is.

Return ONLY the JSON array, no other text.`;
}

function parseSummaryResponse(text: string, count: number): (SummaryResult | null)[] {
  try {
    const cleaned = text.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as SummaryResult[];

    if (!Array.isArray(parsed)) {
      return new Array(count).fill(null);
    }

    return parsed.map((item) => {
      if (
        item &&
        typeof item.summary === 'string' &&
        typeof item.whyItMatters === 'string' &&
        ['positive', 'negative', 'neutral'].includes(item.sentiment) &&
        typeof item.impactScore === 'number' &&
        item.impactScore >= 1 &&
        item.impactScore <= 10
      ) {
        return {
          summary: item.summary,
          whyItMatters: item.whyItMatters,
          sentiment: item.sentiment as 'positive' | 'negative' | 'neutral',
          impactScore: Math.round(item.impactScore),
        };
      }
      return null;
    });
  } catch {
    return new Array(count).fill(null);
  }
}

export async function summarizeNewsItems(items: NewsItem[]): Promise<NewsItem[]> {
  if (items.length === 0) return items;

  const settings = await readStore<AppSettings>('settings.json', DEFAULT_SETTINGS);
  const model = settings.openaiModel || 'gpt-4o';

  let client: Awaited<ReturnType<typeof getOpenAIClient>>;
  try {
    client = await getOpenAIClient();
  } catch {
    // No API key configured; return items unchanged
    return items;
  }

  const result = [...items];

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < result.length; i += BATCH_SIZE) {
    const batch = result.slice(i, i + BATCH_SIZE);

    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'user', content: buildPrompt(batch) },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        continue;
      }

      const summaries = parseSummaryResponse(content, batch.length);

      for (let j = 0; j < batch.length; j++) {
        const summary = summaries[j];
        if (summary) {
          result[i + j] = {
            ...result[i + j],
            summary: summary.summary,
            whyItMatters: summary.whyItMatters,
            sentiment: summary.sentiment,
            impactScore: summary.impactScore,
          };
        }
      }
    } catch (error) {
      console.error(`Failed to summarize batch starting at index ${i}:`, error);
      // On failure, items in this batch retain their existing (possibly null) fields
    }
  }

  return result;
}
