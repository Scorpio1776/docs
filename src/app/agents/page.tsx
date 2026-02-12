'use client';

import { useState } from 'react';
import { Bot, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import AgentList from '@/components/agents/AgentList';
import CreateAgentModal from '@/components/agents/CreateAgentModal';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAgents, useAgentTemplates } from '@/hooks/useAgents';
import type { Agent } from '@/lib/types';

export default function AgentsPage() {
  const { agents, isLoading, mutate } = useAgents();
  const { templates } = useAgentTemplates();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  function handleAgentCreated(_agent: Agent) {
    mutate();
    setIsCreateOpen(false);
  }

  return (
    <div className="min-h-screen">
      <Header title="Agent Desk" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400">
              {agents.length > 0
                ? `${agents.length} agent${agents.length !== 1 ? 's' : ''} deployed`
                : 'Manage your AI agents'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-claw-primary text-white hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Spin Up Agent
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents yet"
            description="No agents yet. Spin up your first agent to get started."
            action={
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-claw-primary text-white hover:bg-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Spin Up Agent
              </button>
            }
          />
        ) : (
          <AgentList agents={agents} templates={templates} />
        )}
      </div>

      <CreateAgentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleAgentCreated}
      />
    </div>
  );
}
