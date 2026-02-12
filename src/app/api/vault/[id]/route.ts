import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import type { VaultEntry } from '@/lib/types';

const VAULT_FILE = 'knowledge-vault.json';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    const entry = entries.find((e) => e.id === params.id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Vault entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Failed to read vault entry:', error);
    return NextResponse.json(
      { error: 'Failed to read vault entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    const index = entries.findIndex((e) => e.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Vault entry not found' },
        { status: 404 }
      );
    }

    const allowedFields: (keyof VaultEntry)[] = [
      'title',
      'content',
      'type',
      'tags',
      'projectId',
      'isTemplate',
    ];

    const updates: Partial<VaultEntry> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updates as any)[field] = body[field];
      }
    }

    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeStore(VAULT_FILE, entries);

    return NextResponse.json({ entry: entries[index] });
  } catch (error) {
    console.error('Failed to update vault entry:', error);
    return NextResponse.json(
      { error: 'Failed to update vault entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    const index = entries.findIndex((e) => e.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Vault entry not found' },
        { status: 404 }
      );
    }

    entries.splice(index, 1);
    await writeStore(VAULT_FILE, entries);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete vault entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete vault entry' },
      { status: 500 }
    );
  }
}
