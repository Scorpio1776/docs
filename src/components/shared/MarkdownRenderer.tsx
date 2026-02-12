'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium text-gray-200 mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-gray-300 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-gray-300 mb-3">{children}</ol>,
          li: ({ children }) => <li className="text-gray-300">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-claw-primary hover:text-indigo-400 underline">
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto mb-3">
                  <code className="text-sm text-gray-200">{children}</code>
                </pre>
              );
            }
            return <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-claw-accent">{children}</code>;
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-claw-primary pl-4 italic text-gray-400 my-3">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border-collapse border border-gray-700">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-gray-700 bg-gray-800 px-3 py-2 text-left text-sm font-medium text-gray-200">{children}</th>,
          td: ({ children }) => <td className="border border-gray-700 px-3 py-2 text-sm text-gray-300">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
