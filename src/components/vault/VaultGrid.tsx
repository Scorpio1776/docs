'use client';

import VaultEntryCard from '@/components/vault/VaultEntryCard';
import type { VaultEntry } from '@/lib/types';

interface VaultGridProps {
  entries: VaultEntry[];
}

export default function VaultGrid({ entries }: VaultGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <VaultEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
