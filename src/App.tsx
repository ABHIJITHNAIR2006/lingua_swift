import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeftRight, Sparkles, WifiOff, History, Star } from 'lucide-react';
import { Language, TranslationResult, HistoryItem, ToastMessage } from './types';
import { AUTO_DETECT_LANG, SUPPORTED_LANGUAGES, getLanguageByCode, POPULAR_LANGUAGE_PAIRS } from './constants/languages';
import { translateText } from './services/translator';
import { Header } from './components/Header';
import { TranslationInputPanel } from './components/TranslationInputPanel';
import { TranslationOutputPanel } from './components/TranslationOutputPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ToastContainer } from './components/Toast';

const STORAGE_KEYS = {
  THEME: 'linguaswift_theme',
  HISTORY: 'linguaswift_history',
  SOURCE_LANG: 'linguaswift_source_lang',
  TARGET_LANG: 'linguaswift_target_lang',
  AUTO_TRANSLATE: 'linguaswift_auto_translate',
  RECENT_PAIRS: 'linguaswift_recent_pairs',
};

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class and attributes to DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Languages state
  const [sourceLang, setSourceLang] = useState<Language>(() => {
    const savedCode = localStorage.getItem(STORAGE_KEYS.SOURCE_LANG);
    return savedCode ? getLanguageByCode(savedCode) : AUTO_DETECT_LANG;
  });

  const [targetLang, setTargetLang] = useState<Language>(() => {
    const savedCode = localStorage.getItem(STORAGE_KEYS.TARGET_LANG);
    return savedCode ? getLanguageByCode(savedCode) : getLanguageByCode('es');
  });

  // Text and Translation State
  const [sourceText, setSourceText] = useState<string>('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_TRANSLATE);
    return saved !== null ? saved === 'true' : true;
  });

  // History and Favorites State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Drawer / Modal States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'history' | 'favorites'>('history');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Debounce timer reference
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestRef = useRef<number>(0);

  // Online / Offline status listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Back online', 'success', 'Connected to live translation services');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('You are currently offline', 'warning', 'Offline fallback engine will handle translations');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOURCE_LANG, sourceLang.code);
  }, [sourceLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGET_LANG, targetLang.code);
  }, [targetLang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_TRANSLATE, String(autoTranslateEnabled));
  }, [autoTranslateEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Toast Helper
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info', subtext?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, subtext }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Core Translation Trigger
  const executeTranslation = useCallback(async (
    textToTranslate: string,
    src: Language,
    tgt: Language
  ) => {
    const trimmed = textToTranslate.trim();
    if (!trimmed) {
      setTranslationResult(null);
      setIsLoading(false);
      return;
    }

    const requestId = Date.now();
    latestRequestRef.current = requestId;
    setIsLoading(true);

    try {
      const result = await translateText(trimmed, src.code, tgt.code);

      // Verify this is still the latest requested translation
      if (latestRequestRef.current === requestId) {
        setTranslationResult(result);
        setIsLoading(false);

        // Add to history if text has substantial content and not an exact duplicate of last entry
        if (result.translatedText && trimmed.length >= 2) {
          const actualSourceCode = result.detectedSourceLang || src.code;
          const actualSourceName = result.detectedLangName || src.name;

          setHistory((prev) => {
            // Avoid duplicate if consecutive
            if (prev.length > 0 && prev[0].sourceText === trimmed && prev[0].targetLang === tgt.code) {
              return prev;
            }

            const newItem: HistoryItem = {
              id: Date.now().toString(),
              sourceText: trimmed,
              translatedText: result.translatedText,
              sourceLang: actualSourceCode,
              sourceLangName: actualSourceName,
              targetLang: tgt.code,
              targetLangName: tgt.name,
              detectedSourceLang: result.detectedSourceLang,
              timestamp: Date.now(),
              isFavorite: false,
              confidence: result.confidence,
              alternatives: result.alternatives,
            };

            // Keep max 20 history items
            return [newItem, ...prev.slice(0, 19)];
          });
        }
      }
    } catch (err: unknown) {
      if (latestRequestRef.current === requestId) {
        setTranslationResult({
          translatedText: '',
          alternatives: [],
          provider: 'Fallback',
          error: 'Translation temporarily unavailable. Please try again.',
        });
        setIsLoading(false);
      }
    }
  }, []);

  // Debounced auto-translate on source text changes
  useEffect(() => {
    if (!autoTranslateEnabled) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!sourceText.trim()) {
      setTranslationResult(null);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeTranslation(sourceText, sourceLang, targetLang);
    }, 700);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang, autoTranslateEnabled, executeTranslation]);

  // Swap Languages and Text Function
  const handleSwap = () => {
    // If source is auto, determine the actual detected language or target
    let newSource: Language;
    if (sourceLang.code === 'auto') {
      if (translationResult?.detectedSourceLang) {
        newSource = getLanguageByCode(translationResult.detectedSourceLang);
      } else {
        newSource = getLanguageByCode('en');
      }
    } else {
      newSource = targetLang;
    }

    const newTarget = sourceLang.code === 'auto' ? getLanguageByCode('en') : sourceLang;
    const currentTranslated = translationResult?.translatedText || '';

    // Swap text and language states
    setSourceLang(newSource);
    setTargetLang(newTarget);

    if (currentTranslated) {
      setSourceText(currentTranslated);
      executeTranslation(currentTranslated, newSource, newTarget);
    } else if (sourceText) {
      executeTranslation(sourceText, newSource, newTarget);
    }

    showToast(`Swapped to ${newSource.name} → ${newTarget.name}`, 'info');
  };

  // Select Quick Pair
  const handleSelectPair = (pair: { source: string; target: string }) => {
    const src = getLanguageByCode(pair.source);
    const tgt = getLanguageByCode(pair.target);
    setSourceLang(src);
    setTargetLang(tgt);

    if (sourceText.trim()) {
      executeTranslation(sourceText, src, tgt);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to trigger immediate translation
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeTranslation(sourceText, sourceLang, targetLang);
      }

      // Alt + S or Ctrl+Shift+X to swap languages
      if ((e.altKey && (e.key === 's' || e.key === 'S')) || (e.ctrlKey && e.shiftKey && (e.key === 'x' || e.key === 'X'))) {
        e.preventDefault();
        handleSwap();
      }

      // Ctrl + Shift + C to copy output
      if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        if (translationResult?.translatedText) {
          e.preventDefault();
          navigator.clipboard.writeText(translationResult.translatedText);
          showToast('Translation copied to clipboard!', 'success');
        }
      }

      // Escape to close modals or clear if none open
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
        } else if (isHistoryOpen) {
          setIsHistoryOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeTranslation, handleSwap, isHistoryOpen, isShortcutsOpen, showToast, sourceLang, sourceText, targetLang, translationResult]);

  // Current translation favorite state
  const isCurrentFavorite = Boolean(
    translationResult?.translatedText &&
    history.some(
      (h) =>
        h.isFavorite &&
        h.sourceText === sourceText.trim() &&
        h.targetLang === targetLang.code
    )
  );

  const handleToggleCurrentFavorite = () => {
    if (!translationResult?.translatedText || !sourceText.trim()) return;

    setHistory((prev) => {
      const matchIndex = prev.findIndex(
        (h) => h.sourceText === sourceText.trim() && h.targetLang === targetLang.code
      );

      if (matchIndex >= 0) {
        const updated = [...prev];
        const newFavState = !updated[matchIndex].isFavorite;
        updated[matchIndex] = { ...updated[matchIndex], isFavorite: newFavState };
        showToast(
          newFavState ? 'Saved to Favorites' : 'Removed from Favorites',
          newFavState ? 'success' : 'info'
        );
        return updated;
      } else {
        // Add new record as favorite
        const actualSource = translationResult.detectedSourceLang || sourceLang.code;
        const newFav: HistoryItem = {
          id: Date.now().toString(),
          sourceText: sourceText.trim(),
          translatedText: translationResult.translatedText,
          sourceLang: actualSource,
          sourceLangName: translationResult.detectedLangName || sourceLang.name,
          targetLang: targetLang.code,
          targetLangName: targetLang.name,
          detectedSourceLang: translationResult.detectedSourceLang,
          timestamp: Date.now(),
          isFavorite: true,
          confidence: translationResult.confidence,
          alternatives: translationResult.alternatives,
        };
        showToast('Saved to Favorites', 'success');
        return [newFav, ...prev.slice(0, 19)];
      }
    });
  };

  const handleToggleItemFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Record deleted', 'info');
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all translation history? Starred favorites will be preserved.')) {
      setHistory((prev) => prev.filter((item) => item.isFavorite));
      showToast('History cleared', 'info');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSourceLang(getLanguageByCode(item.sourceLang));
    setTargetLang(getLanguageByCode(item.targetLang));
    setSourceText(item.sourceText);
    setTranslationResult({
      translatedText: item.translatedText,
      detectedSourceLang: item.detectedSourceLang,
      confidence: item.confidence,
      alternatives: item.alternatives || [],
      provider: 'Local Engine',
    });
    showToast('Loaded translation from history', 'info');
  };

  const handleSelectAlternative = (altText: string) => {
    if (translationResult) {
      setTranslationResult({
        ...translationResult,
        translatedText: altText,
      });
      showToast('Applied alternative translation', 'info');
    }
  };

  const handleClearAll = () => {
    setSourceText('');
    setTranslationResult(null);
  };

  const favoritesCount = history.filter((h) => h.isFavorite).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      
      {/* Header adhering to Top Bar Contract */}
      <Header
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => {
          setHistoryTab('history');
          setIsHistoryOpen(true);
        }}
        onOpenFavorites={() => {
          setHistoryTab('favorites');
          setIsHistoryOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        historyCount={history.length}
        favoritesCount={favoritesCount}
        isOffline={isOffline}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Quick Language Pair Chips */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Popular Pairs:
            </span>
            {POPULAR_LANGUAGE_PAIRS.map((pair, idx) => {
              const isActive = sourceLang.code === pair.source && targetLang.code === pair.target;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPair(pair)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {pair.label}
                </button>
              );
            })}
          </div>

          {/* Auto-translate Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoTranslateEnabled}
                onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-offset-slate-900"
              />
              <span>Auto-translate on pause</span>
            </label>
          </div>
        </div>

        {/* Translation Workstation Grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          
          {/* Source Input Panel */}
          <TranslationInputPanel
            sourceText={sourceText}
            onChangeSourceText={setSourceText}
            sourceLang={sourceLang}
            onSelectSourceLang={(lang) => {
              setSourceLang(lang);
              if (sourceText.trim()) executeTranslation(sourceText, lang, targetLang);
            }}
            detectedLangName={translationResult?.detectedLangName}
            detectedConfidence={translationResult?.confidence}
            onClear={handleClearAll}
            onTriggerToast={showToast}
          />

          {/* Swap Language Button between panels */}
          <div className="flex items-center justify-center my-1 lg:my-0 lg:absolute lg:left-1/2 lg:top-5 lg:-translate-x-1/2 lg:z-10">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap languages & text (Alt+S)"
              aria-label="Swap source and target languages"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-teal-500 hover:text-teal-600 hover:scale-105 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300 transition-all"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* Target Output Panel */}
          <TranslationOutputPanel
            targetLang={targetLang}
            onSelectTargetLang={(lang) => {
              setTargetLang(lang);
              if (sourceText.trim()) executeTranslation(sourceText, sourceLang, lang);
            }}
            result={translationResult}
            isLoading={isLoading}
            isFavorite={isCurrentFavorite}
            onToggleFavorite={handleToggleCurrentFavorite}
            onSelectAlternative={handleSelectAlternative}
            onRetry={() => executeTranslation(sourceText, sourceLang, targetLang)}
            onTriggerToast={showToast}
          />
        </div>

        {/* Action Row below Translation Panels */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Tip: Press <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">Ctrl + Enter</kbd> to translate instantly</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => executeTranslation(sourceText, sourceLang, targetLang)}
              disabled={isLoading || !sourceText.trim()}
              title="Translate now (Ctrl+Enter)"
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-teal-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95 dark:bg-teal-500 dark:hover:bg-teal-400 transition-all whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              <span>Translate</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-teal-700 px-1.5 py-0.5 rounded text-teal-100 font-mono">
                Ctrl+↵
              </kbd>
            </button>
          </div>
        </div>

        {/* Quiet Footer Note with Engine & Capabilities */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">LinguaSwift</span>
            <span aria-hidden="true">·</span>
            <span>Accurate Multi-Language Translation Engine</span>
            <span aria-hidden="true">·</span>
            <span>Web Speech API Speech-to-Text & Synthesis</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-2"
            >
              Shortcuts
            </button>
            <button
              onClick={() => {
                setHistoryTab('history');
                setIsHistoryOpen(true);
              }}
              className="hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-2"
            >
              History ({history.length})
            </button>
            <button
              onClick={() => {
                setHistoryTab('favorites');
                setIsHistoryOpen(true);
              }}
              className="hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-2"
            >
              Saved ({favoritesCount})
            </button>
          </div>
        </footer>
      </main>

      {/* History & Favorites Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeTab={historyTab}
        onChangeTab={setHistoryTab}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onToggleFavorite={handleToggleItemFavorite}
        onDeleteItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onCopyText={(text) => {
          navigator.clipboard.writeText(text);
          showToast('Copied to clipboard', 'success');
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
