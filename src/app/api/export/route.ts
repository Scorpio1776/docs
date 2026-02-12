import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import { getExporter } from '@/lib/export';
import type { VaultEntry } from '@/lib/types';

const VAULT_FILE = 'knowledge-vault.json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, platform } = body as {
      entryId: string;
      platform: string;
    };

    if (!entryId || !platform) {
      return NextResponse.json(
        { error: 'entryId and platform are required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['markdown', 'notion', 'google_docs'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    const index = entries.findIndex((e) => e.id === entryId);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Vault entry not found' },
        { status: 404 }
      );
    }

    const exporter = getExporter(platform);
    const record = await exporter.export(entries[index]);

    // Update the vault entry with the export record
    entries[index] = {
      ...entries[index],
      exportedTo: [...entries[index].exportedTo, record],
      updatedAt: new Date().toISOString(),
    };
    await writeStore(VAULT_FILE, entries);

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Failed to export vault entry:', error);
    return NextResponse.json(
      { error: 'Failed to export vault entry' },
      { status: 500 }
    );
  }
}
