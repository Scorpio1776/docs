'use client';

import NewsCard from './NewsCard';
import type { NewsItem } from '@/lib/types';

interface NewsListProps {
  items: NewsItem[];
  onCreateTask?: (item: NewsItem) => void;
  onToggleSave?: (item: NewsItem) => void;
}

export default function NewsList({ items, onCreateTask, onToggleSave }: NewsListProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <NewsCard
          key={item.id}
          item={item}
          onCreateTask={onCreateTask}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
