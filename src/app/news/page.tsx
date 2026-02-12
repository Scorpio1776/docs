'use client';

import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Newspaper,
  RefreshCw,
  Search,
  Rss,
} from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import CategoryFilter from '@/components/news/CategoryFilter';
import NewsList from '@/components/news/NewsList';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { news, total, lastRefreshedAt, isLoading, refresh } = useNews({
    category: selectedCategory,
    limit: 50,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/news/refresh', { method: 'POST' });
      const data = await res.json();
      console.log(`Refresh complete: ${data.itemsAdded} new items added`);
      await refresh();
    } catch (error) {
      console.error('Failed to refresh feeds:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  // Client-side text search filtering
  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return news;

    const query = searchQuery.toLowerCase();
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        (item.summary && item.summary.toLowerCase().includes(query))
    );
  }, [news, searchQuery]);

  const handleCreateTask = useCallback((item: { title: string }) => {
    console.log('Create task from:', item.title);
  }, []);

  const handleToggleSave = useCallback((item: { id: string; isSaved: boolean }) => {
    console.log('Toggle save for:', item.id, !item.isSaved);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rss className="w-6 h-6 text-claw-primary" />
            News Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} stories from your subscribed feeds
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          {isRefreshing ? 'Refreshing Feeds...' : 'Refresh Feeds'}
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories by title, source, or summary..."
            className="input w-full pl-10"
          />
        </div>

        {/* Category filter */}
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Last refreshed info */}
      {lastRefreshedAt && (
        <p className="text-xs text-gray-600 mb-4">
          Last refreshed: {format(new Date(lastRefreshedAt), 'MMM d, h:mm a')}
          {' / '}
          Showing {filteredNews.length} of {total} stories
        </p>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500 text-center mt-3">
            Loading news intelligence...
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={searchQuery ? 'No matching stories' : 'No stories yet'}
          description={
            searchQuery
              ? `No stories match "${searchQuery}". Try a different search term or clear the filter.`
              : 'Hit "Refresh Feeds" to fetch the latest stories from your subscribed RSS sources.'
          }
          action={
            searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary text-sm"
              >
                Clear Search
              </button>
            ) : (
              <button onClick={handleRefresh} className="btn-primary text-sm">
                Refresh Feeds
              </button>
            )
          }
        />
      ) : (
        <NewsList
          items={filteredNews}
          onCreateTask={handleCreateTask}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}
