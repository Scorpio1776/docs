import OpenAI from 'openai';
import { readStore } from '@/lib/storage';
import { AppSettings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/defaults';

let clientInstance: OpenAI | null = null;
let cachedKey: string | null = null;

export async function getOpenAIClient(): Promise<OpenAI> {
  const settings = await readStore<AppSettings>('settings.json', DEFAULT_SETTINGS);
  const apiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY || '';

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not configured. Set it in Settings or provide the OPENAI_API_KEY environment variable.'
    );
  }

  if (clientInstance && cachedKey === apiKey) {
    return clientInstance;
  }

  clientInstance = new OpenAI({ apiKey });
  cachedKey = apiKey;
  return clientInstance;
}

export async function getOpenAIModel(): Promise<string> {
  const settings = await readStore<AppSettings>('settings.json', DEFAULT_SETTINGS);
  return settings.openaiModel || 'gpt-4o';
}
