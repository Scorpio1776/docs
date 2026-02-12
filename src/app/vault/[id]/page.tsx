'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Archive } from 'lucide-react';
import Header from '@/components/layout/Header';
import VaultDetail from '@/components/vault/VaultDetail';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useVaultEntry } from '@/hooks/useVault';
import type { VaultEntry, ExportRecord } from '@/lib/types';

export default function VaultEntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { entry, isLoading, error, mutate } = useVaultEntry(id);

  async function handleUpdate(updates: Partial<VaultEntry>) {
    const response = await fetch(`/api/vault/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update entry');
    }

    const result = await response.json();
    await mutate({ entry: result.entry }, false);
  }

  async function handleDelete() {
    const response = await fetch(`/api/vault/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete entry');
    }

    router.push('/vault');
  }

  async function handleExport(platform: ExportRecord['platform']) {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: id, platform }),
    });

    if (!response.ok) {
      throw new Error('Failed to export entry');
    }

    // Re-fetch to get updated exportedTo array
    await mutate();
  }

  return (
    <div className="min-h-screen">
      <Header title="Knowledge Vault" />

      <div className="p-6">
        {/* Back link */}
        <Link
          href="/vault"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vault
        </Link>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : error || !entry ? (
          <EmptyState
            icon={Archive}
            title="Entry not found"
            description="This vault entry may have been deleted or does not exist."
            action={
              <Link
                href="/vault"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-claw-primary/20 border border-claw-primary/30 rounded-lg hover:bg-claw-primary/30 transition-colors"
              >
                Return to Vault
              </Link>
            }
          />
        ) : (
          <VaultDetail
            entry={entry}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
}
