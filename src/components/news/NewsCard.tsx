'use client';

import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Layers } from 'lucide-react';
import Badge from '@/components/shared/Badge';
import ActionButtons from './ActionButtons';
import { DEFAULT_NEWS_CATEGORIES } from '@/lib/defaults';
import type { NewsItem } from '@/lib/types';

/** Map category IDs to their color from defaults */
const categoryColorMap: Record<string, string> = {};
DEFAULT_NEWS_CATEGORIES.forEach((cat) => {
  categoryColorMap[cat.id] = cat.color;
});

/** Map category IDs to their display name */
const categoryNameMap: Record<string, string> = {};
DEFAULT_NEWS_CATEGORIES.forEach((cat) => {
  categoryNameMap[cat.id] = cat.name;
});

interface NewsCardProps {
  item: NewsItem;
  onCreateTask?: (item: NewsItem) => void;
  onToggleSave?: (item: NewsItem) => void;
}

export default function NewsCard({ item, onCreateTask, onToggleSave }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
  });

  return (
    <article className="card group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1.5 text-gray-100 hover:text-indigo-300 transition-colors"
          >
            <h3 className="font-semibold text-sm leading-snug line-clamp-2">
              {item.title}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Source + Time */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="font-medium text-gray-400">{item.source}</span>
            <span>{'/'}</span>
            <time dateTime={item.publishedAt}>{timeAgo}</time>
            {item.dedupGroupId && (
              <span className="inline-flex items-center gap-0.5 text-gray-600" title="Part of a duplicate group">
                <Layers className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Category badges */}
          <div className="flex items-center gap-1.5 mt-2">
            {item.categories.map((catId) => (
              <Badge
                key={catId}
                color={categoryColorMap[catId] || 'gray'}
                size="sm"
              >
                {categoryNameMap[catId] || catId}
              </Badge>
            ))}
          </div>

          {/* Summary */}
          {item.summary && (
            <p className="text-xs text-gray-400 mt-2.5 leading-relaxed line-clamp-3">
              {item.summary}
            </p>
          )}

          {/* Why it matters */}
          {item.whyItMatters && (
            <div className="mt-2.5 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-indigo-300 font-medium mb-0.5">
                Why it matters
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {item.whyItMatters}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 pt-2.5 border-t border-gray-800/50">
        <ActionButtons
          newsItem={item}
          onCreateTask={() => onCreateTask?.(item)}
          onToggleSave={() => onToggleSave?.(item)}
        />
      </div>
    </article>
  );
}
