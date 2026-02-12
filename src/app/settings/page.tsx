'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Badge from '@/components/shared/Badge';
import { useSettings } from '@/hooks/useSettings';
import { Save, Plus, Trash2, Eye, EyeOff, Key } from 'lucide-react';
import type { RSSSource, NewsCategory } from '@/lib/types';
import { v4 as uuid } from 'uuid';

export default function SettingsPage() {
  const { settings, isLoading, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // Initialize local state from settings
  const initialized = settings && !apiKey && !model;
  if (initialized) {
    setApiKey(settings.openaiApiKey);
    setModel(settings.openaiModel);
  }

  if (isLoading || !settings) {
    return (
      <div>
        <Header title="Settings" />
        <div className="p-6 flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  async function saveSection(section: string, data: Record<string, unknown>) {
    setSaving(section);
    await updateSettings(data);
    setSaving(null);
  }

  async function toggleCategory(categoryId: string) {
    const updated = settings!.newsCategories.map((c: NewsCategory) =>
      c.id === categoryId ? { ...c, isActive: !c.isActive } : c
    );
    await saveSection('categories', { newsCategories: updated });
  }

  async function toggleSource(sourceId: string) {
    const updated = settings!.rssSources.map((s: RSSSource) =>
      s.id === sourceId ? { ...s, isActive: !s.isActive } : s
    );
    await saveSection('sources', { rssSources: updated });
  }

  async function removeSource(sourceId: string) {
    const updated = settings!.rssSources.filter((s: RSSSource) => s.id !== sourceId);
    await saveSection('sources', { rssSources: updated });
  }

  async function addSource() {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    const newSource: RSSSource = {
      id: uuid(),
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      categories: [],
      isActive: true,
      lastFetchedAt: null,
    };
    await saveSection('sources', { rssSources: [...settings!.rssSources, newSource] });
    setNewSourceName('');
    setNewSourceUrl('');
  }

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 max-w-4xl space-y-8">

        {/* API Configuration */}
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-claw-primary" />
            <h2 className="text-lg font-semibold text-white">API Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">OpenAI API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="input w-full pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="label">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input w-full"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <button
              onClick={() => saveSection('api', { openaiApiKey: apiKey, openaiModel: model })}
              className="btn-primary flex items-center gap-2"
              disabled={saving === 'api'}
            >
              <Save className="w-4 h-4" />
              {saving === 'api' ? 'Saving...' : 'Save API Settings'}
            </button>
          </div>
        </section>

        {/* News Categories */}
        <section className="card">
          <h2 className="text-lg font-semibold text-white mb-4">News Categories</h2>
          <div className="space-y-2">
            {settings.newsCategories.map((cat: NewsCategory) => (
              <div key={cat.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800">
                <div className="flex items-center gap-3">
                  <Badge color={cat.color}>{cat.name}</Badge>
                  <span className="text-xs text-gray-500">{cat.keywords.slice(0, 3).join(', ')}</span>
                </div>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    cat.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* RSS Sources */}
        <section className="card">
          <h2 className="text-lg font-semibold text-white mb-4">RSS News Sources</h2>
          <div className="space-y-2 mb-4">
            {settings.rssSources.map((source: RSSSource) => (
              <div key={source.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-200">{source.name}</span>
                  <span className="text-xs text-gray-500 ml-2 truncate">{source.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSource(source.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      source.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {source.isActive ? 'On' : 'Off'}
                  </button>
                  <button
                    onClick={() => removeSource(source.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="Source name"
              className="input flex-1"
            />
            <input
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              placeholder="RSS feed URL"
              className="input flex-[2]"
            />
            <button onClick={addSource} className="btn-primary flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </section>

        {/* Export Configuration (Post-MVP) */}
        <section className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Export Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Notion API Key</label>
              <input
                type="password"
                placeholder="Coming soon..."
                disabled
                className="input w-full opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Notion integration coming in a future update.</p>
            </div>
            <div>
              <label className="label">Google Docs</label>
              <input
                type="text"
                placeholder="Coming soon..."
                disabled
                className="input w-full opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Google Docs integration coming in a future update.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
