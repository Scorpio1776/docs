'use client';

import { clsx } from 'clsx';
import { DEFAULT_NEWS_CATEGORIES } from '@/lib/defaults';

const dotColorMap: Record<string, string> = {
  purple: 'bg-purple-400',
  red: 'bg-red-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  cyan: 'bg-cyan-400',
  amber: 'bg-amber-400',
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
};

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const activeCategories = DEFAULT_NEWS_CATEGORIES.filter((cat) => cat.isActive);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* All chip */}
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
          selected === null
            ? 'bg-claw-primary/20 text-indigo-300 border-claw-primary/40'
            : 'bg-gray-800/60 text-gray-400 border-gray-700/50 hover:bg-gray-800 hover:text-gray-300'
        )}
      >
        All
      </button>

      {activeCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
            selected === category.id
              ? 'bg-claw-primary/20 text-indigo-300 border-claw-primary/40'
              : 'bg-gray-800/60 text-gray-400 border-gray-700/50 hover:bg-gray-800 hover:text-gray-300'
          )}
        >
          <span
            className={clsx(
              'w-2 h-2 rounded-full',
              dotColorMap[category.color] || 'bg-gray-400'
            )}
          />
          {category.name}
        </button>
      ))}
    </div>
  );
}
