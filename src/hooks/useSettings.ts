import useSWR from 'swr';
import type { AppSettings } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<{ settings: AppSettings }>(
    '/api/settings',
    fetcher
  );

  async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings | null> {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const result = await response.json();
      await mutate(result, false);
      return result.settings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return null;
    }
  }

  return {
    settings: data?.settings ?? null,
    isLoading,
    error,
    mutate,
    updateSettings,
  };
}
