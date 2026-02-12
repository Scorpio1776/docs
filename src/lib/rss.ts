import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import type { NewsItem, RSSSource } from './types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Clawdbot/1.0 RSS Reader',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

/**
 * Fetches a single RSS feed and maps its items to NewsItem objects.
 */
export async function fetchFeed(source: RSSSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);

    const items: NewsItem[] = (feed.items || []).map((entry) => {
      const publishedAt = entry.pubDate
        ? new Date(entry.pubDate).toISOString()
        : new Date().toISOString();

      return {
        id: uuidv4(),
        title: entry.title?.trim() || 'Untitled',
        url: entry.link || source.url,
        source: source.name,
        sourceUrl: source.url,
        publishedAt,
        fetchedAt: new Date().toISOString(),
        categories: [...source.categories],
        summary: entry.contentSnippet?.slice(0, 500) || null,
        whyItMatters: null,
        sentiment: null,
        impactScore: null,
        dedupGroupId: null,
        isRead: false,
        isSaved: false,
      };
    });

    return items;
  } catch (error) {
    console.error(`[RSS] Failed to fetch feed "${source.name}" (${source.url}):`, error);
    return [];
  }
}

/**
 * Fetches all active RSS sources in parallel, skipping any that fail.
 * Returns a flat array of all fetched news items.
 */
export async function fetchAllFeeds(sources: RSSSource[]): Promise<NewsItem[]> {
  const activeSources = sources.filter((s) => s.isActive);

  if (activeSources.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    activeSources.map((source) => fetchFeed(source))
  );

  const allItems: NewsItem[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    } else {
      console.error(
        `[RSS] Feed "${activeSources[index].name}" rejected:`,
        result.reason
      );
    }
  });

  return allItems;
}
