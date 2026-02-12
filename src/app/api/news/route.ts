import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '@/lib/storage';
import { fetchAllFeeds } from '@/lib/rss';
import { deduplicateNews } from '@/lib/dedup';
import type { NewsCache, AppSettings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

const DEFAULT_CACHE: NewsCache = {
  items: [],
  lastRefreshedAt: null,
};

/**
 * Checks whether the cache is stale based on settings.refreshIntervalMinutes.
 */
function isCacheStale(cache: NewsCache, refreshIntervalMinutes: number): boolean {
  if (!cache.lastRefreshedAt || cache.items.length === 0) {
    return true;
  }

  const lastRefreshed = new Date(cache.lastRefreshedAt).getTime();
  const now = Date.now();
  const intervalMs = refreshIntervalMinutes * 60 * 1000;

  return now - lastRefreshed > intervalMs;
}

/**
 * Performs a background refresh: fetches feeds, deduplicates, merges, and saves.
 */
async function performRefresh(
  cache: NewsCache,
  settings: AppSettings
): Promise<NewsCache> {
  const { writeStore } = await import('@/lib/storage');

  const freshItems = await fetchAllFeeds(settings.rssSources);
  const deduped = deduplicateNews(freshItems);

  // Merge: don't add items whose URL already exists in cache
  const existingUrls = new Set(cache.items.map((item) => item.url));
  const newItems = deduped.filter((item) => !existingUrls.has(item.url));

  const merged = [...newItems, ...cache.items];

  // Trim to maxNewsItems
  const trimmed = merged.slice(0, settings.maxNewsItems);

  const updatedCache: NewsCache = {
    items: trimmed,
    lastRefreshedAt: new Date().toISOString(),
  };

  await writeStore('news-cache.json', updatedCache);
  return updatedCache;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let cache = await readStore<NewsCache>('news-cache.json', DEFAULT_CACHE);
    const settings = await readStore<AppSettings>('settings.json', DEFAULT_SETTINGS);

    // Auto-refresh if stale
    if (isCacheStale(cache, settings.refreshIntervalMinutes)) {
      try {
        cache = await performRefresh(cache, settings);
      } catch (refreshError) {
        console.error('[API/news] Auto-refresh failed:', refreshError);
        // Continue with whatever cache we have
      }
    }

    let items = [...cache.items];

    // Filter by category if provided
    if (category) {
      items = items.filter((item) =>
        item.categories.some((c) => c.toLowerCase() === category.toLowerCase())
      );
    }

    // Sort by publishedAt descending
    items.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const total = items.length;
    const paged = items.slice(offset, offset + limit);

    return NextResponse.json({
      items: paged,
      total,
      lastRefreshedAt: cache.lastRefreshedAt,
    });
  } catch (error) {
    console.error('[API/news] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
