import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readStore, writeStore } from '@/lib/storage';
import { Task, TaskInput } from '@/lib/types';

const TASKS_FILE = 'tasks.json';
const DEFAULT_TASKS: Task[] = [];

export async function GET(request: NextRequest) {
  try {
    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    const priority = searchParams.get('priority');

    let filtered = tasks;

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (agentId) {
      filtered = filtered.filter((t) => t.agentId === agentId);
    }
    if (priority) {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    return NextResponse.json({ tasks: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read tasks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      agentId,
      priority,
      deliverableType,
      deadline,
      sourceNewsIds,
      input,
    } = body as {
      title: string;
      description: string;
      agentId?: string | null;
      priority: Task['priority'];
      deliverableType: Task['deliverableType'];
      deadline?: string | null;
      sourceNewsIds?: string[];
      input: TaskInput;
    };

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!input || !input.prompt) {
      return NextResponse.json({ error: 'Task input with prompt is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const assignedAgentId = agentId || null;

    const task: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description || '',
      agentId: assignedAgentId,
      status: assignedAgentId ? 'assigned' : 'backlog',
      priority: priority || 'medium',
      deliverableType: deliverableType || 'other',
      deadline: deadline || null,
      createdAt: now,
      updatedAt: now,
      startedAt: null,
      completedAt: null,
      input: {
        prompt: input.prompt,
        context: input.context || [],
        newsItems: input.newsItems || [],
        constraints: input.constraints || null,
      },
      output: null,
      sourceNewsIds: sourceNewsIds || [],
      vaultEntryId: null,
    };

    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);
    tasks.push(task);
    await writeStore(TASKS_FILE, tasks);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
