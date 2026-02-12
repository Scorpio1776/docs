'use client';

import { useState } from 'react';
import { Archive } from 'lucide-react';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/vault/SearchBar';
import VaultGrid from '@/components/vault/VaultGrid';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Badge from '@/components/shared/Badge';
import { useVault } from '@/hooks/useVault';

const typePills: { value: string; label: string; color: string }[] = [
  { value: '', label: 'All', color: 'gray' },
  { value: 'report', label: 'Reports', color: 'blue' },
  { value: 'summary', label: 'Summaries', color: 'green' },
  { value: 'analysis', label: 'Analyses', color: 'purple' },
  { value: 'brief', label: 'Briefs', color: 'amber' },
  { value: 'data', label: 'Data', color: 'cyan' },
  { value: 'template', label: 'Templates', color: 'indigo' },
  { value: 'other', label: 'Other', color: 'gray' },
];

export default function VaultPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { entries, isLoading, error } = useVault({
    type: typeFilter || undefined,
    search: search || undefined,
  });

  return (
    <div className="min-h-screen">
      <Header title="Knowledge Vault" />

      <div className="p-6 space-y-6">
        {/* Search bar */}
        <SearchBar
          value={search}
          onChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2">
          {typePills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setTypeFilter(pill.value)}
              className="transition-all"
            >
              <Badge
                color={pill.color}
                size="md"
                className={`cursor-pointer transition-all ${
                  typeFilter === pill.value
                    ? 'ring-1 ring-offset-1 ring-offset-gray-950 ring-gray-500 opacity-100'
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                {pill.label}
              </Badge>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm">Failed to load vault entries. Please try again.</p>
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="Your vault is empty"
            description="Complete tasks and save outputs here. Your knowledge base will grow as agents produce deliverables."
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                {typeFilter && ` in ${typePills.find((p) => p.value === typeFilter)?.label ?? typeFilter}`}
                {search && ` matching "${search}"`}
              </p>
            </div>
            <VaultGrid entries={entries} />
          </>
        )}
      </div>
    </div>
  );
}
