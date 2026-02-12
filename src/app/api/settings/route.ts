import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/defaults';
import type { AppSettings } from '@/lib/types';

const SETTINGS_FILE = 'settings.json';

export async function GET() {
  try {
    const settings = await readStore<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to read settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const current = await readStore<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);

    // Deep merge: handle nested objects properly
    const updated: AppSettings = {
      ...current,
      ...body,
      notificationPreferences: {
        ...current.notificationPreferences,
        ...(body.notificationPreferences ?? {}),
      },
      export: {
        ...current.export,
        ...(body.export ?? {}),
      },
    };

    // Preserve arrays if provided in body, otherwise keep current
    if (body.newsCategories !== undefined) {
      updated.newsCategories = body.newsCategories;
    }
    if (body.rssSources !== undefined) {
      updated.rssSources = body.rssSources;
    }

    await writeStore(SETTINGS_FILE, updated);
    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
