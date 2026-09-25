import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Copy, Check, Clipboard, X, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { SOURCE_LANGUAGES, SAMPLE_PHRASES } from '../constants/languages';
import { isSpeechRecognitionSupported, createSpeechRecognizer, speakText } from '../services/speech';

interface TranslationInputPanelProps {
  sourceText: string;
  onChangeSourceText: (text: string) => void;
  sourceLang: Language;
  onSelectSourceLang: (lang: Language) => void;
  detectedLangName?: string;
  detectedConfidence?: number;
  onClear: () => void;
  onTriggerToast: (message: string, type: 'success' | 'info' | 'warning' | 'error', subtext?: string) => void;
}

const MAX_CHARS = 5000;

export const TranslationInputPanel: React.FC<TranslationInputPanelProps> = ({
  sourceText,
  onChangeSourceText,
  sourceLang,
  onSelectSourceLang,
  detectedLangName,
  detectedConfidence,
  onClear,
  onTriggerToast,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Compute word count and reading time estimate
  const trimmed = sourceText.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const readingTimeMin = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  // Cleanup speech audio on unmount
  useEffect(() => {
    return () => {
      if (stopAudioRef.current) stopAudioRef.current();
      if (recognizerRef.current) recognizerRef.current.stop();
    };
  }, []);

  // Voice Input toggle
  const toggleSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      onTriggerToast('Voice input is not supported in this browser.', 'warning', 'Try using Google Chrome or Microsoft Edge.');
      return;
    }

    if (isRecording) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsRecording(false);
      onTriggerToast('Voice recording stopped', 'info');
      return;
    }

    const targetSpeechLang = sourceLang.code === 'auto' ? 'en-US' : sourceLang.speechCode;
    const recognizer = createSpeechRecognizer(
      targetSpeechLang,
      (transcript, isFinal) => {
        if (isFinal) {
          onChangeSourceText(sourceText ? `${sourceText.trim()} ${transcript}` : transcript);
        }
      },
      (error) => {
        onTriggerToast(error, 'error');
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
      setIsRecording(true);
      onTriggerToast('Listening... Speak into your microphone', 'info', `Target speech locale: ${targetSpeechLang}`);
    }
  };

  // Listen / TTS for source text
  const handleListenSource = () => {
    if (isPlayingAudio) {
      if (stopAudioRef.current) stopAudioRef.current();
      setIsPlayingAudio(false);
      return;
    }

    if (!sourceText.trim()) return;

    const speechCode = sourceLang.code === 'auto' ? 'en-US' : sourceLang.speechCode;
    setIsPlayingAudio(true);
    stopAudioRef.current = speakText(
      sourceText,
      speechCode,
      undefined,
      () => setIsPlayingAudio(false),
      (err) => {
        onTriggerToast('Speech synthesis unavailable for this language', 'warning', err);
        setIsPlayingAudio(false);
      }
    );
  };

  // Copy source text
  const handleCopySource = async () => {
    if (!sourceText.trim()) return;
    try {
      await navigator.clipboard.writeText(sourceText);
      setIsCopied(true);
      onTriggerToast('Source text copied to clipboard', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onTriggerToast('Failed to copy to clipboard', 'error');
    }
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeSourceText(text.slice(0, MAX_CHARS));
        onTriggerToast('Text pasted from clipboard', 'info');
      }
    } catch {
      onTriggerToast('Unable to read clipboard', 'warning', 'Please paste manually using Ctrl+V');
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
      
      {/* Top Bar: Language Selector & Status */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Source:
          </span>
          <LanguageSelector
            label="Source language"
            selectedLanguage={sourceLang}
            languages={SOURCE_LANGUAGES}
            onSelectLanguage={onSelectSourceLang}
            detectedLangName={detectedLangName}
            confidence={detectedConfidence}
          />
        </div>

        {sourceText.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Clear text (Esc)"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Text Area */}
      <div className="relative flex-1 py-3">
        <textarea
          ref={textareaRef}
          value={sourceText}
          onChange={(e) => onChangeSourceText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Enter or paste text to translate, or click the microphone to speak..."
          className="w-full h-48 sm:h-64 resize-none bg-transparent text-base sm:text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 leading-relaxed font-normal"
          maxLength={MAX_CHARS}
          aria-label="Source text to translate"
        />

        {/* Live speech recording pulse banner */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 animate-pulse dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
            <span>Listening...</span>
          </div>
        )}
      </div>

      {/* Sample Phrase Chips */}
      {sourceText.length === 0 && (
        <div className="pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
            <span>Try sample phrases:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PHRASES.slice(0, 4).map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChangeSourceText(phrase.text)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-300 transition-colors text-left"
              >
                {phrase.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Toolbar: Controls & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Voice Input (Speech Recognition) */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isRecording ? 'Stop voice recording' : 'Speak to input text (Ctrl+Shift+V)'}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
              isRecording
                ? 'bg-rose-600 text-white shadow-xs hover:bg-rose-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
            <span className="hidden sm:inline">{isRecording ? 'Stop Mic' : 'Voice Input'}</span>
          </button>

          {/* Text-to-Speech (Listen) */}
          <button
            type="button"
            onClick={handleListenSource}
            disabled={!sourceText.trim()}
            title={isPlayingAudio ? 'Stop audio' : 'Listen to source text'}
            aria-label={isPlayingAudio ? 'Stop speech playback' : 'Listen to source text'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            {isPlayingAudio ? (
              <VolumeX className="h-4 w-4 text-teal-600 dark:text-teal-400 animate-pulse" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          {/* Paste from Clipboard */}
          <button
            type="button"
            onClick={handlePaste}
            title="Paste text from clipboard"
            aria-label="Paste text from clipboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <Clipboard className="h-4 w-4" />
          </button>

          {/* Copy Source */}
          <button
            type="button"
            onClick={handleCopySource}
            disabled={!sourceText.trim()}
            title="Copy source text"
            aria-label="Copy source text to clipboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Right Stats & Character Counter */}
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          {wordCount > 0 && (
            <span className="hidden sm:inline">
              {wordCount} words · ~{readingTimeMin} min read
            </span>
          )}
          <span className={`${sourceText.length >= MAX_CHARS ? 'text-rose-500 font-bold' : ''}`}>
            {sourceText.length} / {MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
};
