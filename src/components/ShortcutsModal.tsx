import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter', description: 'Trigger immediate translation' },
    { key: 'Alt + S  /  Ctrl + Shift + X', description: 'Swap source and target languages & text' },
    { key: 'Ctrl + Shift + C', description: 'Copy translated output to clipboard' },
    { key: 'Ctrl + Shift + V', description: 'Toggle voice speech-to-text recording' },
    { key: 'Escape', description: 'Clear source text / close overlays' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h2 id="shortcuts-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-none"
            >
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </span>
              <kbd className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
