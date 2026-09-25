import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Star, Download, Share2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Language, TranslationResult } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { TARGET_LANGUAGES } from '../constants/languages';
import { speakText } from '../services/speech';

interface TranslationOutputPanelProps {
  targetLang: Language;
  onSelectTargetLang: (lang: Language) => void;
  result: TranslationResult | null;
  isLoading: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelectAlternative: (text: string) => void;
  onRetry: () => void;
  onTriggerToast: (message: string, type: 'success' | 'info' | 'warning' | 'error', subtext?: string) => void;
}

export const TranslationOutputPanel: React.FC<TranslationOutputPanelProps> = ({
  targetLang,
  onSelectTargetLang,
  result,
  isLoading,
  isFavorite,
  onToggleFavorite,
  onSelectAlternative,
  onRetry,
  onTriggerToast,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const stopAudioRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (stopAudioRef.current) stopAudioRef.current();
    };
  }, []);

  const translatedText = result?.translatedText || '';

  // Listen / TTS for output text
  const handleListenOutput = () => {
    if (isPlayingAudio) {
      if (stopAudioRef.current) stopAudioRef.current();
      setIsPlayingAudio(false);
      return;
    }

    if (!translatedText.trim()) return;

    setIsPlayingAudio(true);
    stopAudioRef.current = speakText(
      translatedText,
      targetLang.speechCode,
      undefined,
      () => setIsPlayingAudio(false),
      (err) => {
        onTriggerToast('Speech audio unavailable for this language', 'warning', err);
        setIsPlayingAudio(false);
      }
    );
  };

  // Copy translated text
  const handleCopyOutput = async () => {
    if (!translatedText.trim()) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setIsCopied(true);
      onTriggerToast('Translation copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onTriggerToast('Failed to copy to clipboard', 'error');
    }
  };

  // Download translation as .txt
  const handleDownload = () => {
    if (!translatedText.trim()) return;
    const content = `Target Language: ${targetLang.name}\nTimestamp: ${new Date().toLocaleString()}\n\nTranslation:\n${translatedText}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${targetLang.code}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onTriggerToast('Translation exported as text file', 'success');
  };

  // Share translation
  const handleShare = async () => {
    if (!translatedText.trim()) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `LinguaSwift Translation (${targetLang.name})`,
          text: translatedText,
        });
        onTriggerToast('Translation shared successfully', 'success');
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleFallbackShare();
        }
      }
    } else {
      handleFallbackShare();
    }
  };

  const handleFallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      onTriggerToast('Share link copied to clipboard', 'info');
    } catch {
      onTriggerToast('Sharing failed', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 transition-colors">
      
      {/* Top Bar: Target Language Selector */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Target:
          </span>
          <LanguageSelector
            label="Target language"
            selectedLanguage={targetLang}
            languages={TARGET_LANGUAGES}
            onSelectLanguage={onSelectTargetLang}
          />
        </div>

        {/* Favorite toggle in header */}
        {translatedText && !isLoading && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remove favorite" : "Bookmark this translation"}
            title={isFavorite ? "Remove favorite" : "Bookmark this translation"}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isFavorite
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        )}
      </div>

      {/* Auto-detected Source Banner */}
      {result?.detectedSourceLang && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-teal-50/80 px-3 py-1.5 text-xs text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/40">
          <span className="font-medium">
            Detected Source: {result.detectedLangName || result.detectedSourceLang}
          </span>
          {result.confidence && (
            <span className="text-[11px] opacity-80 tabular-nums">
              {result.confidence}% accuracy match
            </span>
          )}
        </div>
      )}

      {/* Text Output Area */}
      <div className="relative flex-1 py-3 flex flex-col justify-start">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-3">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin dark:text-teal-400" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Translating into {targetLang.name}...
            </span>
          </div>
        ) : result?.error ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center px-4">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{result.error}</p>
            <button
              onClick={onRetry}
              className="mt-3 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Retry Translation
            </button>
          </div>
        ) : translatedText ? (
          <div className="min-h-48 sm:min-h-64 flex-1">
            <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed font-normal select-text">
              {translatedText}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center text-slate-400">
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Translation will appear here automatically
            </p>
            <p className="text-xs text-slate-400/80 dark:text-slate-600 mt-1 max-w-xs">
              Type or speak any language on the left to instantly see it translated into {targetLang.name}.
            </p>
          </div>
        )}
      </div>

      {/* Alternative Suggestions Chips (from API matches) */}
      {!isLoading && result?.alternatives && result.alternatives.length > 0 && (
        <div className="pb-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <Sparkles className="h-3 w-3 text-teal-500" />
            <span className="font-medium">Alternative translations:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.alternatives.map((alt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectAlternative(alt)}
                title="Click to use this translation"
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-400 transition-colors"
              >
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Toolbar: Output Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1">
          {/* Text-to-Speech (Listen) */}
          <button
            type="button"
            onClick={handleListenOutput}
            disabled={!translatedText || isLoading}
            title={isPlayingAudio ? 'Stop playback' : 'Listen to translation'}
            aria-label={isPlayingAudio ? 'Stop speech playback' : 'Listen to translation'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            {isPlayingAudio ? (
              <VolumeX className="h-4 w-4 text-teal-600 dark:text-teal-400 animate-pulse" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          {/* Copy to Clipboard */}
          <button
            type="button"
            onClick={handleCopyOutput}
            disabled={!translatedText || isLoading}
            title="Copy translation (Ctrl+Shift+C)"
            aria-label="Copy translation to clipboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>

          {/* Download as .txt */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!translatedText || isLoading}
            title="Download translation as .txt file"
            aria-label="Download translation as text file"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            disabled={!translatedText || isLoading}
            title="Share translation"
            aria-label="Share translation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Translation Engine Info */}
        <div className="text-xs text-slate-400 dark:text-slate-500">
          {result?.provider && (
            <span>Engine: {result.provider}</span>
          )}
        </div>
      </div>
    </div>
  );
};
