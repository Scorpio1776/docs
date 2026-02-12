import fs from 'fs/promises';
import path from 'path';
import type { VaultEntry, ExportRecord } from '@/lib/types';

export interface Exporter {
  export(entry: VaultEntry): Promise<ExportRecord>;
}

function formatVaultEntryAsMarkdown(entry: VaultEntry): string {
  const lines: string[] = [];

  lines.push(`# ${entry.title}`);
  lines.push('');
  lines.push(`**Type:** ${entry.type}`);
  if (entry.tags.length > 0) {
    lines.push(`**Tags:** ${entry.tags.join(', ')}`);
  }
  lines.push(`**Created:** ${new Date(entry.createdAt).toLocaleString()}`);
  lines.push(`**Updated:** ${new Date(entry.updatedAt).toLocaleString()}`);
  if (entry.sourceTaskId) {
    lines.push(`**Source Task:** ${entry.sourceTaskId}`);
  }
  if (entry.sourceAgentId) {
    lines.push(`**Source Agent:** ${entry.sourceAgentId}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(entry.content);

  return lines.join('\n');
}

export class MarkdownFileExporter implements Exporter {
  async export(entry: VaultEntry): Promise<ExportRecord> {
    try {
      const exportDir = path.join(process.cwd(), 'data', 'exports');
      await fs.mkdir(exportDir, { recursive: true });

      const filePath = path.join(exportDir, `${entry.id}.md`);
      const markdown = formatVaultEntryAsMarkdown(entry);
      await fs.writeFile(filePath, markdown, 'utf-8');

      return {
        platform: 'markdown',
        exportedAt: new Date().toISOString(),
        externalUrl: filePath,
        status: 'success',
      };
    } catch (error) {
      console.error('Markdown export failed:', error);
      return {
        platform: 'markdown',
        exportedAt: new Date().toISOString(),
        externalUrl: null,
        status: 'failed',
      };
    }
  }
}

export class NotionExporter implements Exporter {
  async export(_entry: VaultEntry): Promise<ExportRecord> {
    return {
      platform: 'notion',
      exportedAt: new Date().toISOString(),
      externalUrl: null,
      status: 'failed',
    };
  }
}

export class GoogleDocsExporter implements Exporter {
  async export(_entry: VaultEntry): Promise<ExportRecord> {
    return {
      platform: 'google_docs',
      exportedAt: new Date().toISOString(),
      externalUrl: null,
      status: 'failed',
    };
  }
}

export function getExporter(platform: string): Exporter {
  switch (platform) {
    case 'markdown':
      return new MarkdownFileExporter();
    case 'notion':
      return new NotionExporter();
    case 'google_docs':
      return new GoogleDocsExporter();
    default:
      throw new Error(`Unknown export platform: ${platform}`);
  }
}
