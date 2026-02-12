'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Newspaper,
  Bot,
  ListTodo,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import CategoryFilter from '@/components/news/CategoryFilter';
import NewsList from '@/components/news/NewsList';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { news, total, lastRefreshedAt, isLoading, refresh } = useNews({
    category: selectedCategory,
    limit: 10,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/news/refresh', { method: 'POST' });
      await refresh();
    } catch (error) {
      console.error('Failed to refresh feeds:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handleCreateTask = useCallback((item: { title: string }) => {
    // Placeholder: in a full implementation this would open a task creation modal
    console.log('Create task from:', item.title);
  }, []);

  const handleToggleSave = useCallback((item: { id: string; isSaved: boolean }) => {
    // Placeholder: in a full implementation this would toggle saved state via API
    console.log('Toggle save for:', item.id, !item.isSaved);
  }, []);

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-claw-primary" />
              {getGreeting()}, Operator
            </h1>
            <p className="text-sm text-gray-500 mt-1">{today}</p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">6</p>
              <p className="text-xs text-gray-500">Active Agents</p>
            </div>
          </div>

          <div className="card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">3</p>
              <p className="text-xs text-gray-500">Pending Tasks</p>
            </div>
          </div>

          <div className="card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{total}</p>
              <p className="text-xs text-gray-500">Unread Stories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-5">
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Last refreshed info */}
      {lastRefreshedAt && (
        <p className="text-xs text-gray-600 mb-4">
          Last refreshed: {format(new Date(lastRefreshedAt), 'MMM d, h:mm a')}
        </p>
      )}

      {/* News content */}
      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500 text-center mt-3">
            Loading your morning briefing...
          </p>
        </div>
      ) : news.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No stories yet"
          description="Hit Refresh to fetch the latest stories from your RSS sources, or check your feed settings."
          action={
            <button onClick={handleRefresh} className="btn-primary text-sm">
              Fetch Stories
            </button>
          }
        />
      ) : (
        <NewsList
          items={news}
          onCreateTask={handleCreateTask}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}
