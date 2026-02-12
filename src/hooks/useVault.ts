import useSWR from 'swr';
import type { VaultEntry } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useVault(params?: { type?: string; tags?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.tags) searchParams.set('tags', params.tags);
  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  const url = queryString ? `/api/vault?${queryString}` : '/api/vault';

  const { data, error, isLoading, mutate } = useSWR<{ entries: VaultEntry[] }>(
    url,
    fetcher
  );

  return {
    entries: data?.entries ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useVaultEntry(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ entry: VaultEntry }>(
    id ? `/api/vault/${id}` : null,
    fetcher
  );

  return {
    entry: data?.entry ?? null,
    isLoading,
    error,
    mutate,
  };
}
