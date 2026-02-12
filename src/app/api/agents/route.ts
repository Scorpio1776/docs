import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readStore, writeStore } from '@/lib/storage';
import { DEFAULT_AGENT_TEMPLATES } from '@/lib/defaults';
import type { Agent, AgentTemplate } from '@/lib/types';

const AGENTS_FILE = 'agents.json';
const TEMPLATES_FILE = 'agent-templates.json';

export async function GET() {
  try {
    const agents = await readStore<Agent[]>(AGENTS_FILE, []);
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Failed to read agents:', error);
    return NextResponse.json(
      { error: 'Failed to read agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, name, description, tools } = body as {
      templateId: string;
      name: string;
      description?: string;
      tools?: string[];
    };

    if (!templateId || !name) {
      return NextResponse.json(
        { error: 'templateId and name are required' },
        { status: 400 }
      );
    }

    // Load templates, seeding defaults if file doesn't exist
    const templates = await readStore<AgentTemplate[]>(
      TEMPLATES_FILE,
      DEFAULT_AGENT_TEMPLATES
    );

    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template "${templateId}" not found` },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const newAgent: Agent = {
      id: uuidv4(),
      templateId: template.id,
      name,
      role: template.name,
      description: description ?? template.description,
      systemPrompt: template.systemPrompt,
      tools: tools ?? [...template.defaultTools],
      status: 'idle',
      createdAt: now,
      lastActiveAt: null,
      taskCount: 0,
      completedTaskCount: 0,
    };

    const agents = await readStore<Agent[]>(AGENTS_FILE, []);
    agents.push(newAgent);
    await writeStore(AGENTS_FILE, agents);

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
