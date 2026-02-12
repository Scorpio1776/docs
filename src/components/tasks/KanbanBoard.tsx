'use client';

import { useTaskBoard } from '@/hooks/useTasks';
import { Agent, TaskStatus } from '@/lib/types';
import KanbanColumn from '@/components/tasks/KanbanColumn';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'Assigned', status: 'assigned' },
  { title: 'In Progress', status: 'in_progress' },
  { title: 'Review', status: 'review' },
  { title: 'Done', status: 'done' },
];

interface KanbanBoardProps {
  agents: Agent[];
}

export default function KanbanBoard({ agents }: KanbanBoardProps) {
  const { columns: boardColumns, isLoading, error } = useTaskBoard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-red-400 text-sm">Failed to load task board. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-1">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          tasks={boardColumns[col.status] || []}
          agents={agents}
        />
      ))}
    </div>
  );
}
