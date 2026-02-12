'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Plus, KanbanSquare } from 'lucide-react';
import Header from '@/components/layout/Header';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Agent, Task } from '@/lib/types';
import { useTaskBoard } from '@/hooks/useTasks';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TasksPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: agentsData, isLoading: agentsLoading } = useSWR('/api/agents', fetcher);
  const { columns, isLoading: boardLoading, mutate: mutateBoard } = useTaskBoard();

  const agents: Agent[] = agentsData?.agents ?? [];
  const isLoading = agentsLoading || boardLoading;

  const totalTasks =
    (columns.backlog?.length ?? 0) +
    (columns.assigned?.length ?? 0) +
    (columns.in_progress?.length ?? 0) +
    (columns.review?.length ?? 0) +
    (columns.done?.length ?? 0);

  const handleTaskCreated = (_task: Task) => {
    mutateBoard();
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header title="Task Board" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">
              Manage and track tasks assigned to your AI agents.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-claw-primary hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : totalTasks === 0 ? (
          <EmptyState
            icon={KanbanSquare}
            title="No tasks yet"
            description="Create your first task to get started. Assign it to an agent and let AI do the work."
            action={
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-claw-primary hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            }
          />
        ) : (
          <KanbanBoard agents={agents} />
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleTaskCreated}
        agents={agents}
      />
    </div>
  );
}
