'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  ArrowLeft,
  Play,
  Archive,
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import Header from '@/components/layout/Header';
import Badge from '@/components/shared/Badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import OutputViewer from '@/components/tasks/OutputViewer';
import { Task, Agent, TaskStatus } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const priorityConfig: Record<Task['priority'], { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'red' },
  high: { label: 'High', color: 'amber' },
  medium: { label: 'Medium', color: 'blue' },
  low: { label: 'Low', color: 'gray' },
};

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: 'Backlog', color: 'gray' },
  assigned: { label: 'Assigned', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'amber' },
  review: { label: 'Review', color: 'purple' },
  done: { label: 'Done', color: 'green' },
  error: { label: 'Error', color: 'red' },
};

const allStatuses: TaskStatus[] = ['backlog', 'assigned', 'in_progress', 'review', 'done'];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const {
    data: taskData,
    error: taskError,
    isLoading: taskLoading,
    mutate: mutateTask,
  } = useSWR(`/api/tasks/${taskId}`, fetcher);

  const { data: agentsData } = useSWR('/api/agents', fetcher);

  const [isExecuting, setIsExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const task: Task | null = taskData?.task ?? null;
  const agents: Agent[] = agentsData?.agents ?? [];
  const assignedAgent = task?.agentId
    ? agents.find((a) => a.id === task.agentId)
    : null;

  const handleExecute = async () => {
    if (!task) return;
    setIsExecuting(true);
    setExecuteError(null);

    try {
      const res = await fetch(`/api/tasks/${task.id}/execute`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to execute task');
      }

      await mutateTask();
    } catch (err) {
      setExecuteError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      await mutateTask();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!task || !task.output) return;

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          output: { ...task.output, rating },
        }),
      });
      await mutateTask();
    } catch (err) {
      console.error('Failed to save rating:', err);
    }
  };

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header title="Task Detail" />
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header title="Task Detail" />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-gray-400">Task not found or failed to load.</p>
          <Link
            href="/tasks"
            className="text-sm text-claw-primary hover:text-indigo-400 transition-colors"
          >
            Back to Task Board
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[task.status];
  const priorityInfo = priorityConfig[task.priority];
  const canExecute = task.agentId && ['assigned', 'error'].includes(task.status);

  return (
    <div className="min-h-screen bg-gray-950">
      <Header title="Task Detail" />

      <div className="p-6 max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Task Board
        </Link>

        {/* Task header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white mb-2">{task.title}</h1>
              {task.description && (
                <p className="text-sm text-gray-400 leading-relaxed">{task.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge color={statusInfo.color} size="md">
                {statusInfo.label}
              </Badge>
              <Badge color={priorityInfo.color} size="md">
                {priorityInfo.label}
              </Badge>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs mb-1">Agent</span>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span className={assignedAgent ? 'text-gray-300' : 'text-gray-600'}>
                  {assignedAgent ? assignedAgent.name : 'Unassigned'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 block text-xs mb-1">Created</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-300">
                  {format(parseISO(task.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            {task.deadline && (
              <div>
                <span className="text-gray-500 block text-xs mb-1">Deadline</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-300">
                    {format(parseISO(task.deadline), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
            {task.completedAt && (
              <div>
                <span className="text-gray-500 block text-xs mb-1">Completed</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-gray-300">
                    {format(parseISO(task.completedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-3 mb-6">
          {canExecute && (
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Task
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="status-select" className="text-xs text-gray-500">
              Status:
            </label>
            <select
              id="status-select"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              disabled={isUpdatingStatus}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent disabled:opacity-50"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusConfig[s].label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-200 rounded-lg transition-colors ml-auto"
          >
            <Archive className="w-4 h-4" />
            Save to Vault
          </button>
        </div>

        {/* Execute error */}
        {executeError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 mb-6">
            {executeError}
          </div>
        )}

        {/* Input section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Task Input
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 block mb-1">Prompt</span>
              <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 whitespace-pre-wrap">
                {task.input.prompt}
              </p>
            </div>

            {task.input.context.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">Context</span>
                <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                  {task.input.context.map((ctx, i) => (
                    <li key={i}>{ctx}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.input.newsItems.length > 0 && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">
                  Linked News Items ({task.input.newsItems.length})
                </span>
                <div className="space-y-2">
                  {task.input.newsItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-800/50 rounded-lg p-3 text-sm"
                    >
                      <p className="text-gray-300 font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.source} - {format(parseISO(item.publishedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.input.constraints && (
              <div>
                <span className="text-xs text-gray-500 block mb-1">Constraints</span>
                <p className="text-sm text-gray-400">{task.input.constraints}</p>
              </div>
            )}
          </div>
        </div>

        {/* Output section */}
        {task.output && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Output
            </h2>
            <OutputViewer output={task.output} onRate={handleRate} />
          </div>
        )}

        {!task.output && task.status !== 'in_progress' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-3">
                <Play className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">
                No output yet. {canExecute ? 'Execute the task to generate output.' : 'Assign an agent and execute the task.'}
              </p>
            </div>
          </div>
        )}

        {task.status === 'in_progress' && !task.output && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-sm text-gray-400">Task is being executed by the agent...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
