import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readStore, writeStore } from '@/lib/storage';
import type { VaultEntry } from '@/lib/types';

const VAULT_FILE = 'knowledge-vault.json';

export async function GET(request: NextRequest) {
  try {
    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');

    let filtered = entries;

    if (type) {
      filtered = filtered.filter((e) => e.type === type);
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      filtered = filtered.filter((e) =>
        tagList.some((tag) => e.tags.map((t) => t.toLowerCase()).includes(tag))
      );
    }

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.content.toLowerCase().includes(term)
      );
    }

    return NextResponse.json({ entries: filtered });
  } catch (error) {
    console.error('Failed to read vault:', error);
    return NextResponse.json(
      { error: 'Failed to read vault entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, tags, sourceTaskId, sourceAgentId, isTemplate } = body as {
      title: string;
      content: string;
      type: VaultEntry['type'];
      tags?: string[];
      sourceTaskId?: string;
      sourceAgentId?: string;
      isTemplate?: boolean;
    };

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'title, content, and type are required' },
        { status: 400 }
      );
    }

    const validTypes: VaultEntry['type'][] = [
      'report', 'summary', 'analysis', 'brief', 'data', 'template', 'other',
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newEntry: VaultEntry = {
      id: uuidv4(),
      title,
      content,
      type,
      tags: tags ?? [],
      projectId: null,
      sourceTaskId: sourceTaskId ?? null,
      sourceAgentId: sourceAgentId ?? null,
      createdAt: now,
      updatedAt: now,
      isTemplate: isTemplate ?? false,
      exportedTo: [],
    };

    const entries = await readStore<VaultEntry[]>(VAULT_FILE, []);
    entries.push(newEntry);
    await writeStore(VAULT_FILE, entries);

    return NextResponse.json({ entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error('Failed to create vault entry:', error);
    return NextResponse.json(
      { error: 'Failed to create vault entry' },
      { status: 500 }
    );
  }
}
