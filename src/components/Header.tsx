import React from 'react';
import { Moon, Sun, History, Star, Keyboard, Globe2, WifiOff } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenFavorites: () => void;
  onOpenShortcuts: () => void;
  historyCount: number;
  favoritesCount: number;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenHistory,
  onOpenFavorites,
  onOpenShortcuts,
  historyCount,
  favoritesCount,
  isOffline,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm dark:bg-teal-500">
            <Globe2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            LinguaSwift
          </span>
        </div>

        {/* Zone 2: Navigation Links / Views */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="View translation history"
          >
            <History className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenFavorites}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="View starred favorites"
          >
            <Star className="h-4 w-4 text-amber-500 fill-amber-500/20" />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 tabular-nums">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden md:inline">Shortcuts</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Offline indicator & Theme switch) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isOffline && (
            <div className="flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline Mode</span>
            </div>
          )}

          <button
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
