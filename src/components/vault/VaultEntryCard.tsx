'use client';

import Link from 'next/link';
import { FileText, BarChart3, ClipboardList, Briefcase, Database, LayoutTemplate, File } from 'lucide-react';
import Badge from '@/components/shared/Badge';
import type { VaultEntry } from '@/lib/types';

const typeConfig: Record<VaultEntry['type'], { icon: typeof FileText; color: string; label: string }> = {
  report: { icon: FileText, color: 'blue', label: 'Report' },
  summary: { icon: ClipboardList, color: 'green', label: 'Summary' },
  analysis: { icon: BarChart3, color: 'purple', label: 'Analysis' },
  brief: { icon: Briefcase, color: 'amber', label: 'Brief' },
  data: { icon: Database, color: 'cyan', label: 'Data' },
  template: { icon: LayoutTemplate, color: 'indigo', label: 'Template' },
  other: { icon: File, color: 'gray', label: 'Other' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface VaultEntryCardProps {
  entry: VaultEntry;
}

export default function VaultEntryCard({ entry }: VaultEntryCardProps) {
  const config = typeConfig[entry.type] || typeConfig.other;
  const Icon = config.icon;

  return (
    <Link href={`/vault/${entry.id}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/15 flex items-center justify-center`}>
              <Icon className={`w-4 h-4 text-${config.color}-400`} />
            </div>
            <Badge color={config.color} size="sm">{config.label}</Badge>
          </div>
          {entry.isTemplate && (
            <Badge color="indigo" size="sm">Template</Badge>
          )}
        </div>

        <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-claw-primary transition-colors line-clamp-2">
          {entry.title}
        </h3>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {entry.content.replace(/[#*`]/g, '').slice(0, 120)}
          {entry.content.length > 120 ? '...' : ''}
        </p>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-800 text-gray-400 border border-gray-700"
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                +{entry.tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-gray-600">
          <span>{formatDate(entry.createdAt)}</span>
          <div className="flex items-center gap-2">
            {entry.sourceAgentId && (
              <span className="text-gray-500">Agent</span>
            )}
            {entry.exportedTo.length > 0 && (
              <span className="text-green-500/70">Exported</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
