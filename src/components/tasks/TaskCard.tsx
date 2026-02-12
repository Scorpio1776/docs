'use client';

import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import Badge from '@/components/shared/Badge';
import { Task, Agent } from '@/lib/types';

const priorityConfig: Record<Task['priority'], { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'red' },
  high: { label: 'High', color: 'amber' },
  medium: { label: 'Medium', color: 'blue' },
  low: { label: 'Low', color: 'gray' },
};

const deliverableLabels: Record<Task['deliverableType'], string> = {
  report: 'Report',
  summary: 'Summary',
  analysis: 'Analysis',
  brief: 'Brief',
  data: 'Data',
  other: 'Other',
};

interface TaskCardProps {
  task: Task;
  agents: Agent[];
}

export default function TaskCard({ task, agents }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const assignedAgent = task.agentId
    ? agents.find((a) => a.id === task.agentId)
    : null;

  const isOverdue = task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'done';

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 hover:bg-gray-800/80 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-2 leading-snug">
            {task.title}
          </h4>
          <Badge color={priority.color} size="sm">
            {priority.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge color="indigo" size="sm">
            {deliverableLabels[task.deliverableType]}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className={assignedAgent ? 'text-gray-400' : 'text-gray-600'}>
              {assignedAgent ? assignedAgent.name : 'Unassigned'}
            </span>
          </div>

          {task.deadline && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              <span>{format(parseISO(task.deadline), 'MMM d')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
