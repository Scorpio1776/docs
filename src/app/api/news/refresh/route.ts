import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import { fetchAllFeeds } from '@/lib/rss';
import { deduplicateNews } from '@/lib/dedup';
import type { NewsCache, AppSettings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

const DEFAULT_CACHE: NewsCache = {
  items: [],
  lastRefreshedAt: null,
};

export async function POST() {
  try {
    const settings = await readStore<AppSettings>('settings.json', DEFAULT_SETTINGS);
    const cache = await readStore<NewsCache>('news-cache.json', DEFAULT_CACHE);

    // Fetch all active feeds
    const freshItems = await fetchAllFeeds(settings.rssSources);
    const deduped = deduplicateNews(freshItems);

    // Merge with existing cache - skip items with same URL
    const existingUrls = new Set(cache.items.map((item) => item.url));
    const newItems = deduped.filter((item) => !existingUrls.has(item.url));

    const merged = [...newItems, ...cache.items];

    // Trim to maxNewsItems setting
    const trimmed = merged.slice(0, settings.maxNewsItems);

    const updatedCache: NewsCache = {
      items: trimmed,
      lastRefreshedAt: new Date().toISOString(),
    };

    await writeStore('news-cache.json', updatedCache);

    return NextResponse.json({
      itemsAdded: newItems.length,
      lastRefreshedAt: updatedCache.lastRefreshedAt,
    });
  } catch (error) {
    console.error('[API/news/refresh] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh news feeds' },
      { status: 500 }
    );
  }
}
