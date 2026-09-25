export interface Language {
  code: string; // e.g. 'en', 'es', 'fr', 'auto'
  name: string; // e.g. 'Spanish'
  nativeName: string; // e.g. 'Español'
  flag: string; // emoji flag e.g. '🇪🇸'
  speechCode: string; // BCP 47 code e.g. 'es-ES'
}

export interface TranslationMatch {
  translation: string;
  quality?: number; // e.g. 70 - 100
  source?: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLang?: string;
  detectedLangName?: string;
  confidence?: number; // 0 - 100
  alternatives: string[];
  provider: 'MyMemory' | 'Local Engine' | 'Fallback';
  error?: string;
}

export interface HistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  sourceLangName: string;
  targetLang: string;
  targetLangName: string;
  detectedSourceLang?: string;
  timestamp: number;
  isFavorite: boolean;
  confidence?: number;
  alternatives?: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  subtext?: string;
}

export interface LanguagePair {
  source: string;
  target: string;
  label: string;
}
