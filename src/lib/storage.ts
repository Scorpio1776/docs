import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const locks = new Map<string, Promise<void>>();

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // directory exists
  }
}

async function withLock<T>(filename: string, fn: () => Promise<T>): Promise<T> {
  while (locks.has(filename)) {
    await locks.get(filename);
  }
  let resolve: () => void;
  const promise = new Promise<void>((r) => { resolve = r; });
  locks.set(filename, promise);
  try {
    return await fn();
  } finally {
    locks.delete(filename);
    resolve!();
  }
}

export async function readStore<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    await writeStore(filename, defaultValue);
    return defaultValue;
  }
}

export async function writeStore<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  return withLock(filename, async () => {
    const filePath = path.join(DATA_DIR, filename);
    const tmpPath = filePath + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  });
}

export async function updateStore<T>(
  filename: string,
  defaultValue: T,
  updater: (data: T) => T
): Promise<T> {
  await ensureDataDir();
  return withLock(filename, async () => {
    const filePath = path.join(DATA_DIR, filename);
    let data: T;
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(content) as T;
    } catch {
      data = defaultValue;
    }
    const updated = updater(data);
    const tmpPath = filePath + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(updated, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
    return updated;
  });
}
