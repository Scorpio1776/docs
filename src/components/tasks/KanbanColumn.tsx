'use client';

import { Task, Agent, TaskStatus } from '@/lib/types';
import TaskCard from '@/components/tasks/TaskCard';

const statusColors: Record<TaskStatus, string> = {
  backlog: 'bg-gray-500',
  assigned: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
  error: 'bg-red-500',
};

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  agents: Agent[];
}

export default function KanbanColumn({ title, status, tasks, agents }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-gray-900/50 rounded-xl border border-gray-800">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-800 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-260px)]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-gray-600">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} agents={agents} />
          ))
        )}
      </div>
    </div>
  );
}
