'use client';

import { useState } from 'react';
import { Clock, Cpu, Star, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';
import { TaskOutput } from '@/lib/types';

interface OutputViewerProps {
  output: TaskOutput;
  onRate?: (rating: number) => void;
}

export default function OutputViewer({ output, onRate }: OutputViewerProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const currentRating = output.rating ?? 0;

  const handleRate = (rating: number) => {
    if (onRate) {
      onRate(rating);
    }
  };

  return (
    <div className="space-y-4">
      {/* Metadata bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-800">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-gray-400">{output.model}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span className="text-gray-400">{output.tokensUsed.toLocaleString()} tokens</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-gray-400">
            {format(parseISO(output.generatedAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-gray-500 mr-1">Rate:</span>
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoveredStar || currentRating);
            return (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-colors"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-4 h-4 ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-800/30 border border-gray-800 rounded-lg p-5">
        <MarkdownRenderer content={output.content} />
      </div>
    </div>
  );
}
