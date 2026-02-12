import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import { Task, Agent } from '@/lib/types';
import { executeTask } from '@/lib/agent-executor';

const TASKS_FILE = 'tasks.json';
const AGENTS_FILE = 'agents.json';
const DEFAULT_TASKS: Task[] = [];
const DEFAULT_AGENTS: Agent[] = [];

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);
    const taskIndex = tasks.findIndex((t) => t.id === params.id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = tasks[taskIndex];

    if (!task.agentId) {
      return NextResponse.json(
        { error: 'Task has no assigned agent. Assign an agent before executing.' },
        { status: 400 }
      );
    }

    const agents = await readStore<Agent[]>(AGENTS_FILE, DEFAULT_AGENTS);
    const agentIndex = agents.findIndex((a) => a.id === task.agentId);

    if (agentIndex === -1) {
      return NextResponse.json(
        { error: `Agent "${task.agentId}" not found` },
        { status: 404 }
      );
    }

    const agent = agents[agentIndex];
    const now = new Date().toISOString();

    // Update task to in_progress
    tasks[taskIndex] = {
      ...task,
      status: 'in_progress',
      startedAt: task.startedAt || now,
      updatedAt: now,
    };

    // Update agent to working
    agents[agentIndex] = {
      ...agent,
      status: 'working',
      lastActiveAt: now,
    };

    await writeStore(TASKS_FILE, tasks);
    await writeStore(AGENTS_FILE, agents);

    // Execute the task
    const output = await executeTask(tasks[taskIndex], agent);

    // Determine final status based on output
    const isError = output.model === 'error';
    const finalStatus = isError ? 'error' : 'review';

    // Update task with output
    const updatedTask: Task = {
      ...tasks[taskIndex],
      status: finalStatus,
      output,
      updatedAt: new Date().toISOString(),
      completedAt: finalStatus === 'review' ? new Date().toISOString() : null,
    };

    // Reload tasks in case of concurrent writes, then update
    const currentTasks = await readStore<Task[]>(TASKS_FILE, DEFAULT_TASKS);
    const currentIndex = currentTasks.findIndex((t) => t.id === params.id);
    if (currentIndex !== -1) {
      currentTasks[currentIndex] = updatedTask;
    }
    await writeStore(TASKS_FILE, currentTasks);

    // Update agent back to idle, increment task counts
    const currentAgents = await readStore<Agent[]>(AGENTS_FILE, DEFAULT_AGENTS);
    const currentAgentIndex = currentAgents.findIndex((a) => a.id === agent.id);
    if (currentAgentIndex !== -1) {
      currentAgents[currentAgentIndex] = {
        ...currentAgents[currentAgentIndex],
        status: 'idle',
        lastActiveAt: new Date().toISOString(),
        taskCount: currentAgents[currentAgentIndex].taskCount + 1,
        completedTaskCount: isError
          ? currentAgents[currentAgentIndex].completedTaskCount
          : currentAgents[currentAgentIndex].completedTaskCount + 1,
      };
    }
    await writeStore(AGENTS_FILE, currentAgents);

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to execute task';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
