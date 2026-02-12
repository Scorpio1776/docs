import { clsx } from 'clsx';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  gray: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
};

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, color = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {children}
    </span>
  );
}
