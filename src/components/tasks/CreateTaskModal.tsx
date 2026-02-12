'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Task, Agent, NewsItem } from '@/lib/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (task: Task) => void;
  agents: Agent[];
  prefilledNewsItem?: NewsItem;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
  agents,
  prefilledNewsItem,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState(prefilledNewsItem?.title || '');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [deliverableType, setDeliverableType] = useState<Task['deliverableType']>('report');
  const [deadline, setDeadline] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!prompt.trim()) {
      setError('Prompt / instructions for the agent are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        agentId: agentId || null,
        priority,
        deliverableType,
        deadline: deadline || null,
        sourceNewsIds: prefilledNewsItem ? [prefilledNewsItem.id] : [],
        input: {
          prompt: prompt.trim(),
          context: [],
          newsItems: prefilledNewsItem ? [prefilledNewsItem] : [],
          constraints: null,
        },
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      const data = await res.json();
      onCreated(data.task);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(prefilledNewsItem?.title || '');
    setDescription('');
    setAgentId('');
    setPriority('medium');
    setDeliverableType('report');
    setDeadline('');
    setPrompt('');
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Additional context about this task..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-agent" className="block text-sm font-medium text-gray-300 mb-1">
              Assign Agent
            </label>
            <select
              id="task-agent"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-deliverable" className="block text-sm font-medium text-gray-300 mb-1">
              Deliverable Type
            </label>
            <select
              id="task-deliverable"
              value={deliverableType}
              onChange={(e) => setDeliverableType(e.target.value as Task['deliverableType'])}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent"
            >
              <option value="report">Report</option>
              <option value="summary">Summary</option>
              <option value="analysis">Analysis</option>
              <option value="brief">Brief</option>
              <option value="data">Data</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-deadline" className="block text-sm font-medium text-gray-300 mb-1">
              Deadline
            </label>
            <input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="task-prompt" className="block text-sm font-medium text-gray-300 mb-1">
            Agent Instructions / Prompt
          </label>
          <textarea
            id="task-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="What should the agent do? Be specific about the expected output..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-claw-primary focus:border-transparent resize-none"
          />
        </div>

        {prefilledNewsItem && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-blue-400 mb-1">Linked News Item</p>
            <p className="text-sm text-gray-300">{prefilledNewsItem.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{prefilledNewsItem.source}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-claw-primary hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
