import useSWR from 'swr';
import { Task } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseTasksParams {
  status?: string;
  agentId?: string;
  priority?: string;
}

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useTasks(params?: UseTasksParams): UseTasksReturn {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.agentId) searchParams.set('agentId', params.agentId);
  if (params?.priority) searchParams.set('priority', params.priority);

  const queryString = searchParams.toString();
  const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 10000,
  });

  return {
    tasks: data?.tasks ?? [],
    isLoading,
    error,
    mutate,
  };
}

interface BoardColumns {
  backlog: Task[];
  assigned: Task[];
  in_progress: Task[];
  review: Task[];
  done: Task[];
  error: Task[];
  [key: string]: Task[];
}

interface UseTaskBoardReturn {
  columns: BoardColumns;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useTaskBoard(): UseTaskBoardReturn {
  const { data, error, isLoading, mutate } = useSWR('/api/tasks/board', fetcher, {
    refreshInterval: 10000,
  });

  const emptyColumns: BoardColumns = {
    backlog: [],
    assigned: [],
    in_progress: [],
    review: [],
    done: [],
    error: [],
  };

  return {
    columns: data?.columns ?? emptyColumns,
    isLoading,
    error,
    mutate,
  };
}
