import React, { useState } from 'react';
import { X, Search, Trash2, Star, ArrowRight, Copy, Check, Download, History as HistoryIcon } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'history' | 'favorites';
  onChangeTab: (tab: 'history' | 'favorites') => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  onCopyText: (text: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  history,
  onSelectHistoryItem,
  onToggleFavorite,
  onDeleteItem,
  onClearHistory,
  onCopyText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items based on active tab and search query
  const displayedItems = history.filter((item) => {
    if (activeTab === 'favorites' && !item.isFavorite) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      item.sourceText.toLowerCase().includes(query) ||
      item.translatedText.toLowerCase().includes(query) ||
      item.sourceLangName.toLowerCase().includes(query) ||
      item.targetLangName.toLowerCase().includes(query)
    );
  });

  const handleCopy = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyText(item.translatedText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleExport = () => {
    const dataToExport = displayedItems.map(item => ({
      source: item.sourceText,
      translation: item.translatedText,
      from: item.sourceLangName,
      to: item.targetLangName,
      date: new Date(item.timestamp).toISOString()
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguaswift-${activeTab}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Translations
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4 p-1 bg-slate-100 rounded-lg dark:bg-slate-800">
              <button
                onClick={() => onChangeTab('history')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                History ({history.length})
              </button>
              <button
                onClick={() => onChangeTab('favorites')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Favorites ({history.filter(h => h.isFavorite).length})
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phrases or languages..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                {activeTab === 'favorites' ? (
                  <>
                    <Star className="h-8 w-8 stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-medium">No saved favorites yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click the star icon on any translation to save it here.
                    </p>
                  </>
                ) : (
                  <>
                    <HistoryIcon className="h-8 w-8 stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-medium">No translation history</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Your translated phrases will automatically appear here.
                    </p>
                  </>
                )}
              </div>
            ) : (
              displayedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-teal-400 hover:shadow-xs dark:border-slate-800 dark:bg-slate-850 dark:hover:border-teal-600 cursor-pointer transition-all"
                >
                  {/* Language pair and timestamp */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{item.sourceLangName}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{item.targetLangName}</span>
                    </div>
                    <span className="text-[11px] tabular-nums">{formatTimestamp(item.timestamp)}</span>
                  </div>

                  {/* Text snippets */}
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.sourceText}
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                      {item.translatedText}
                    </p>
                  </div>

                  {/* Actions bar */}
                  <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item, e)}
                      title="Copy translation"
                      className="rounded p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-teal-400"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => onToggleFavorite(item.id, e)}
                      title={item.isFavorite ? "Remove favorite" : "Save to favorites"}
                      className="rounded p-1 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          item.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => onDeleteItem(item.id, e)}
                      title="Delete record"
                      className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {displayedItems.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>

              {activeTab === 'history' && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
