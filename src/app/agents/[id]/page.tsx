'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ArrowLeft,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  PenTool,
  Radar,
  ShieldCheck,
  Activity,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Badge from '@/components/shared/Badge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAgent, useAgentTemplates } from '@/hooks/useAgents';
import type { Agent } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  Search,
  BarChart3,
  PenTool,
  Radar,
  ShieldCheck,
  Activity,
};

const statusConfig: Record<
  Agent['status'],
  { label: string; color: string; dotColor: string }
> = {
  idle: { label: 'Idle', color: 'green', dotColor: 'bg-green-400' },
  working: { label: 'Working', color: 'blue', dotColor: 'bg-blue-400' },
  paused: { label: 'Paused', color: 'amber', dotColor: 'bg-amber-400' },
  error: { label: 'Error', color: 'red', dotColor: 'bg-red-400' },
};

const templateColorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/15',
  purple: 'text-purple-400 bg-purple-500/15',
  green: 'text-green-400 bg-green-500/15',
  cyan: 'text-cyan-400 bg-cyan-500/15',
  amber: 'text-amber-400 bg-amber-500/15',
  red: 'text-red-400 bg-red-500/15',
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = typeof params.id === 'string' ? params.id : null;
  const { agent, isLoading, error, mutate } = useAgent(agentId);
  const { templates } = useAgentTemplates();

  const [editName, setEditName] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Agent Detail" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen">
        <Header title="Agent Detail" />
        <div className="p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">
              {error ? 'Failed to load agent.' : 'Agent not found.'}
            </p>
            <button
              type="button"
              onClick={() => router.push('/agents')}
              className="inline-flex items-center gap-2 text-sm text-claw-primary hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Agent Desk
            </button>
          </div>
        </div>
      </div>
    );
  }

  const template = templates.find((t) => t.id === agent.templateId);
  const Icon = iconMap[template?.icon ?? ''] ?? Bot;
  const iconColors = templateColorMap[template?.color ?? 'blue'] ?? templateColorMap.blue;
  const status = statusConfig[agent.status];

  const currentName = editName ?? agent.name;
  const currentDescription = editDescription ?? agent.description;
  const hasChanges = editName !== null || editDescription !== null;

  async function handleSave() {
    if (!hasChanges || !agentId) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updates: Partial<Agent> = {};
      if (editName !== null) updates.name = editName.trim();
      if (editDescription !== null) updates.description = editDescription.trim();

      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setEditName(null);
      setEditDescription(null);
      mutate();
      setSaveMessage('Saved successfully');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!agentId) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      router.push('/agents');
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const createdDate = new Date(agent.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lastActiveDate = agent.lastActiveAt
    ? new Date(agent.lastActiveAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  return (
    <div className="min-h-screen">
      <Header title="Agent Detail" />

      <div className="p-6 max-w-4xl">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push('/agents')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agent Desk
        </button>

        {/* Agent header */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                iconColors
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent text-xl font-semibold text-white border-b border-transparent hover:border-gray-700 focus:border-claw-primary focus:outline-none pb-0.5 transition-colors"
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <Badge color={status.color}>
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
                          status.dotColor
                        )}
                      />
                      {status.label}
                    </Badge>
                    {template && (
                      <span className="text-sm text-gray-500">
                        {template.name} template
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hasChanges && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-claw-primary text-white hover:bg-indigo-500 transition-colors disabled:opacity-40"
                    >
                      {isSaving ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {saveMessage && (
            <p className="text-xs text-green-400 mt-2 ml-16">{saveMessage}</p>
          )}
        </div>

        {/* Description */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Description</h3>
          <textarea
            value={currentDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-claw-primary/50 focus:border-claw-primary resize-none"
          />
        </div>

        {/* System prompt */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <button
            type="button"
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-sm font-medium text-gray-300">System Prompt</h3>
            {showPrompt ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {showPrompt && (
            <div className="mt-3 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {agent.systemPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Tools</h3>
          {agent.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-800 border border-gray-700 text-gray-300"
                >
                  {tool.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tools assigned.</p>
          )}
        </div>

        {/* Task stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Task Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{agent.taskCount}</p>
              <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">
                {agent.completedTaskCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-amber-400">
                {agent.taskCount - agent.completedTaskCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Remaining</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-400">
                {agent.taskCount > 0
                  ? Math.round(
                      (agent.completedTaskCount / agent.taskCount) * 100
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Agent ID</dt>
              <dd className="text-gray-300 font-mono text-xs">{agent.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Created</dt>
              <dd className="text-gray-300">{createdDate}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Active</dt>
              <dd className="text-gray-300">{lastActiveDate}</dd>
            </div>
          </dl>
        </div>

        {/* Danger zone */}
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete this agent and all associated configuration. This action
            cannot be undone.
          </p>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Are you sure?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-40"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
