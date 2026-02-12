'use client';

import { ListPlus, Bookmark, BookmarkCheck } from 'lucide-react';
import type { NewsItem } from '@/lib/types';

interface ActionButtonsProps {
  newsItem: NewsItem;
  onCreateTask: () => void;
  onToggleSave: () => void;
}

export default function ActionButtons({ newsItem, onCreateTask, onToggleSave }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onCreateTask}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                   text-gray-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
        title="Create task from this story"
      >
        <ListPlus className="w-3.5 h-3.5" />
        Create Task
      </button>

      <button
        onClick={onToggleSave}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          newsItem.isSaved
            ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            : 'text-gray-400 hover:text-amber-300 hover:bg-amber-500/10'
        }`}
        title={newsItem.isSaved ? 'Remove bookmark' : 'Bookmark this story'}
      >
        {newsItem.isSaved ? (
          <BookmarkCheck className="w-3.5 h-3.5" />
        ) : (
          <Bookmark className="w-3.5 h-3.5" />
        )}
        {newsItem.isSaved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
