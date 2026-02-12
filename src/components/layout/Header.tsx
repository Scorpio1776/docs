'use client';

import { format } from 'date-fns';

export default function Header({ title }: { title?: string }) {
  const greeting = getGreeting();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {title ? (
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          ) : (
            <h1 className="text-xl font-semibold text-white">{greeting}, Operator</h1>
          )}
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
