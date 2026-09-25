// Speech-to-Text and Text-to-Speech Web API Utilities

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Reads aloud the given text in the requested language using Web Speech API.
 * Returns a cancel function to stop playback.
 */
export function speakText(
  text: string,
  speechCode: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: string) => void
): () => void {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Text-to-speech is not supported in this browser.');
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text.trim()) {
    onEnd?.();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechCode;
  utterance.rate = 0.95; // Slightly slower for crisp clarity
  utterance.pitch = 1.0;

  // Try to find matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith(speechCode.toLowerCase().slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    if (e.error !== 'canceled') {
      onError?.(e.error || 'Failed to play speech audio.');
    }
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    onEnd?.();
  };
}

export interface VoiceRecognitionController {
  start: () => void;
  stop: () => void;
}

/**
 * Initializes a SpeechRecognition instance for speech-to-text input.
 */
export function createSpeechRecognizer(
  speechCode: string,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (errorMessage: string) => void,
  onEnd: () => void
): VoiceRecognitionController | null {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

  try {
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechCode;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (final) {
        onResult(final.trim(), true);
      } else if (interim) {
        onResult(interim.trim(), false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        onError('Microphone access was denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        // quiet timeout, no action required
      } else {
        onError(`Voice recognition notice: ${event.error}`);
      }
      onEnd();
    };

    recognition.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e: unknown) {
          console.warn('SpeechRecognition start error:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e: unknown) {
          console.warn('SpeechRecognition stop error:', e);
        }
      },
    };
  } catch (err: unknown) {
    onError('Failed to initialize speech recognition.');
    return null;
  }
}
