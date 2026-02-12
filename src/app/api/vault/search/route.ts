import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '@/lib/storage';
import type { VaultEntry } from '@/lib/types';

const VAULT_FILE = 'knowledge-vault.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    const term = query.toLowerCase();

    let results = entries.filter((e) => {
      const titleMatch = e.title.toLowerCase().includes(term);
      const contentMatch = e.content.toLowerCase().includes(term);
      const tagMatch = e.tags.some((tag) => tag.toLowerCase().includes(term));
      return titleMatch || contentMatch || tagMatch;
    });

    if (type) {
      results = results.filter((e) => e.type === type);
    }

    return NextResponse.json({ entries: results });
  } catch (error) {
    console.error('Failed to search vault:', error);
    return NextResponse.json(
      { error: 'Failed to search vault entries' },
      { status: 500 }
    );
  }
}
