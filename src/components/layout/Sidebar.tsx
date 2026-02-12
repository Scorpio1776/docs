'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Bot, KanbanSquare, Archive, Settings, Zap } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/', label: 'Morning Brief', icon: Home },
  { href: '/news', label: 'News Intel', icon: Newspaper },
  { href: '/agents', label: 'Agent Desk', icon: Bot },
  { href: '/tasks', label: 'Task Board', icon: KanbanSquare },
  { href: '/vault', label: 'Knowledge Vault', icon: Archive },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-7 h-7 text-claw-primary" />
          <span className="text-lg font-bold text-white">Clawdbot</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-claw-primary/15 text-claw-primary'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <Link
          href="/settings"
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-claw-primary/15 text-claw-primary'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
