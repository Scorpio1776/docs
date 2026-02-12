'use client';

import AgentCard from './AgentCard';
import type { Agent, AgentTemplate } from '@/lib/types';

interface AgentListProps {
  agents: Agent[];
  templates?: AgentTemplate[];
}

export default function AgentList({ agents, templates = [] }: AgentListProps) {
  const templateMap = new Map(templates.map((t) => [t.id, t]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {agents.map((agent) => {
        const template = templateMap.get(agent.templateId);
        return (
          <AgentCard
            key={agent.id}
            agent={agent}
            templateIcon={template?.icon}
            templateColor={template?.color}
          />
        );
      })}
    </div>
  );
}
