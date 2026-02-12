'use client';

import { clsx } from 'clsx';
import {
  Search,
  BarChart3,
  PenTool,
  Radar,
  ShieldCheck,
  Activity,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import type { AgentTemplate } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  Search,
  BarChart3,
  PenTool,
  Radar,
  ShieldCheck,
  Activity,
};

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500',
  },
  green: {
    text: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500',
  },
  cyan: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500',
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500',
  },
  red: {
    text: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500',
  },
};

interface TemplateSelectorProps {
  templates: AgentTemplate[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function TemplateSelector({
  templates,
  selected,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {templates.map((template) => {
        const Icon = iconMap[template.icon] ?? Bot;
        const colors = colorMap[template.color] ?? colorMap.blue;
        const isSelected = selected === template.id;

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={clsx(
              'text-left p-4 rounded-lg border transition-all',
              isSelected
                ? `${colors.border} bg-gray-800/80 border-2`
                : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 hover:border-gray-600'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  colors.bg
                )}
              >
                <Icon className={clsx('w-4.5 h-4.5', colors.text)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{template.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
