/**
 * Unified Text-to-Speech Service
 * Supports both Piper TTS (free, open-source) and Web Speech API (browser fallback)
 */

import axios from 'axios';

export type TTSProvider = 'piper' | 'webspeech';

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  provider: TTSProvider;
}

export interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
  provider?: TTSProvider;
}

export interface TTSResponse {
  audioUrl?: string;
  audioBase64?: string;
  provider: TTSProvider;
  success: boolean;
  error?: string;
}

/**
 * Available Piper voices (free, open-source)
 * These are high-quality neural voices with diverse characteristics
 */
const PIPER_VOICES: TTSVoice[] = [
  // US English - Female Voices
  { id: 'en_US-amy-medium', name: 'Amy (US, Female, Warm)', language: 'en-US', provider: 'piper' },
  { id: 'en_US-libritts-high', name: 'LibriTTS (US, Female, Clear)', language: 'en-US', provider: 'piper' },
  { id: 'en_US-glow-tts', name: 'Glow TTS (US, Female, Natural)', language: 'en-US', provider: 'piper' },
  
  // UK English - Diverse Voices
  { id: 'en_GB-alba-medium', name: 'Alba (UK, Female, Formal)', language: 'en-GB', provider: 'piper' },
  { id: 'en_GB-jenny-medium', name: 'Jenny (UK, Female, Friendly)', language: 'en-GB', provider: 'piper' },
  { id: 'en_GB-alan-medium', name: 'Alan (UK, Male, Deep)', language: 'en-GB', provider: 'piper' },
  { id: 'en_GB-thomas-medium', name: 'Thomas (UK, Male, Calm)', language: 'en-GB', provider: 'piper' },
  
  // US English - Male Voices
  { id: 'en_US-joe-medium', name: 'Joe (US, Male, Energetic)', language: 'en-US', provider: 'piper' },
  { id: 'en_US-ryan-medium', name: 'Ryan (US, Male, Smooth)', language: 'en-US', provider: 'piper' },
  { id: 'en_US-lessac-medium', name: 'Lessac (US, Male, Professional)', language: 'en-US', provider: 'piper' },
];

/**
 * Web Speech API voices (browser-native)
 */
const WEBSPEECH_VOICES: TTSVoice[] = [
  { id: 'default', name: 'Default', language: 'en-US', provider: 'webspeech' },
  { id: 'google-us-english', name: 'Google US English', language: 'en-US', provider: 'webspeech' },
  { id: 'google-uk-english', name: 'Google UK English', language: 'en-GB', provider: 'webspeech' },
];

/**
 * Get all available voices
 */
export function getAvailableVoices(): TTSVoice[] {
  return [...PIPER_VOICES, ...WEBSPEECH_VOICES];
}

/**
 * Synthesize speech using Piper TTS
 * Piper is free, open-source, and runs locally or on a free hosted instance
 */
export async function synthesizeWithPiper(options: TTSOptions): Promise<TTSResponse> {
  try {
    const piperEndpoint = process.env.PIPER_TTS_ENDPOINT || 'http://localhost:8000';
    const voiceId = options.voice || 'en_US-amy-medium';

    // Call Piper TTS API
    const response = await axios.post(
      `${piperEndpoint}/api/tts`,
      {
        text: options.text,
        voice: voiceId,
        speakerId: 0,
      },
      {
        timeout: 30000,
        responseType: 'arraybuffer',
      }
    );

    // Convert audio buffer to base64
    const audioBase64 = Buffer.from(response.data).toString('base64');

    return {
      audioBase64,
      provider: 'piper',
      success: true,
    };
  } catch (error) {
    console.error('[Piper TTS Error]', error);
    return {
      provider: 'piper',
      success: false,
      error: error instanceof Error ? error.message : 'Piper TTS failed',
    };
  }
}

/**
 * Synthesize speech using Web Speech API (browser-side)
 * This is a fallback for browsers that don't support Piper
 */
export function synthesizeWithWebSpeech(options: TTSOptions): TTSResponse {
  try {
    // This function returns a response indicating Web Speech API should be used
    // The actual synthesis happens on the client side
    return {
      provider: 'webspeech',
      success: true,
    };
  } catch (error) {
    console.error('[Web Speech API Error]', error);
    return {
      provider: 'webspeech',
      success: false,
      error: error instanceof Error ? error.message : 'Web Speech API failed',
    };
  }
}

/**
 * Unified TTS synthesis function
 * Tries Piper first, falls back to Web Speech API
 */
export async function synthesizeSpeech(options: TTSOptions): Promise<TTSResponse> {
  const provider = options.provider || 'piper';

  if (provider === 'piper') {
    const result = await synthesizeWithPiper(options);
    if (result.success) {
      return result;
    }
    // Fall back to Web Speech API if Piper fails
    console.warn('Piper TTS failed, falling back to Web Speech API');
    return synthesizeWithWebSpeech(options);
  }

  return synthesizeWithWebSpeech(options);
}

/**
 * Get voice details by ID
 */
export function getVoiceById(voiceId: string): TTSVoice | undefined {
  return getAvailableVoices().find((v) => v.id === voiceId);
}

/**
 * Get voices by language
 */
export function getVoicesByLanguage(language: string): TTSVoice[] {
  return getAvailableVoices().filter((v) => v.language === language);
}

/**
 * Get voices by provider
 */
export function getVoicesByProvider(provider: TTSProvider): TTSVoice[] {
  return getAvailableVoices().filter((v) => v.provider === provider);
}
