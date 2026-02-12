import { NextResponse } from 'next/server';
import { readStore } from '@/lib/storage';
import { Task } from '@/lib/types';

const TASKS_FILE = 'tasks.json';
const DEFAULT_TASKS: Task[] = [];

export async function GET() {
  try {
    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);

    const columns = {
      backlog: tasks.filter((t) => t.status === 'backlog'),
      assigned: tasks.filter((t) => t.status === 'assigned'),
      in_progress: tasks.filter((t) => t.status === 'in_progress'),
      review: tasks.filter((t) => t.status === 'review'),
      done: tasks.filter((t) => t.status === 'done'),
    };

    return NextResponse.json({ columns });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load task board';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
