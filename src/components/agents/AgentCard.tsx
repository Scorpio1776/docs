'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Search,
  BarChart3,
  PenTool,
  Radar,
  ShieldCheck,
  Activity,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import Badge from '@/components/shared/Badge';
import type { Agent } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  Search,
  BarChart3,
  PenTool,
  Radar,
  ShieldCheck,
  Activity,
};

function getAgentIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Bot;
}

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

interface AgentCardProps {
  agent: Agent;
  templateIcon?: string;
  templateColor?: string;
}

export default function AgentCard({
  agent,
  templateIcon = 'Bot',
  templateColor = 'blue',
}: AgentCardProps) {
  const Icon = getAgentIcon(templateIcon);
  const status = statusConfig[agent.status];
  const iconColors = templateColorMap[templateColor] ?? templateColorMap.blue;

  return (
    <Link href={`/agents/${agent.id}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors h-full">
        <div className="flex items-start justify-between mb-3">
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              iconColors
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <Badge color={status.color}>
            <span
              className={clsx(
                'w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
                status.dotColor
              )}
            />
            {status.label}
          </Badge>
        </div>

        <h3 className="text-white font-medium mb-1 group-hover:text-claw-primary transition-colors">
          {agent.name}
        </h3>
        <p className="text-sm text-gray-500 mb-1">{agent.role}</p>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {agent.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            {agent.completedTaskCount}/{agent.taskCount} tasks
          </span>
          {agent.tools.length > 0 && (
            <span>
              {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export { getAgentIcon, statusConfig, templateColorMap };
