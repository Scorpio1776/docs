'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Download, ChevronDown, X, Plus } from 'lucide-react';
import Badge from '@/components/shared/Badge';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import type { VaultEntry, ExportRecord } from '@/lib/types';

const typeColors: Record<string, string> = {
  report: 'blue',
  summary: 'green',
  analysis: 'purple',
  brief: 'amber',
  data: 'cyan',
  template: 'indigo',
  other: 'gray',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface VaultDetailProps {
  entry: VaultEntry;
  onUpdate: (updates: Partial<VaultEntry>) => Promise<void>;
  onDelete: () => Promise<void>;
  onExport: (platform: ExportRecord['platform']) => Promise<void>;
}

export default function VaultDetail({ entry, onUpdate, onDelete, onExport }: VaultDetailProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [newTag, setNewTag] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(entry.title);
  }, [entry.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleTitleSave() {
    if (editTitle.trim() && editTitle !== entry.title) {
      await onUpdate({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  }

  async function handleAddTag() {
    const tag = newTag.trim();
    if (tag && !entry.tags.includes(tag)) {
      await onUpdate({ tags: [...entry.tags, tag] });
    }
    setNewTag('');
  }

  async function handleRemoveTag(tag: string) {
    await onUpdate({ tags: entry.tags.filter((t) => t !== tag) });
  }

  async function handleExport(platform: ExportRecord['platform']) {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await onExport(platform);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge color={typeColors[entry.type] || 'gray'} size="md">
              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
            </Badge>
            {entry.isTemplate && (
              <Badge color="indigo" size="md">Template</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Export button */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export'}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Download as Markdown
                  </button>
                  <button
                    onClick={() => handleExport('notion')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-700 transition-colors"
                  >
                    Export to Notion (coming soon)
                  </button>
                  <button
                    onClick={() => handleExport('google_docs')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-700 transition-colors"
                  >
                    Export to Google Docs (coming soon)
                  </button>
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Editable title */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setEditTitle(entry.title);
                setIsEditingTitle(false);
              }
            }}
            className="w-full text-2xl font-bold text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-claw-primary"
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-2xl font-bold text-white cursor-pointer hover:text-gray-200 transition-colors"
            title="Click to edit title"
          >
            {entry.title}
          </h1>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300 border border-gray-700 group"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
              }}
              placeholder="Add tag..."
              className="w-20 text-xs bg-transparent text-gray-400 placeholder-gray-600 border-none focus:outline-none focus:w-32 transition-all"
            />
            {newTag.trim() && (
              <button
                onClick={handleAddTag}
                className="text-gray-500 hover:text-claw-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
          <span>Created {formatDate(entry.createdAt)}</span>
          {entry.updatedAt !== entry.createdAt && (
            <span>Updated {formatDate(entry.updatedAt)}</span>
          )}
          {entry.sourceTaskId && <span>From task: {entry.sourceTaskId.slice(0, 8)}...</span>}
          {entry.sourceAgentId && <span>From agent: {entry.sourceAgentId.slice(0, 8)}...</span>}
        </div>

        {/* Export history */}
        {entry.exportedTo.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs font-medium text-gray-500 mb-2">Export History</p>
            <div className="space-y-1">
              {entry.exportedTo.map((record, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge
                    color={record.status === 'success' ? 'green' : 'red'}
                    size="sm"
                  >
                    {record.status}
                  </Badge>
                  <span className="text-gray-400">{record.platform}</span>
                  <span className="text-gray-600">{formatDate(record.exportedAt)}</span>
                  {record.externalUrl && (
                    <a
                      href={record.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-claw-primary hover:text-indigo-400 underline"
                    >
                      Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <MarkdownRenderer content={entry.content} />
      </div>
    </div>
  );
}
