import useSWR from 'swr';
import type { Agent, AgentTemplate } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAgents() {
  const { data, error, isLoading, mutate } = useSWR<{ agents: Agent[] }>(
    '/api/agents',
    fetcher
  );

  return {
    agents: data?.agents ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useAgent(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ agent: Agent }>(
    id ? `/api/agents/${id}` : null,
    fetcher
  );

  return {
    agent: data?.agent ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useAgentTemplates() {
  const { data, error, isLoading, mutate } = useSWR<{ templates: AgentTemplate[] }>(
    '/api/agents/templates',
    fetcher
  );

  return {
    templates: data?.templates ?? [],
    isLoading,
    error,
    mutate,
  };
}
