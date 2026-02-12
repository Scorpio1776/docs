import { NextResponse } from 'next/server';
import { readStore } from '@/lib/storage';
import { DEFAULT_AGENT_TEMPLATES } from '@/lib/defaults';
import type { AgentTemplate } from '@/lib/types';

const TEMPLATES_FILE = 'agent-templates.json';

export async function GET() {
  try {
    const templates = await readStore<AgentTemplate[]>(
      TEMPLATES_FILE,
      DEFAULT_AGENT_TEMPLATES
    );
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to read agent templates:', error);
    return NextResponse.json(
      { error: 'Failed to read agent templates' },
      { status: 500 }
    );
  }
}
