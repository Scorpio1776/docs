import { v4 as uuidv4 } from 'uuid';
import type { NewsItem } from './types';

/**
 * Normalizes a title for comparison: lowercased, punctuation removed, trimmed.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a set of words from a normalized title.
 */
function getWordSet(normalized: string): Set<string> {
  return new Set(normalized.split(' ').filter((w) => w.length > 0));
}

/**
 * Computes the Jaccard similarity between two sets of words.
 * Returns a value between 0 (no overlap) and 1 (identical sets).
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;

  let intersectionSize = 0;
  for (const word of a) {
    if (b.has(word)) {
      intersectionSize++;
    }
  }

  const unionSize = a.size + b.size - intersectionSize;
  if (unionSize === 0) return 0;

  return intersectionSize / unionSize;
}

const SIMILARITY_THRESHOLD = 0.6;

/**
 * Deduplicates news items by grouping those with similar titles.
 * Items with Jaccard similarity > 0.6 on their title words are grouped
 * under the same dedupGroupId. The earliest published item in each group
 * appears first.
 */
export function deduplicateNews(items: NewsItem[]): NewsItem[] {
  if (items.length === 0) return [];

  // Pre-compute normalized titles and word sets
  const processed = items.map((item) => {
    const normalized = normalizeTitle(item.title);
    return {
      item,
      normalized,
      wordSet: getWordSet(normalized),
      groupIndex: -1,
    };
  });

  // Union-Find style grouping
  const groups: number[][] = [];

  for (let i = 0; i < processed.length; i++) {
    if (processed[i].groupIndex !== -1) continue;

    // Start a new group with this item
    const groupIndex = groups.length;
    const group: number[] = [i];
    processed[i].groupIndex = groupIndex;

    // Find all similar items not yet grouped
    for (let j = i + 1; j < processed.length; j++) {
      if (processed[j].groupIndex !== -1) continue;

      const similarity = jaccardSimilarity(
        processed[i].wordSet,
        processed[j].wordSet
      );

      if (similarity > SIMILARITY_THRESHOLD) {
        processed[j].groupIndex = groupIndex;
        group.push(j);
      }
    }

    groups.push(group);
  }

  // Assign dedupGroupIds and sort within groups by publishedAt ascending
  const result: NewsItem[] = [];

  for (const group of groups) {
    if (group.length === 1) {
      // Single item, no dedup group needed
      result.push(processed[group[0]].item);
      continue;
    }

    // Sort group members by publishedAt ascending (earliest first)
    const groupItems = group
      .map((idx) => processed[idx].item)
      .sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      );

    const groupId = uuidv4();

    for (const item of groupItems) {
      result.push({
        ...item,
        dedupGroupId: groupId,
      });
    }
  }

  return result;
}
