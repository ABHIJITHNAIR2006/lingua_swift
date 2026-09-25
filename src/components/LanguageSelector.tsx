import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
  label: string;
  selectedLanguage: Language;
  languages: Language[];
  onSelectLanguage: (language: Language) => void;
  detectedLangName?: string;
  confidence?: number;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selectedLanguage,
  languages,
  onSelectLanguage,
  detectedLangName,
  confidence,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter languages by query
  const filteredLanguages = languages.filter((lang) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  });

  const handleSelect = (lang: Language) => {
    onSelectLanguage(lang);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedLanguage.name}`}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-750 transition-colors"
      >
        <span className="text-base select-none">{selectedLanguage.flag}</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
          {selectedLanguage.name}
        </span>

        {selectedLanguage.code === 'auto' && detectedLangName && (
          <span className="hidden sm:inline-flex items-center text-xs text-teal-600 dark:text-teal-400 font-normal">
            ({detectedLangName}{confidence ? ` · ${confidence}%` : ''})
          </span>
        )}

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="border-b border-slate-100 p-2.5 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto p-1 text-sm" role="listbox">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No matching languages found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === selectedLanguage.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(lang)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-semibold dark:bg-teal-950/50 dark:text-teal-200'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base select-none">{lang.flag}</span>
                      <div className="flex flex-col truncate">
                        <span className="truncate">{lang.name}</span>
                        {lang.code !== 'auto' && (
                          <span className="text-[11px] text-slate-400 font-normal dark:text-slate-500">
                            {lang.nativeName}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
