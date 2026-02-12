import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import type { Agent } from '@/lib/types';

const AGENTS_FILE = 'agents.json';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agents = await readStore<Agent[]>(AGENTS_FILE, []);
    const agent = agents.find((a) => a.id === params.id);

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Failed to read agent:', error);
    return NextResponse.json(
      { error: 'Failed to read agent' },
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
    const agents = await readStore<Agent[]>(AGENTS_FILE, []);
    const index = agents.findIndex((a) => a.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const allowedFields: (keyof Agent)[] = [
      'name',
      'description',
      'systemPrompt',
      'tools',
      'status',
    ];

    const updates: Partial<Agent> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updates as any)[field] = body[field];
      }
    }

    agents[index] = { ...agents[index], ...updates };
    await writeStore(AGENTS_FILE, agents);

    return NextResponse.json({ agent: agents[index] });
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agents = await readStore<Agent[]>(AGENTS_FILE, []);
    const index = agents.findIndex((a) => a.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    agents.splice(index, 1);
    await writeStore(AGENTS_FILE, agents);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
