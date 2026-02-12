import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import { Task } from '@/lib/types';

const TASKS_FILE = 'tasks.json';
const DEFAULT_TASKS: Task[] = [];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);
    const task = tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);
    const index = tasks.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const existing = tasks[index];
    const now = new Date().toISOString();

    const updated: Task = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    // Handle status transition side effects
    if (body.status && body.status !== existing.status) {
      if (body.status === 'in_progress' && !existing.startedAt) {
        updated.startedAt = now;
      }
      if (body.status === 'done' && !existing.completedAt) {
        updated.completedAt = now;
      }
      if (body.status === 'assigned' && body.agentId && !existing.agentId) {
        updated.agentId = body.agentId;
      }
    }

    tasks[index] = updated;
    await writeStore(TASKS_FILE, tasks);

    return NextResponse.json({ task: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);
    const index = tasks.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks.splice(index, 1);
    await writeStore(TASKS_FILE, tasks);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
