/**
 * Text-to-Speech Service
 * Handles conversion of text to speech using Manus built-in TTS API
 */

import { ENV } from './env';

export interface TTSOptions {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export interface TTSResponse {
  audioUrl: string;
  duration?: number;
  format: string;
}

/**
 * Convert text to speech using Manus TTS API
 */
export async function textToSpeech(options: TTSOptions): Promise<TTSResponse> {
  const {
    text,
    voice = 'nova',
    speed = 1.0,
    format = 'mp3'
  } = options;

  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  // Check if API is configured
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    throw new Error('TTS API is not configured');
  }

  if (text.length > 4096) {
    throw new Error('Text exceeds maximum length of 4096 characters');
  }

  if (speed < 0.25 || speed > 4.0) {
    throw new Error('Speed must be between 0.25 and 4.0');
  }

  try {
    // Call Manus TTS API
    const response = await fetch(`${ENV.forgeApiUrl}/tts/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        text: text.trim(),
        voice,
        speed,
        response_format: format,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[TTS Error]', error);
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Create object URL for the audio
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audioUrl,
      format,
    };
  } catch (error) {
    console.error('[TTS Service Error]', error);
    throw error;
  }
}

/**
 * Get available voices
 */
export function getAvailableVoices() {
  return [
    { id: 'alloy', name: 'Alloy', description: 'Balanced voice' },
    { id: 'echo', name: 'Echo', description: 'Deep, resonant voice' },
    { id: 'fable', name: 'Fable', description: 'Warm, friendly voice' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice' },
    { id: 'nova', name: 'Nova', description: 'Clear, bright voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle voice' },
  ];
}

/**
 * Get available speed options
 */
export function getSpeedOptions() {
  return [
    { value: 0.5, label: '0.5x (Slow)' },
    { value: 0.75, label: '0.75x' },
    { value: 1.0, label: '1.0x (Normal)' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x (Fast)' },
    { value: 2.0, label: '2.0x (Very Fast)' },
  ];
}
