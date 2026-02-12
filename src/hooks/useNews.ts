'use client';

import useSWR from 'swr';
import type { NewsItem } from '@/lib/types';

interface UseNewsParams {
  category?: string | null;
  limit?: number;
}

interface NewsResponse {
  items: NewsItem[];
  total: number;
  lastRefreshedAt: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json() as Promise<NewsResponse>;
});

/**
 * Custom hook for fetching news using SWR.
 * Supports category filtering and configurable limit.
 */
export function useNews({ category, limit = 10 }: UseNewsParams = {}) {
  const params = new URLSearchParams();

  if (category) {
    params.set('category', category);
  }
  params.set('limit', String(limit));

  const queryString = params.toString();
  const url = `/api/news?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<NewsResponse>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  return {
    news: data?.items ?? [],
    total: data?.total ?? 0,
    lastRefreshedAt: data?.lastRefreshedAt ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}
