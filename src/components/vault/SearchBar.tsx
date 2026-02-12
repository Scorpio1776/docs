'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const vaultTypes = [
  { value: '', label: 'All Types' },
  { value: 'report', label: 'Reports' },
  { value: 'summary', label: 'Summaries' },
  { value: 'analysis', label: 'Analyses' },
  { value: 'brief', label: 'Briefs' },
  { value: 'data', label: 'Data' },
  { value: 'template', label: 'Templates' },
  { value: 'other', label: 'Other' },
];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
}

export default function SearchBar({ value, onChange, typeFilter, onTypeFilterChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (() => {
      let timeout: ReturnType<typeof setTimeout>;
      return (val: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          onChange(val);
        }, 300);
      };
    })(),
    [onChange]
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLocalValue(val);
    debouncedOnChange(val);
  }

  const selectedTypeLabel = vaultTypes.find((t) => t.value === (typeFilter ?? ''))?.label ?? 'All Types';

  return (
    <div className="flex items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder="Search vault entries..."
          className="w-full pl-10 pr-4 py-2.5 text-sm text-white bg-gray-900 border border-gray-800 rounded-lg placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
        />
      </div>

      {/* Type filter dropdown */}
      {onTypeFilterChange && (
        <div className="relative">
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors min-w-[140px]"
          >
            <span>{selectedTypeLabel}</span>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
          </button>

          {showTypeDropdown && (
            <div className="absolute right-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 py-1">
              {vaultTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    onTypeFilterChange(type.value);
                    setShowTypeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    typeFilter === type.value
                      ? 'text-claw-primary bg-claw-primary/10'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
