import { Language } from '../types';

export const AUTO_DETECT_LANG: Language = {
  code: 'auto',
  name: 'Auto-Detect',
  nativeName: 'Detect Language',
  flag: '🌐',
  speechCode: 'en-US',
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', speechCode: 'pt-PT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', speechCode: 'el-GR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', speechCode: 'cs-CZ' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', speechCode: 'fi-FI' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', speechCode: 'no-NO' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', speechCode: 'ro-RO' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', speechCode: 'he-IL' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭', speechCode: 'tl-PH' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', speechCode: 'ur-PK' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', speechCode: 'fa-IR' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', speechCode: 'ms-MY' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', speechCode: 'hu-HU' },
];

export const SOURCE_LANGUAGES: Language[] = [
  AUTO_DETECT_LANG,
  ...SUPPORTED_LANGUAGES,
];

export const TARGET_LANGUAGES: Language[] = [
  ...SUPPORTED_LANGUAGES,
];

export const SAMPLE_PHRASES = [
  { text: "Where is the nearest train station?", category: "Travel", lang: "en" },
  { text: "Could you please bring us the menu and the bill?", category: "Dining", lang: "en" },
  { text: "Nice to meet you, looking forward to working together.", category: "Business", lang: "en" },
  { text: "Hello! How are you doing today?", category: "Greetings", lang: "en" },
  { text: "Bonjour! Pouvez-vous m'indiquer le chemin du musée?", category: "French", lang: "fr" },
  { text: "¿A qué hora sale el próximo vuelo hacia Madrid?", category: "Spanish", lang: "es" },
  { text: "Guten Tag, ich möchte ein Zimmer für zwei Nächte reservieren.", category: "German", lang: "de" },
  { text: "初めまして、よろしくお願いします。", category: "Japanese", lang: "ja" },
];

export const POPULAR_LANGUAGE_PAIRS = [
  { source: 'en', target: 'es', label: 'English → Spanish' },
  { source: 'en', target: 'fr', label: 'English → French' },
  { source: 'en', target: 'de', label: 'English → German' },
  { source: 'es', target: 'en', label: 'Spanish → English' },
  { source: 'en', target: 'ja', label: 'English → Japanese' },
  { source: 'en', target: 'zh', label: 'English → Chinese' },
];

export function getLanguageByCode(code: string): Language {
  if (code === 'auto') return AUTO_DETECT_LANG;
  const found = SUPPORTED_LANGUAGES.find(l => l.code === code || l.code.startsWith(code) || code.startsWith(l.code));
  return found || {
    code,
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
    flag: '🌐',
    speechCode: code,
  };
}
