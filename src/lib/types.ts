export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  fetchedAt: string;
  categories: string[];
  summary: string | null;
  whyItMatters: string | null;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  impactScore: number | null;
  dedupGroupId: string | null;
  isRead: boolean;
  isSaved: boolean;
}

export interface NewsCache {
  items: NewsItem[];
  lastRefreshedAt: string | null;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  defaultTools: string[];
  outputFormats: string[];
  icon: string;
  color: string;
}

export interface Agent {
  id: string;
  templateId: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  status: 'idle' | 'working' | 'paused' | 'error';
  createdAt: string;
  lastActiveAt: string | null;
  taskCount: number;
  completedTaskCount: number;
}

export interface TaskInput {
  prompt: string;
  context: string[];
  newsItems: NewsItem[];
  constraints: string | null;
}

export interface TaskOutput {
  content: string;
  format: 'markdown' | 'json' | 'plain_text';
  tokensUsed: number;
  model: string;
  generatedAt: string;
  rating: number | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string | null;
  status: 'backlog' | 'assigned' | 'in_progress' | 'review' | 'done' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliverableType: 'report' | 'summary' | 'analysis' | 'brief' | 'data' | 'other';
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  input: TaskInput;
  output: TaskOutput | null;
  sourceNewsIds: string[];
  vaultEntryId: string | null;
}

export interface ExportRecord {
  platform: 'notion' | 'google_docs' | 'markdown';
  exportedAt: string;
  externalUrl: string | null;
  status: 'success' | 'failed';
}

export interface VaultEntry {
  id: string;
  title: string;
  content: string;
  type: 'report' | 'summary' | 'analysis' | 'brief' | 'data' | 'template' | 'other';
  tags: string[];
  projectId: string | null;
  sourceTaskId: string | null;
  sourceAgentId: string | null;
  createdAt: string;
  updatedAt: string;
  isTemplate: boolean;
  exportedTo: ExportRecord[];
}

export interface NewsCategory {
  id: string;
  name: string;
  keywords: string[];
  color: string;
  isActive: boolean;
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  categories: string[];
  isActive: boolean;
  lastFetchedAt: string | null;
}

export interface AppSettings {
  openaiApiKey: string;
  openaiModel: string;
  newsCategories: NewsCategory[];
  rssSources: RSSSource[];
  refreshIntervalMinutes: number;
  maxNewsItems: number;
  notificationPreferences: {
    taskCompleted: boolean;
    newTrendingTopic: boolean;
    agentError: boolean;
  };
  export: {
    notionApiKey: string | null;
    notionDatabaseId: string | null;
    googleDocsCredentials: Record<string, unknown> | null;
  };
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type AgentStatus = Agent['status'];
